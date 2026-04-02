import { NextResponse } from "next/server";
import { UserSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import handleError from "@/lib/handlers/error";
import { APIResponse } from "@/types/global";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const validatedData = UserSchema.partial().safeParse({ email });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.data.email,
      },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });

  } catch (error) {
    return handleError(error, "api") as APIResponse;
  }
}