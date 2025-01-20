import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID de asignatura no proporcionado",
    })
  }

  try {
    // Primero, eliminamos todos los estudiantes asociados a esta asignatura
    await prisma.estudiante.deleteMany({
      where: {
        asignaturaId: Number.parseInt(id),
      },
    })

    // Luego, eliminamos la asignatura
    await prisma.asignatura.delete({
      where: {
        id: Number.parseInt(id),
      },
    })

    return { message: "Asignatura y estudiantes asociados eliminados exitosamente" }
  } catch (error) {
    console.error("Error al eliminar la asignatura:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error al eliminar la asignatura",
    })
  }
})

