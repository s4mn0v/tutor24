import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { nombre, idDocente, fechaExpiracion } = body;

  try {
    const asignatura = await prisma.asignatura.create({
      data: {
        nombre,
        idDocente,
        fechaExpiracion: new Date(fechaExpiracion),
      },
    });

    return { asignatura };
  } catch (error) {
    console.error("Error creando la asignatura:", error);
    return createError({
      statusCode: 500,
      message: "Error creando la asignatura",
    });
  } finally {
    await prisma.$disconnect();
  }
});