import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import prisma from "@/lib/prisma";
import { AccountSchema } from "@/lib/validations";
import { APIResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { providerAccountId } = await request.json();

    const validatedData = AccountSchema.partial().safeParse({ providerAccountId });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const account = await prisma.account.findFirst({
      where: {
        providerAccountId: validatedData.data.providerAccountId,
      },
    });

    if (!account) {
      throw new NotFoundError("Account");
    }

    return NextResponse.json({ success: true, data: account }, { status: 200 });

  } catch (error) {
    return handleError(error, "api") as APIResponse;
  }
}