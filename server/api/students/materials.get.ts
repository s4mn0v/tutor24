import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const materials = await prisma.material.findMany({
      where: {
        /* Add appropriate filter if needed */
      },
      select: {
        id: true,
        nombreArchivo: true,
        tipoArchivo: true,
        creadoEn: true,
      },
    })
    return materials
  } catch (error) {
    console.error("Error al obtener materiales:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error al obtener materiales",
    })
  }
})

