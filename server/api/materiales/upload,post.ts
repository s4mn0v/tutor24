import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nombre, tipo, datos, asignaturaId } = body;  // Renombrado 'nombreArchivo' a 'nombre' y 'tipoArchivo' a 'tipo'

  try {
    // Crear carpeta dinámica si no existe
    const uploadDir = path.join(process.cwd(), "uploads", asignaturaId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Guardar el archivo en la carpeta
    const filePath = path.join(uploadDir, nombre);  // Corregido a 'nombre' en lugar de 'nombreArchivo'
    fs.writeFileSync(filePath, Buffer.from(datos, "base64"));

    // Crear el registro en la base de datos con la URL del archivo
    const material = await prisma.material.create({
      data: {
        nombre: nombre,  // Corregido a 'nombre' en lugar de 'nombreArchivo'
        tipo: tipo,      // Corregido a 'tipo' en lugar de 'tipoArchivo'
        url: filePath,   // Guardamos la ruta del archivo en la base de datos
        asignatura: {    // Pasamos el objeto relacionado 'asignatura'
          connect: {
            id: asignaturaId,  // Conectamos la asignatura por su id
          },
        },
      },
    });

    // Retornar el material creado
    return { material };
  } catch (error: unknown) {
    console.error("Error subiendo material:", error);

    if (error instanceof Error) {
      return createError({
        statusCode: 500,
        message: `Error interno del servidor: ${error.message}`,
      });
    } else {
      return createError({
        statusCode: 500,
        message: "Error interno del servidor: Ocurrió un error desconocido.",
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});
