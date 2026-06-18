"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import prisma from "../prisma";
import { CreateInteractionSchema } from "../validations";
import { CreateInteractionParams } from "@/types/action";
import { Interaction, InteractionType, Prisma } from "@/app/generated/prisma/client";

export async function createInteraction(
  params: CreateInteractionParams,
): Promise<ActionResponse<Interaction>> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId,
  } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    const interaction = await prisma.$transaction(async (tx) => {
      // 1. Create the interaction
      const newInteraction = await tx.interaction.create({
        data: {
          userId,
          action: actionType.toUpperCase() as InteractionType,
          questionId:
            actionTarget === "question" && actionType !== "delete"
              ? actionId
              : null,
          answerId:
            actionTarget === "answer" && actionType !== "delete"
              ? actionId
              : null,
        },
      });

      // 2. Update the reputation
      await updateReputation({
        tx,
        action: actionType,
        actionTarget,
        performerId: userId,
        authorId,
      });

      return newInteraction;
    });

    return { success: true, data: JSON.parse(JSON.stringify(interaction)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

interface UpdateReputationParams {
  tx: Prisma.TransactionClient;
  action: string;
  actionTarget: "question" | "answer";
  performerId: string;
  authorId: string;
}

async function updateReputation({
  tx,
  action,
  actionTarget,
  performerId,
  authorId,
}: UpdateReputationParams) {
  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;
    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;
    case "post":
      authorPoints = actionTarget === "question" ? 5 : 10;
      break;
    case "delete":
      authorPoints = actionTarget === "question" ? -5 : -10;
      break;
    default:
      break;
  }

  if (performerId === authorId) {
    await tx.user.update({
      where: { id: performerId },
      data: { reputation: { increment: authorPoints } },
    });
    return;
  }

  await tx.user.update({
    where: { id: performerId },
    data: { reputation: { increment: performerPoints } },
  });

  await tx.user.update({
    where: { id: authorId },
    data: { reputation: { increment: authorPoints } },
  });
}
