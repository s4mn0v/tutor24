// server/api/auth/login.post.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { defineEventHandler, readBody, createError } from "h3";

const prisma = new PrismaClient();

interface LoginRequest {
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  const body: LoginRequest = await readBody(event);
  const { email, password } = body;

  try {
    // Check in Usuario table
    const usuario = await prisma.usuario.findUnique({
      where: { correo: email },
      select: {
        id: true,
        contrasena: true,
        rol: true,
      },
    });

    if (usuario) {
      const isPasswordValid = await bcrypt.compare(
        password,
        usuario.contrasena
      );
      if (!isPasswordValid) {
        return createError({
          statusCode: 401,
          message: "Invalid credentials",
        });
      }
      const token = jwt.sign(
        { userId: usuario.id, role: usuario.rol },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1h" }
      );
      return { token, role: usuario.rol };
    }

    // Check in Estudiante table
    const estudiante = await prisma.estudiante.findUnique({
      where: { correo: email },
      select: {
        id: true,
        contrasena: true,
      },
    });

    if (estudiante) {
      const isPasswordValid = await bcrypt.compare(
        password,
        estudiante.contrasena
      );
      if (!isPasswordValid) {
        return createError({
          statusCode: 401,
          message: "Invalid credentials",
        });
      }
      const token = jwt.sign(
        { userId: estudiante.id, role: "ESTUDIANTE" },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1h" }
      );
      return { token, role: "ESTUDIANTE" };
    }

    return createError({
      statusCode: 401,
      message: "Invalid credentials",
    });
  } catch (error) {
    console.error("Login error:", error);
    return createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
