import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import action from "../handlers/action";
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import handleError from "../handlers/error";
import { Prisma, Question, Tag } from "@/app/generated/prisma/client";
import prisma from "../prisma";
import { GetTagQuestionsParams } from "@/types/action";

export type FlattenedTag = Tag & { questions: number };
export type FlattenedQuestion = Question & {
  author: { id: string; name: string; image: string | null };
  tags: { id: string; name: string }[];
  answers: number;
};


export const getTags = async (
  params: PaginatedSearchParams,
): Promise<ActionResponse<{ tags: FlattenedTag[]; isNext: boolean }>> => {
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

  const where: Prisma.TagWhereInput = query
    ? { name: { contains: query, mode: "insensitive" } }
    : {};

  let orderBy: Prisma.TagOrderByWithRelationInput = {
    questions: { _count: "desc" },
  };

  switch (filter) {
    case "popular":
      orderBy = { questions: { _count: "desc" } };
      break;
    case "recent":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { questions: { _count: "desc" } };
      break;
  }

  try {
    const [tags, totalTags] = await prisma.$transaction([
      prisma.tag.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          _count: {
            select: { questions: true },
          },
        },
      }),
      prisma.tag.count({ where }),
    ]);

    const flattenedTags: FlattenedTag[] = tags.map((tag) => ({
      ...tag,
      questions: tag._count.questions,
    }));

    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(flattenedTags)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getTagQuestions = async (
  params: GetTagQuestionsParams
): Promise<
  ActionResponse<{ tag: Tag; questions: FlattenedQuestion[]; isNext: boolean }>
> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { tagId, page = 1, pageSize = 10, query } = validationResult.params!;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) throw new Error("Tag not found");

    const where: Prisma.QuestionWhereInput = {
      tags: {
        some: { id: tagId },
      },
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      }),
    };

    const [questions, totalQuestions] = await prisma.$transaction([
      prisma.question.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          tags: { select: { id: true, name: true } },
          _count: { select: { answers: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.question.count({ where }),
    ]);

    const flattenedQuestions: FlattenedQuestion[] = questions.map((q) => ({
      ...q,
      answers: q._count.answers,
    }));

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(flattenedQuestions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};