import { PrismaClient } from "@prisma/client";
import { useAuth } from "~/composables/useAuth";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const { user } = useAuth();
    if (!user.value || user.value.role !== "DOCENTE") {
      throw createError({
        statusCode: 401,
        message: "No autorizado",
      });
    }

    // Obtener eventos del docente
    const eventos = await prisma.event.findMany({
        where: {
          asignatura: {
            docente: {
              correo: user.value.email, // Filtrar directamente por el correo del docente
            },
          },
          date: {
            gte: new Date(), // Solo eventos desde hoy
          },
        },
        include: {
          asignatura: true, // Incluye la asignatura relacionada
        },
        orderBy: {
          date: "asc",
        },
      })      

    // Obtener asignaturas del docente para el selector
    const asignaturas = await prisma.asignatura.findMany({
      where: {
        docente: {
          correo: user.value.email, // Corregir la propiedad 'user' por 'email' directamente en 'docente'
        },
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        carrera: true,
      },
    });

    return {
      eventos,
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
