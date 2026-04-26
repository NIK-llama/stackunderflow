import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import action from "../handlers/action";
import { PaginatedSearchParamsSchema } from "../validations";
import handleError from "../handlers/error";
import { Prisma, Tag } from "@/app/generated/prisma/client";
import prisma from "../prisma";

export const getTags = async (
  params: PaginatedSearchParams
): Promise<ActionResponse<{ tags: Tag[]; isNext: boolean }>> => {
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
    questions: { _count: "desc" } 
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
            select: { questions: true }
          }
        }
      }),
      prisma.tag.count({ where }),
    ]);

    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};