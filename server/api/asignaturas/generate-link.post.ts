import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const asignaturaId = Number(event.context.params?.asignaturaId);
  const body = await readBody(event);
  const { duracionHoras } = body;

  try {
    const enlaceRegistro = uuidv4();
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + duracionHoras);

    const asignatura = await prisma.asignatura.update({
      where: { id: asignaturaId },
      data: {
        enlaceRegistro,
        fechaExpiracion,
      },
    });

    return {
      enlaceRegistro: asignatura.enlaceRegistro,
      fechaExpiracion: asignatura.fechaExpiracion,
    };
  } catch (error) {
    console.error("Error generando el enlace:", error);
    return createError({
      statusCode: 500,
      message: "Error generando el enlace",
    });
  } finally {
    await prisma.$disconnect();
  }
});