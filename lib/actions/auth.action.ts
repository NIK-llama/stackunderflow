"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { SignInSchema, SignUpSchema } from "../validations";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { NotFoundError } from "../http-errors";

export async function signUpWithCredentials(
  params: AuthCredentials,
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params!;

  try {
    await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        const message =
          existingUser.email === email
            ? "User already exists"
            : "Username already exists";
        throw new Error(message);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await tx.user.create({
        data: {
          name,
          username,
          email,
          accounts: {
            create: {
              name,
              provider: "credentials",
              providerAccountId: email,
              password: hashedPassword,
            },
          },
        },
      });
    });

    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">,
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, password } = validationResult.params!;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: {
            provider: "credentials",
          },
        },
      },
    });

    if (!user) throw new NotFoundError("User");

    const credentialsAccount = user.accounts[0];

    if (!credentialsAccount || !credentialsAccount.password) {
      throw new Error("Invalid login method or account not found");
    }

    const passwordMatch = await bcrypt.compare(
      password,
      credentialsAccount.password,
    );

    if (!passwordMatch) throw new Error("Password does not match");

    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
