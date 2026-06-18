"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Question,
} from "@/types/global";
import action from "../handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
  DeleteQuestionSchema,
} from "../validations";
import handleError from "../handlers/error";
import prisma from "../prisma";
import { after } from "next/server";
import { cache } from "react";
import { Prisma } from "@/app/generated/prisma/client";
import {
  CreateQuestionParams,
  EditQuestionParams,
  GetQuestionParams,
  IncrementViewsParams,
  DeleteQuestionParams,
  RecommendationParams,
} from "@/types/action";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { createInteraction } from "./interaction.action";
import { auth } from "@/auth";

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const question = await prisma.$transaction(async (tx) => {
      const newQuestion = await tx.question.create({
        data: {
          title,
          content,
          authorId: userId as string,
          tags: {
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag.trim().toLowerCase() },
              create: { name: tag.trim().toLowerCase() },
            })),
          },
        },
        include: {
          tags: true,
        },
      });

      return newQuestion;
    });

    after(async () => {
      await createInteraction({
        action: "post",
        actionId: question.id,
        actionTarget: "question",
        authorId: userId as string,
      });
    });

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function editQuestion(
  params: EditQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      const existingQuestion = await tx.question.findUnique({
        where: { id: questionId },
        select: { authorId: true },
      });

      if (!existingQuestion) throw new Error("Question not found");
      if (existingQuestion.authorId !== userId) {
        throw new Error("You are not authorized to edit this question");
      }

      return await tx.question.update({
        where: { id: questionId },
        data: {
          title,
          content,
          tags: {
            set: [],
            connectOrCreate: tags.map((tag: string) => ({
              where: { name: tag.trim().toLowerCase() },
              create: { name: tag.trim().toLowerCase() },
            })),
          },
        },
        include: {
          tags: true,
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { answers: true } },
        },
      });
    });

    const flattenedUpdatedQuestion = {
      ...updatedQuestion,
      answers: updatedQuestion._count.answers,
    };

    return {
      success: true,
      data: JSON.parse(JSON.stringify(flattenedUpdatedQuestion)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export const getQuestion = cache(async function getQuestion(
  params: GetQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },

        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) throw new Error("Question not found");

    const flattenedQuestion = {
      ...question,
      answers: question._count.answers,
    };

    return {
      success: true,
      data: JSON.parse(JSON.stringify(flattenedQuestion)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
});

export async function getRecommendedQuestions({
  userId,
  query,
  skip,
  limit,
}: RecommendationParams) {
  try {
    const interactions = await prisma.interaction.findMany({
      where: {
        userId,
        action: {
          in: ["VIEW", "UPVOTE", "BOOKMARK", "POST"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { questionId: true },
    });

    const interactedQuestionIds = interactions
      .map((i) => i.questionId)
      .filter((id): id is string => id !== null);

    const interactedQuestions = await prisma.question.findMany({
      where: {
        id: { in: interactedQuestionIds },
      },
      select: {
        tags: {
          select: { id: true },
        },
      },
    });

    const allTagIds = interactedQuestions.flatMap((q) =>
      q.tags.map((tag) => tag.id),
    );

    const uniqueTagIds = [...new Set(allTagIds)];

    const where: Prisma.QuestionWhereInput = {
      id: { notIn: interactedQuestionIds },
      authorId: { not: userId },
    };

    if (uniqueTagIds.length > 0) {
      where.tags = {
        some: {
          id: { in: uniqueTagIds },
        },
      };
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    const [questions, total] = await prisma.$transaction([
      prisma.question.findMany({
        where,
        include: {
          tags: { select: { id: true, name: true } },
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { answers: true } },
        },
        orderBy: [
          { upvotes: "desc" },
          { views: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    const flattenedQuestions = questions.map((q) => ({
      ...q,
      answers: q._count.answers,
    }));

    return {
      questions: JSON.parse(JSON.stringify(flattenedQuestions)),
      isNext: total > skip + questions.length,
    };
  } catch (error) {
    console.error("Failed to get recommended questions", error);
    return { questions: [], isNext: false };
  }
}

export async function getQuestions(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    questions: Question[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  if (filter === "recommended") {
    try {
      const session = await auth();
      const userId = session?.user?.id;

      if (!userId) {
        return { success: true, data: { questions: [], isNext: false } };
      }

      const recommended = await getRecommendedQuestions({
        userId,
        query,
        skip,
        limit: take,
      });

      return { success: true, data: recommended };
    } catch (error) {
      return handleError(error) as ErrorResponse;
    }
  }

  const where: Prisma.QuestionWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.QuestionOrderByWithRelationInput = { createdAt: "desc" };

  switch (filter) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "unanswered":
      // In Prisma, we check if the relation array is empty
      where.answers = { none: {} };
      orderBy = { createdAt: "desc" };
      break;
    case "popular":
      orderBy = { upvotes: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [questions, totalQuestions] = await prisma.$transaction([
      prisma.question.findMany({
        where,
        include: {
          tags: { select: { id: true, name: true } },
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { answers: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.question.count({ where }),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    const flattenedQuestions = questions.map((q) => ({
      ...q,
      answers: q._count.answers,
    }));

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(flattenedQuestions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementViews(
  params: IncrementViewsParams,
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      data: { views: updatedQuestion.views },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    const questions = await prisma.question.findMany({
      orderBy: [
        { views: "desc" },
        { upvotes: "desc" },
      ],
      take: 5,
      include: {
        tags: { select: { id: true, name: true } },
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { answers: true } },
      },
    });

    const flattenedQuestions = questions.map((q) => ({
      ...q,
      answers: q._count.answers,
    }));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(flattenedQuestions)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { authorId: true },
    });

    if (!question) throw new Error("Question not found");

    if (question.authorId !== userId) {
      throw new Error("You are not authorized to delete this question");
    }

    // Prisma relation onDelete: Cascade handles deleting associated answers, collections, votes, and interactions
    await prisma.question.delete({
      where: { id: questionId },
    });

    // Log the interaction
    after(async () => {
      await createInteraction({
        action: "delete",
        actionId: questionId,
        actionTarget: "question",
        authorId: question.authorId,
      });
    });

    revalidatePath(`/profile/${userId}`);
    revalidatePath(ROUTES.HOME);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}


