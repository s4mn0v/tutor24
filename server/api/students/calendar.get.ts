// server/api/students/calendar.get.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Primero, obtener el estudiante y sus asignaturas
    const estudiante = await prisma.estudiante.findFirst({
      include: {
        asignatura: {
          include: {
            recordatorios: {
              orderBy: {
                fecha: "asc",
              },
              select: {
                id: true,
                titulo: true,
                descripcion: true,
                fecha: true,
                asignatura: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!estudiante) {
      return {
        eventos: [],
        asignaturas: [],
      };
    }

    // Transformar los recordatorios al formato esperado
    const eventos = estudiante.asignatura.recordatorios.map((recordatorio) => ({
      id: recordatorio.id,
      title: recordatorio.titulo,
      date: recordatorio.fecha.toISOString(),
      description: recordatorio.descripcion,
      asignatura: {
        id: recordatorio.asignatura.id,
        nombre: recordatorio.asignatura.nombre,
      },
    }));

    // Obtener las asignaturas del estudiante
    const asignaturas = [
      {
        id: estudiante.asignatura.id,
        nombre: estudiante.asignatura.nombre,
      },
    ];

    // Retornar los datos formateados
    return {
      eventos,
      asignaturas,
    };
  } catch (error) {
    console.error("Error al obtener eventos del calendario:", error);
    throw createError({
      statusCode: 500,
      message: "Error al obtener los eventos del calendario",
      cause: error,
    });
  }
});
