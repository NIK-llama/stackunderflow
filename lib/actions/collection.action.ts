"use server";

import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import {
  ActionResponse,
  Collection,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import { CollectionBaseParams } from "@/types/action";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CollectionBaseSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

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

export async function getSavedQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ collection: Collection[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const userId = validationResult.session?.user?.id;
  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.CollectionWhereInput = {
    userId: userId as string,
  };

  if (query) {
    where.question = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    };
  }

  let orderBy: Prisma.CollectionOrderByWithRelationInput = {
    question: {
      createdAt: "desc",
    },
  };

  switch (filter) {
    case "mostrecent":
      orderBy = { question: { createdAt: "desc" } };
      break;
    case "oldest":
      orderBy = { question: { createdAt: "asc" } };
      break;
    case "mostvoted":
      orderBy = { question: { upvotes: "desc" } };
      break;
    case "mostviewed":
      orderBy = { question: { views: "desc" } };
      break;
    case "mostanswered":
      orderBy = {
        question: {
          answers: {
            _count: "desc",
          },
        },
      };
      break;
    default:
      orderBy = { question: { createdAt: "desc" } };
      break;
  }

  try {
    const [collections, totalCollections] = await prisma.$transaction([
      prisma.collection.findMany({
        where,
        include: {
          question: {
            include: {
              tags: { select: { id: true, name: true } },
              author: { select: { id: true, name: true, image: true } },
              _count: { select: { answers: true } },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.collection.count({ where }),
    ]);

    const isNext = totalCollections > skip + collections.length;

    const mappedCollections: Collection[] = collections.map((col) => {
      const q = col.question;
      return {
        id: col.id,
        author: col.userId,
        question: {
          id: q.id,
          title: q.title,
          content: q.content,
          tags: q.tags,
          author: {
            id: q.author.id,
            name: q.author.name,
            image: q.author.image || "",
          },
          createdAt: q.createdAt,
          upvotes: q.upvotes,
          downvotes: q.downvotes,
          views: q.views,
          answers: q._count.answers,
        },
      };
    });

    return {
      success: true,
      data: {
        collection: JSON.parse(JSON.stringify(mappedCollections)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

