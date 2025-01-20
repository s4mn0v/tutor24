import { defineEventHandler, createError } from "h3"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const asignaturaId = Number(event.context.params?.id)

  if (isNaN(asignaturaId)) {
    throw createError({
      statusCode: 400,
      message: "ID de asignatura inválido",
    })
  }

  try {
    const materiales = await prisma.material.findMany({
      where: {
        idAsignatura: asignaturaId, // Usamos el campo idAsignatura para filtrar
      },
      select: {
        id: true,
        nombre: true, // Usamos 'nombre' en lugar de 'nombreArchivo'
        tipo: true, // Usamos 'tipo' en lugar de 'tipoArchivo'
        url: true, // Agregamos 'url' si es necesario
        creadoEn: true,
      },
      orderBy: {
        creadoEn: "desc",
      },
    })

    // Mapeamos la respuesta para devolver la fecha en formato ISO
    return materiales.map((material) => ({
      ...material,
      creadoEn: material.creadoEn.toISOString(),
    }))
  } catch (error) {
    console.error("Error obteniendo materiales:", error)
    throw createError({
      statusCode: 500,
      message: "Error al obtener los materiales",
    })
  } finally {
    await prisma.$disconnect()
  }
})
