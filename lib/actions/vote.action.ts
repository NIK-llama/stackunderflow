"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import ROUTES from "@/constants/routes";

import prisma from "@/lib/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validations";
// import { createInteraction } from "./interaction.action";
import { PrismaClient } from "@/app/generated/prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
import { ActionResponse, ErrorResponse } from "@/types/global";
import {
  CreateVoteParams,
  HasVotedParams,
  HasVotedResponse,
  UpdateVoteCountParams,
} from "@/types/action";

async function updateVoteCount(
  params: UpdateVoteCountParams,
  tx: TransactionClient,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    if (targetType === "question") {
      const result = await tx.question.update({
        where: { id: targetId },
        data: { [voteField]: { increment: change } },
      });
      if (!result) throw new Error("Failed to update vote count");
    } else {
      const result = await tx.answer.update({
        where: { id: targetId },
        data: { [voteField]: { increment: change } },
      });
      if (!result) throw new Error("Failed to update vote count");
    }

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams,
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  try {
    await prisma.$transaction(async (tx) => {
      // let contentAuthorId: string;

      if (targetType === "question") {
        const question = await tx.question.findUnique({
          where: { id: targetId },
        });
        if (!question) throw new Error("Content not found");
        // contentAuthorId = question.authorId;
      } else {
        const answer = await tx.answer.findUnique({
          where: { id: targetId },
        });
        if (!answer) throw new Error("Content not found");
        // contentAuthorId = answer.authorId;
      }

      const existingVote = await tx.vote.findFirst({
        where: {
          userId,
          ...(targetType === "question"
            ? { questionId: targetId }
            : { answerId: targetId }),
        },
      });

      const prismaVoteType = voteType === "upvote" ? "UPVOTE" : "DOWNVOTE";

      if (existingVote) {
        if (existingVote.type === prismaVoteType) {
          // If user is voting again with the same vote type, remove the vote
          await tx.vote.delete({
            where: { id: existingVote.id },
          });

          await updateVoteCount(
            {
              targetId,
              targetType,
              voteType,
              change: -1,
            },
            tx,
          );
        } else {
          // If user is changing their vote, update voteType and adjust counts
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { type: prismaVoteType },
          });

          await updateVoteCount(
            {
              targetId,
              targetType,
              voteType: existingVote.type === "UPVOTE" ? "upvote" : "downvote",
              change: -1,
            },
            tx,
          );

          await updateVoteCount(
            {
              targetId,
              targetType,
              voteType,
              change: 1,
            },
            tx,
          );
        }
      } else {
        // First-time vote creation
        await tx.vote.create({
          data: {
            userId,
            ...(targetType === "question"
              ? { questionId: targetId }
              : { answerId: targetId }),
            type: prismaVoteType,
          },
        });

        await updateVoteCount(
          {
            targetId,
            targetType,
            voteType,
            change: 1,
          },
          tx,
        );
      }

      // log the interaction
      //   after(async () => {
      //     await createInteraction({
      //       action: voteType,
      //       actionId: targetId,
      //       actionTarget: targetType,
      //       authorId: contentAuthorId,
      //     });
      //   });
    });

    revalidatePath(ROUTES.QUESTION(targetId));

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasVoted(
  params: HasVotedParams,
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    if (!userId) {
      return {
        success: false,
        data: {
          hasUpvoted: false,
          hasDownvoted: false,
        },
      };
    }

    const vote = await prisma.vote.findFirst({
      where: {
        userId,
        ...(targetType === "question"
          ? { questionId: targetId }
          : { answerId: targetId }),
      },
    });

    if (!vote)
      return {
        success: false,
        data: {
          hasUpvoted: false,
          hasDownvoted: false,
        },
      };

    return {
      success: true,
      data: {
        hasUpvoted: vote.type === "UPVOTE",
        hasDownvoted: vote.type === "DOWNVOTE",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
