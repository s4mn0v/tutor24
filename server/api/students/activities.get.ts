import { defineEventHandler } from "h3"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const materials = await prisma.material.findMany({
      where: {
        asignatura: {
          estudiantes: {
            some: {
              id: 1, // Esto debería ser dinámico basado en el estudiante autenticado
            },
          },
        },
      },
      orderBy: {
        creadoEn: "desc",
      },
      take: 5,
      select: {
        id: true,
        nombreArchivo: true,
        creadoEn: true,
        tipoArchivo: true,
      },
    })
    return materials.map((material) => ({
      id: material.id,
      title: material.nombreArchivo,
      date: material.creadoEn.toISOString(),
      type: material.tipoArchivo,
    }))
  } catch (error) {
    console.error("Error fetching activities:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error fetching activities",
    })
  }
})

