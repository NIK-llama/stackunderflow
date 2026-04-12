"use server";

import { ActionResponse, ErrorResponse, Question } from "@/types/global";
import action from "../handlers/action";
import { AskQuestionSchema } from "../validations";
import handleError from "../handlers/error";
import prisma from "../prisma";
import { after } from "next/server";

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
