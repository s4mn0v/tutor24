import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nombre, carrera, jornada, idDocente } = body

  if (!nombre || !carrera || !jornada || !idDocente) {
    throw createError({
      statusCode: 400,
      statusMessage: "Faltan campos requeridos",
    })
  }

  try {
    const course = await prisma.asignatura.create({
      data: {
        nombre,
        carrera,
        jornada,
        idDocente,
        activo: true,
        // No necesitamos establecer enlaceRegistro ni fechaExpiracion aquí,
        // ya que son opcionales y se manejarán en otra parte
      },
    })
    return course
  } catch (error) {
    console.error("Error al crear la asignatura:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error al crear la asignatura",
    })
  }
})

