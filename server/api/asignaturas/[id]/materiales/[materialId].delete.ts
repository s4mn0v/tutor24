import { defineEventHandler, createError } from 'h3'
import { PrismaClient } from '@prisma/client'
import { unlink } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const asignaturaId = Number(event.context.params?.id)
  const materialId = Number(event.context.params?.materialId)

  if (isNaN(asignaturaId) || isNaN(materialId)) {
    throw createError({
      statusCode: 400,
      message: "ID de asignatura o material inválido"
    })
  }

  try {
    // Buscar el material por ID
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    })

    // Verificar si el material existe y pertenece a la asignatura correcta
    if (!material || material.idAsignatura !== asignaturaId) {
      throw createError({
        statusCode: 404,
        message: "Material no encontrado o no pertenece a esta asignatura"
      })
    }

    // Eliminar el archivo del sistema de archivos
    const filePath = join(process.cwd(), 'uploads', `${material.id}-${material.nombre}`)
    await unlink(filePath)

    // Eliminar el material de la base de datos
    await prisma.material.delete({
      where: { id: materialId }
    })

    return { message: "Material eliminado con éxito" }
  } catch (error: any) {
    console.error("Error eliminando material:", error)
    throw createError({
      statusCode: 500,
      message: error.message || "Error desconocido al eliminar material"
    })
  } finally {
    await prisma.$disconnect()
  }
})
