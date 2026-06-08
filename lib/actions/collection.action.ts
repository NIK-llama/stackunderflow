"use server";

import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import prisma from "@/lib/prisma";
import { ActionResponse, ErrorResponse } from "@/types/global";
import { CollectionBaseParams } from "@/types/action";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CollectionBaseSchema } from "../validations";

export async function toggleSaveQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
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
    });
    if (!question) throw new Error("Question not found");

    const collection = await prisma.collection.findFirst({
      where: {
        questionId,
        userId: userId as string,
      },
    });

    if (collection) {
      await prisma.collection.delete({
        where: {
          id: collection.id,
        },
      });

      revalidatePath(ROUTES.QUESTION(questionId));

      return {
        success: true,
        data: {
          saved: false,
        },
      };
    }

    await prisma.collection.create({
      data: {
        questionId,
        userId: userId as string,
      },
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: {
        saved: true,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const collection = await prisma.collection.findFirst({
      where: {
        questionId,
        userId: userId as string,
      },
    });

    return {
      success: true,
      data: {
        saved: !!collection,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
