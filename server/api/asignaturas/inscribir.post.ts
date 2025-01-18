// server/api/asignaturas/inscribir.post.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface InscribirBody {
  enlaceRegistro: string;
  estudianteId: number;
}

export default defineEventHandler(async (event) => {
  const body: InscribirBody = await readBody(event);
  const { enlaceRegistro, estudianteId } = body;

  try {
    const asignatura = await prisma.asignatura.findFirst({
      where: {
        enlaceRegistro,
        fechaExpiracion: { gt: new Date() }, // Verificar que el enlace no haya expirado
      },
    });

    if (!asignatura) {
      return createError({
        statusCode: 404,
        message: "Enlace no válido o expirado",
      });
    }

    await prisma.estudiante.update({
      where: { id: estudianteId },
      data: {
        asignaturaId: asignatura.id,
      },
    });

    return { message: "Estudiante inscrito exitosamente" };
  } catch (error: unknown) {
    console.error("Error inscribiendo estudiante:", error);

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