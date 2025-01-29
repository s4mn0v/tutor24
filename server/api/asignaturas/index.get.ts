// server/api/asignaturas/index.get.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const asignaturas = await prisma.asignatura.findMany({
      include: {
        estudiantes: true,
      },
    });
    return asignaturas;
  } catch (error) {
    console.error("Error al obtener las asignaturas:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al obtener las asignaturas",
    });
  }
});
