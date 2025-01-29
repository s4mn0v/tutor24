// server/api/asignaturas/[id]/[materialId].delete.ts
import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    const materialId = event.context.params?.materialId

    if (!id || !materialId) {
      return { error: 'ID de asignatura o material no proporcionado' }
    }

    // Convertir los IDs a números
    const materialIdNumber = parseInt(materialId)

    // Obtener el material primero
    const material = await prisma.material.findUnique({
      where: { id: materialIdNumber },
    });

    if (!material) {
      return { error: "Material no encontrado" };
    }

    // Eliminar de Supabase Storage
    const filePath = material.url.split("/").pop();
    const { error: storageError } = await supabase.storage
      .from("materiales")
      .remove([filePath!]);

    if (storageError) console.error("Error eliminando archivo:", storageError);

    // Eliminar de la base de datos
    const deletedMaterial = await prisma.material.delete({
      where: { id: materialIdNumber },
    });

    return { success: true, deletedMaterial };
  } catch (error) {
    console.error("Error al eliminar el material:", error);
    return { error: "Error interno del servidor" };
  }
});
