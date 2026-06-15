"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Question,
  Answer,
} from "@/types/global";
import { User, Prisma } from "@/app/generated/prisma/client";
import prisma from "../prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  PaginatedSearchParamsSchema,
  GetUserSchema,
  GetUserQuestionsSchema,
  GetUsersAnswersSchema,
  GetUserTagsSchema,
} from "../validations";
import {
  GetUserParams,
  GetUserQuestionsParams,
  GetUserAnswersParams,
  GetUserTagsParams,
} from "@/types/action";


export async function getUsers(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    users: User[];
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

  const where: Prisma.UserWhereInput = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

  switch (filter) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "popular":
      orderBy = { reputation: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(
  params: GetUserParams,
): Promise<ActionResponse<{ user: User }>> {
  const validationResult = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserQuestions(params: GetUserQuestionsParams): Promise<
  ActionResponse<{
    questions: Question[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, userId } = validationResult.params!;

  const skip = (Number(page) - 1) * pageSize;
  const take = pageSize;

  try {
    const [questions, totalQuestions] = await prisma.$transaction([
      prisma.question.findMany({
        where: { authorId: userId },
        include: {
          tags: { select: { id: true, name: true } },
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { answers: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.question.count({
        where: { authorId: userId },
      }),
    ]);

    const isNext = totalQuestions > skip + questions.length;

    const formattedQuestions: Question[] = questions.map((q) => ({
      id: q.id,
      title: q.title,
      content: q.content,
      tags: q.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
      author: {
        id: q.author.id,
        name: q.author.name,
        image: q.author.image || "",
      },
      createdAt: q.createdAt,
      upvotes: q.upvotes,
      downvotes: q.downvotes,
      answers: q._count.answers,
      views: q.views,
    }));

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(formattedQuestions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserAnswers(params: GetUserAnswersParams): Promise<
  ActionResponse<{
    answers: Answer[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUsersAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, userId } = validationResult.params!;

  const skip = (Number(page) - 1) * pageSize;
  const take = pageSize;

  try {
    const [answers, totalAnswers] = await prisma.$transaction([
      prisma.answer.findMany({
        where: { authorId: userId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.answer.count({
        where: { authorId: userId },
      }),
    ]);

    const isNext = totalAnswers > skip + answers.length;

    const formattedAnswers: Answer[] = answers.map((answer) => ({
      id: answer.id,
      content: answer.content,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
      createdAt: answer.createdAt,
      author: {
        id: answer.author.id,
        name: answer.author.name,
        image: answer.author.image || "",
      },
      question: answer.questionId,
    }));

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(formattedAnswers)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserTopTags(
  params: GetUserTagsParams
): Promise<
  ActionResponse<{ tags: { _id: string; name: string; count: number }[] }>
> {
  const validationResult = await action({
    params,
    schema: GetUserTagsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const userQuestions = await prisma.question.findMany({
      where: { authorId: userId },
      select: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const tagCounts: Record<string, { _id: string; name: string; count: number }> = {};

    for (const question of userQuestions) {
      for (const tag of question.tags) {
        if (tagCounts[tag.id]) {
          tagCounts[tag.id].count += 1;
        } else {
          tagCounts[tag.id] = { _id: tag.id, name: tag.name, count: 1 };
        }
      }
    }

    const tags = Object.values(tagCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}


