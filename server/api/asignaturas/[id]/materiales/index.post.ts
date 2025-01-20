import { defineEventHandler, readBody, createError } from "h3"
import { PrismaClient } from "@prisma/client"
import fs from 'fs'
import path from 'path'

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

    // Crear una carpeta para almacenar el archivo si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', asignaturaId.toString())
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Definir la ruta del archivo
    const filePath = path.join(uploadDir, filename)

    // Guardar el archivo en el sistema de archivos
    fs.writeFileSync(filePath, fileData)

    // Crear el registro del material en la base de datos
    const material = await prisma.material.create({
      data: {
        nombre: filename, // Nombre del archivo
        tipo: fileType,   // Tipo de archivo
        url: filePath,    // Guardamos la URL del archivo en el campo 'url'
        asignatura: {     // Relación con la asignatura
          connect: {
            id: asignaturaId, // ID de la asignatura
          },
        },
      },
    })

    console.log("Material creado:", {
      // Log para debugging
      id: material.id,
      nombre: material.nombre,
      tipo: material.tipo,
      url: material.url,
    })

    return {
      id: material.id,
      nombre: material.nombre,
      tipo: material.tipo,
      url: material.url,
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
