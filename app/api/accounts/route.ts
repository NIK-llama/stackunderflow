import handleError from "@/lib/handlers/error";
import { ForbiddenError } from "@/lib/http-errors";
import prisma from "@/lib/prisma";
import { AccountSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany();
    return NextResponse.json(
      { success: true, data: accounts },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = AccountSchema.parse(body);

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: validatedData.provider,
        providerAccountId: validatedData.providerAccountId,
      },
    });

    if (existingAccount) {
      throw new ForbiddenError(
        "An account with the same provider already exists",
      );
    }

    const newAccount = await prisma.account.create({
      data: validatedData,
    });

    return NextResponse.json(
      { success: true, data: newAccount },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
