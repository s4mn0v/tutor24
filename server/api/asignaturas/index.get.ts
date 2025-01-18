import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    const asignaturas = await prisma.asignatura.findMany({
      where: { idDocente: 1 }, // Cambia esto para obtener el ID del docente autenticado
      select: {
        id: true,
        nombre: true,
        enlaceRegistro: true,
        fechaExpiracion: true,
      },
    });
    return asignaturas;
  } catch (error) {
    console.error("Error obteniendo las asignaturas:", error);
    return createError({
      statusCode: 500,
      message: "Error obteniendo las asignaturas",
    });
  } finally {
    await prisma.$disconnect();
  }
});