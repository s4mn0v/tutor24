import { PrismaClient } from "@prisma/client"
import { useAuth } from "~/composables/useAuth"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Verificar autenticación
    const { user } = useAuth()
    if (!user.value || user.value.role !== "DOCENTE") {
      throw createError({
        statusCode: 401,
        message: "No autorizado",
      })
    }

    const id = event.context.params?.id ? Number.parseInt(event.context.params.id, 10) : null

    if (id === null) {
      throw createError({
        statusCode: 400,
        message: "ID de evento no válido",
      })
    }

    // Verificar que el evento existe y pertenece a una asignatura del docente
    const evento = await prisma.event.findFirst({
        where: {
          id,
          asignatura: {
            docente: {
              correo: user.value.email, // Campo 'correo' de Usuario
            },
          },
        },
      })
      

    if (!evento) {
      throw createError({
        statusCode: 404,
        message: "Evento no encontrado",
      })
    }

    // Eliminar el evento
    await prisma.event.delete({
      where: {
        id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    throw createError({
      statusCode: 500,
      message: "Error al eliminar el evento",
    })
  }
})

