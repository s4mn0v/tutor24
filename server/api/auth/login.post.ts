// server/api/auth/login.post.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { defineEventHandler, readBody, createError } from 'h3'; // Assuming h3 is used for event handling

const prisma = new PrismaClient();

interface LoginRequest {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  const body: LoginRequest = await readBody(event);
  const { email, password } = body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { correo: email },
      select: {
        id: true,
        contrasena: true,
        rol: true,
      },
    });

    if (!user) {
      return createError({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.contrasena);

    if (!isPasswordValid) {
      return createError({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.rol },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1h" }
    );

    return { token, role: user.rol };
  } catch (error) {
    console.error("Login error:", error);
    return createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
