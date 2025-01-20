import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const materials = await prisma.material.findMany({
      where: {
        /* Add appropriate filter if needed */
      },
      select: {
        id: true,
        nombre: true,  // Corregido a 'nombre'
        tipo: true,    // Corregido a 'tipo'
        creadoEn: true,
      },
    });
    return materials.map((material) => ({
      id: material.id,
      nombre: material.nombre,  // Corregido a 'nombre'
      tipo: material.tipo,      // Corregido a 'tipo'
      creadoEn: material.creadoEn.toISOString(),
    }));
  } catch (error) {
    console.error("Error al obtener materiales:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al obtener materiales",
    });
  }
});
