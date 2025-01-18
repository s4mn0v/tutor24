import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;

  try {
    await prisma.asignatura.delete({
      where: { id },
    });
    return { message: "Asignatura eliminada exitosamente" };
  } catch (error) {
    console.error("Error eliminando la asignatura:", error);
    return createError({
      statusCode: 500,
      message: "Error eliminando la asignatura",
    });
  } finally {
    await prisma.$disconnect();
  }
});