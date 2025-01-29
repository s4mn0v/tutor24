import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs/promises";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const form = formidable({ multiples: false });
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Validar archivo
    if (!files.file) {
      throw createError({
        statusCode: 400,
        message: "No se recibió ningún archivo.",
      });
    }

    // Obtener idAsignatura
    const idAsignatura = parseInt(
      Array.isArray(fields.idAsignatura)
        ? fields.idAsignatura[0]
        : fields.idAsignatura || "0" // Default to "0" if undefined
    );
    if (isNaN(idAsignatura)) {
      throw createError({
        statusCode: 400,
        message: "El ID de la asignatura no es válido.",
      });
    }

    // Verificar si la asignatura existe
    const asignatura = await prisma.asignatura.findUnique({
      where: { id: idAsignatura },
    });
    if (!asignatura) {
      throw createError({
        statusCode: 404,
        message: "La asignatura no existe.",
      });
    }

    // Subir archivo a Supabase
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const fileData = await fs.readFile(file.filepath);
    const { data: supabaseData, error: supabaseError } = await supabase.storage
      .from("files")
      .upload(file.originalFilename!, fileData, {
        contentType: file.mimetype!,
        upsert: true,
      });

    if (supabaseError) {
      throw createError({
        statusCode: 500,
        message: "Error al subir el archivo a Supabase.",
      });
    }

    // Obtener URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(supabaseData.path);
    const publicUrl = publicUrlData.publicUrl;

    // Guardar en la tabla Material
    await prisma.material.create({
      data: {
        nombre: file.originalFilename || "Archivo",
        tipo: file.mimetype || "application/octet-stream",
        url: publicUrl,
        idAsignatura: idAsignatura,
      },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    throw createError({
      statusCode: 500,
      message: "Error interno del servidor.",
    });
  }
});
