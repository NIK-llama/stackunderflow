"use server";

import { Answer } from "@/app/generated/prisma/client";
import { CreateAnswerParams } from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { AnswerServerSchema } from "../validations";
import handleError from "../handlers/error";
import prisma from "../prisma";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function createAnswer(
  params: CreateAnswerParams,
): Promise<ActionResponse<Answer>> {
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
      try {
        await prisma.interaction.create({
          data: {
            userId: userId as string,
            answerId: newAnswer.id,
            action: "POST",
          },
        });
      } catch (error) {
        console.error("Failed to log interaction", error);
      }
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(newAnswer)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
