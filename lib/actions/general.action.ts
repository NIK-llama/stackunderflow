"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import { GlobalSearchParams } from "@/types/action";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { GlobalSearchSchema } from "../validations";
import prisma from "../prisma";

export async function globalSearch(
  params: GlobalSearchParams
): Promise<ActionResponse<any>> {
  try {
    const validationResult = await action({
      params,
      schema: GlobalSearchSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { query, type } = validationResult.params!;
    const typeLower = type?.toLowerCase();

    const SearchableTypes = ["question", "answer", "user", "tag"];
    let results: { title: string; type: string; id: string }[] = [];

    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      // Search in all models
      
      // Question
      const questions = await prisma.question.findMany({
        where: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 2,
      });
      results.push(
        ...questions.map((item) => ({
          title: item.title,
          type: "question",
          id: item.id,
        }))
      );

      // User
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 2,
      });
      results.push(
        ...users.map((item) => ({
          title: item.name,
          type: "user",
          id: item.id,
        }))
      );

      // Answer
      const answers = await prisma.answer.findMany({
        where: {
          content: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 2,
      });
      results.push(
        ...answers.map((item) => ({
          title: `Answers containing ${query}`,
          type: "answer",
          id: item.questionId,
        }))
      );

      // Tag
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        take: 2,
      });
      results.push(
        ...tags.map((item) => ({
          title: item.name,
          type: "tag",
          id: item.id,
        }))
      );

    } else {
      // Search in the specified model type
      if (typeLower === "question") {
        const queryResults = await prisma.question.findMany({
          where: {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 8,
        });
        results = queryResults.map((item) => ({
          title: item.title,
          type: "question",
          id: item.id,
        }));
      } else if (typeLower === "user") {
        const queryResults = await prisma.user.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 8,
        });
        results = queryResults.map((item) => ({
          title: item.name,
          type: "user",
          id: item.id,
        }));
      } else if (typeLower === "answer") {
        const queryResults = await prisma.answer.findMany({
          where: {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 8,
        });
        results = queryResults.map((item) => ({
          title: `Answers containing ${query}`,
          type: "answer",
          id: item.questionId,
        }));
      } else if (typeLower === "tag") {
        const queryResults = await prisma.tag.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 8,
        });
        results = queryResults.map((item) => ({
          title: item.name,
          type: "tag",
          id: item.id,
        }));
      }
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(results)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
