// server/api/materiales/upload.post.ts
import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nombreArchivo, tipoArchivo, datos, asignaturaId } = body;

  try {
    // Crear carpeta dinámica si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', asignaturaId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Guardar archivo en la carpeta
    const filePath = path.join(uploadDir, nombreArchivo);
    fs.writeFileSync(filePath, Buffer.from(datos, 'base64'));

    // Guardar referencia en la base de datos
    const material = await prisma.material.create({
      data: {
        nombreArchivo,
        tipoArchivo,
        datos: Buffer.from(datos, 'base64'),
        asignaturaId,
      },
    });

    return { material };
  } catch (error: unknown) {
    console.error("Error subiendo material:", error);

    if (error instanceof Error) {
      return createError({
        statusCode: 500,
        message: `Internal server error: ${error.message}`,
      });
    } else {
      return createError({
        statusCode: 500,
        message: "Internal server error: An unknown error occurred.",
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});