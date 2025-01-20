import { defineEventHandler, readBody, createError } from "h3"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    console.log("Recibiendo solicitud de carga de archivo") // Log para debugging

    const asignaturaId = Number(event.context.params?.id)
    if (isNaN(asignaturaId)) {
      throw createError({
        statusCode: 400,
        message: "ID de asignatura inválido",
      })
    }

    const formData = await readBody(event)
    console.log("FormData recibido:", formData) // Log para debugging

    // Verificar que el archivo existe en el formData
    if (!formData.file) {
      throw createError({
        statusCode: 400,
        message: "No se ha proporcionado ningún archivo",
      })
    }

    // Extraer los datos del archivo del FormData
    const file = formData.file
    const filename = formData.filename || file.name
    const fileType = formData.type || file.type
    const fileData = file instanceof Buffer ? file : Buffer.from(file)

    console.log("Datos del archivo:", {
      // Log para debugging
      filename,
      fileType,
      size: fileData.length,
    })

    // Verificar el tamaño del archivo (10MB máximo)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB en bytes
    if (fileData.length > MAX_SIZE) {
      throw createError({
        statusCode: 400,
        message: "El archivo excede el tamaño máximo permitido de 10MB",
      })
    }

    // Crear el registro en la base de datos
    const material = await prisma.material.create({
      data: {
        asignaturaId,
        nombreArchivo: filename,
        tipoArchivo: fileType,
        datos: fileData,
      },
    })

    console.log("Material creado:", {
      // Log para debugging
      id: material.id,
      nombreArchivo: material.nombreArchivo,
      tipoArchivo: material.tipoArchivo,
    })

    // Devolver la respuesta sin incluir los datos binarios
    return {
      id: material.id,
      nombreArchivo: material.nombreArchivo,
      tipoArchivo: material.tipoArchivo,
      creadoEn: material.creadoEn.toISOString(),
    }
  } catch (error) {
    console.error("Error al subir el archivo:", error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error al subir el archivo",
    })
  } finally {
    await prisma.$disconnect()
  }
})

