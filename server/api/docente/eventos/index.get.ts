// server/api/docente/eventos/index.get.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const eventos = await prisma.recordatorio.findMany({
      include: {
        asignatura: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });

    const asignaturas = await prisma.asignatura.findMany({
      select: {
        id: true,
        nombre: true,
      },
    });

    return {
      eventos: eventos.map((e: any) => ({
        id: e.id,
        title: e.titulo,
        date: e.fecha.toISOString(),
        description: e.descripcion,
        asignatura: e.asignatura,
      })),
      asignaturas,
    };
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw createError({
      statusCode: 500,
      message: "Error al obtener los eventos",
    });
  }
});
