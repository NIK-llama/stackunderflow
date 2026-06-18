"use server";

import { Answer as PrismaAnswer } from "@/app/generated/prisma/client";
import { CreateAnswerParams, GetAnswersParams, DeleteAnswerParams } from "@/types/action";
import { ActionResponse, Answer, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { AnswerServerSchema, GetAnswersSchema, DeleteAnswerSchema } from "../validations";
import handleError from "../handlers/error";
import prisma from "../prisma";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { createInteraction } from "./interaction.action";

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<PrismaAnswer>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const questionExists = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!questionExists) {
      throw new Error("Question not found");
    }

    const newAnswer = await prisma.$transaction(async (tx) => {
      const answer = await tx.answer.create({
        data: {
          content,
          authorId: userId as string,
          questionId: questionId,
        },
      });

      return answer;
    });

    // log the interaction
    after(async () => {
      await createInteraction({
        action: "post",
        actionId: newAnswer.id,
        actionTarget: "answer",
        authorId: userId as string,
      });
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: Answer[];
    isNext: boolean;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId, page = 1, pageSize = 10, filter } = validationResult.params!;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  let orderBy = {};

  switch (filter) {
    case "latest":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "popular":
      orderBy = { upvotes: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [answers, totalAnswers] = await prisma.$transaction([
      prisma.answer.findMany({
        where: { questionId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.answer.count({
        where: { questionId },
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
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { answerId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { authorId: true, questionId: true },
    });

    if (!answer) throw new Error("Answer not found");

    if (answer.authorId !== userId) {
      throw new Error("You're not allowed to delete this answer");
    }

    // Prisma relation onDelete: Cascade handles deleting associated votes and interactions
    await prisma.answer.delete({
      where: { id: answerId },
    });

    // Log the interaction
    after(async () => {
      await createInteraction({
        action: "delete",
        actionId: answerId,
        actionTarget: "answer",
        authorId: answer.authorId,
      });
    });

    revalidatePath(`/profile/${userId}`);
    revalidatePath(ROUTES.QUESTION(answer.questionId));

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

