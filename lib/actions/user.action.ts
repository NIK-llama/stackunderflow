"use server";

import { ActionResponse, ErrorResponse, PaginatedSearchParams } from "@/types/global";
import { User, Prisma } from "@/app/generated/prisma/client";
import prisma from "../prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { PaginatedSearchParamsSchema } from "../validations";

export async function getUsers(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    users: User[];
    isNext: boolean;
  }>
> {
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

  const where: Prisma.UserWhereInput = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };

  switch (filter) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "popular":
      orderBy = { reputation: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: {
        users: JSON.parse(JSON.stringify(users)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
