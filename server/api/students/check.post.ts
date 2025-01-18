// server/api/students/check.post.ts
import { defineEventHandler, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Leer el cuerpo de la solicitud
  const body = await readBody(event);
  const { correo } = body;

  if (!correo) {
    return { exists: false };
  }

  try {
    // Buscar el estudiante en la base de datos
    const student = await prisma.estudiante.findUnique({
      where: { correo },
    });

    // Devolver si el estudiante existe o no
    return { exists: !!student };
  } catch (error) {
    console.error("Error checking student:", error);
    return { exists: false };
  }
});
