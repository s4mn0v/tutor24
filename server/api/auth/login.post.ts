import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { defineEventHandler, readBody, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  try {
    // Buscar usuario en la tabla 'usuario'
    const usuario = await prisma.usuario.findUnique({
      where: { correo: email },
      select: { id: true, contrasena: true, rol: true },
    });

    if (usuario) {
      const isPasswordValid = await bcrypt.compare(password, usuario.contrasena);
      if (!isPasswordValid) {
        throw createError({ statusCode: 401, message: "Credenciales incorrectas" });
      }

      // Generar token JWT
      const token = jwt.sign(
        { userId: usuario.id, role: usuario.rol },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1h" }
      );

      return { token, role: usuario.rol };
    }

    // Buscar usuario en la tabla 'estudiante' si no es encontrado en 'usuario'
    const estudiante = await prisma.estudiante.findUnique({
      where: { correo: email },
      select: { id: true, contrasena: true },
    });

    if (estudiante) {
      const isPasswordValid = await bcrypt.compare(password, estudiante.contrasena);
      if (!isPasswordValid) {
        throw createError({ statusCode: 401, message: "Credenciales incorrectas" });
      }

      const token = jwt.sign(
        { userId: estudiante.id, role: "ESTUDIANTE" },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "1h" }
      );

      return { token, role: "ESTUDIANTE" };
    }

    throw createError({ statusCode: 401, message: "Credenciales incorrectas" });
  } catch (error) {
    console.error("Error en el login:", error);
    throw createError({ statusCode: 500, message: "Error interno del servidor" });
  }
});
