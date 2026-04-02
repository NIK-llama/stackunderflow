import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import prisma from "@/lib/prisma";
import { UserSchema } from "@/lib/validations";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("User");

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundError("User");

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("User");

  try {
    const user = await prisma.user.delete({
      where: { id },
    });

    if (!user) throw new NotFoundError("User");

    return NextResponse.json({ success: true, data: user }, { status: 204 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("User");

  try {
    const body = await request.json();
    const validatedData = UserSchema.partial().parse(body);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    });

    if (!updatedUser) throw new NotFoundError("User");

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
