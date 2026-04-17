"use server";

import { ActionResponse, ErrorResponse, Question } from "@/types/global";
import action from "../handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
} from "../validations";
import handleError from "../handlers/error";
import prisma from "../prisma";
import { after } from "next/server";
import { cache } from "react";

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

    // after(async () => {
    //   await createInteraction({
    //     userId: userId as string,
    //     questionId: question.id,
    //     action: "POST",
    //   });
    // });

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
        },
      });
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedQuestion)),
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
      },
    });

    if (!question) throw new Error("Question not found");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
});
