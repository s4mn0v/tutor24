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

    const body = await readBody(event)

    // Validar datos requeridos
    if (!body.title || !body.date || !body.asignaturaId) {
      throw createError({
        statusCode: 400,
        message: "Faltan campos requeridos",
      })
    }

    // Crear el evento
    const evento = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || "",
        date: new Date(body.date),
        published: body.published ?? true,
        asignaturaId: body.asignaturaId,
      },
      include: {
        asignatura: true,
      },
    })

    return evento
  } catch (error) {
    console.error("Error al crear evento:", error)
    throw createError({
      statusCode: 500,
      message: "Error al crear el evento",
    })
  }
})

