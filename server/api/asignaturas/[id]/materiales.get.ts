// server/api/asignaturas/[id]/materiales.get.ts
import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    const materiales = await prisma.material.findMany({
      where: { idAsignatura: parseInt(id!) },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        creadoEn: true,
        url: true, // Asegúrate de incluir este campo
      },
    });

    return materiales;
  } catch (error) {
    console.error("Error al obtener materiales:", error);
    return { error: "Error interno del servidor" };
  }
});
