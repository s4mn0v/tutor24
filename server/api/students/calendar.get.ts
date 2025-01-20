import { PrismaClient, type Estudiante, type Asignatura } from "@prisma/client"
import { useAuth } from "~/composables/useAuth"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const { user } = useAuth()
    if (!user.value || user.value.role !== "ESTUDIANTE") {
      throw createError({
        statusCode: 401,
        message: "No autorizado",
      })
    }

    // Obtener el estudiante y su asignatura
    const estudiante = (await prisma.estudiante.findUnique({
      where: {
        correo: user.value.email,
      },
      include: {
        asignatura: true,
      },
    })) as (Estudiante & { asignatura: Asignatura }) | null

    if (!estudiante) {
      throw createError({
        statusCode: 404,
        message: "Estudiante no encontrado",
      })
    }

    // Obtener eventos publicados de la asignatura del estudiante
    const eventos = await prisma.event.findMany({
      where: {
        AND: [
          {
            published: true,
          },
          {
            asignaturaId: estudiante.asignaturaId,
          },
        ],
      },
      include: {
        asignatura: {
          select: {
            id: true,
            nombre: true,
            carrera: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    return {
      eventos,
      asignatura: estudiante.asignatura,
    }
  } catch (error) {
    console.error("Error al obtener eventos del calendario:", error)
    throw createError({
      statusCode: 500,
      message: "Error al obtener los eventos del calendario",
    })
  }
})
