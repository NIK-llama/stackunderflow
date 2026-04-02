import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import prisma from "@/lib/prisma";
import { UserSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = UserSchema.safeParse(body);

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { email, username } = validatedData.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const message = existingUser.email === email ? "Email already exists" : "Username already exists";
      throw new Error(message);
    }

    const newUser = await prisma.user.create({
      data: validatedData.data,
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
