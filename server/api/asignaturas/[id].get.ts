// server/api/asignaturas/[id].get.ts
import { PrismaClient } from "@prisma/client";
import { H3Event, defineEventHandler } from "h3"; // Import the necessary functions

const prisma = new PrismaClient();

export default defineEventHandler(async (event: H3Event) => {
  const id = Number(event.context.params?.id);

  try {
    const asignatura = await prisma.asignatura.findUnique({
      where: { id },
      include: {
        estudiantes: true,
      },
    });

    if (!asignatura) {
      throw createError({
        statusCode: 404,
        message: "Asignatura no encontrada",
      });
    }

    return {
      ...asignatura,
      inscritos: asignatura.estudiantes.length,
      estudiantes: undefined, // No enviamos la lista de estudiantes al cliente
    };
  } catch (error) {
    console.error("Error obteniendo la asignatura:", error);
    throw createError({
      statusCode: 500,
      message: "Error obteniendo la asignatura",
    });
  } finally {
    await prisma.$disconnect();
  }
});
