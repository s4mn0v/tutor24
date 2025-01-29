// server/api/asignaturas/[id]/materiales.post.ts
import { defineEventHandler, readBody, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "ID de asignatura no proporcionado",
      });
    }

    const body = await readBody(event);
    const { fileBase64, fileName, fileType } = body;

    if (!fileBase64 || !fileName || !fileType) {
      throw createError({
        statusCode: 400,
        message: "Datos del archivo incompletos",
      });
    }

    // Decodificar el base64 a un Buffer
    const fileBuffer = Buffer.from(fileBase64.split(",")[1], "base64");

    // Generar un nombre único para el archivo
    const uniqueFileName = `${uuidv4()}-${fileName}`;

    // Subir el archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(uniqueFileName, fileBuffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error de Supabase:", uploadError);
      throw createError({
        statusCode: 500,
        message: "Error al subir el archivo",
      });
    }

    // Obtener la URL pública del archivo
    const {
      data: { publicUrl },
    } = supabase.storage.from("files").getPublicUrl(uniqueFileName);

    // Crear el registro en la base de datos
    const material = await prisma.material.create({
      data: {
        nombre: fileName,
        tipo: fileType,
        url: publicUrl,
        idAsignatura: Number.parseInt(id),
      },
    });

    return {
      success: true,
      material,
    };
  } catch (error: any) {
    console.error("Error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Error interno del servidor",
    });
  }
});
