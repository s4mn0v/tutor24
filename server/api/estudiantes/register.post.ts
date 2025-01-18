import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface RegisterBody {
  nombre: string;
  correo: string;
  contrasena: string;
  documentoIdentidad: string;
  carrera: string;
  enlaceRegistro: string;
}

export default defineEventHandler(async (event) => {
  const body: RegisterBody = await readBody(event);
  const { nombre, correo, contrasena, documentoIdentidad, carrera, enlaceRegistro } = body;

  try {
    // Buscar la asignatura por el enlace temporal
    const asignatura = await prisma.asignatura.findFirst({
      where: { enlaceRegistro },
    });

    if (!asignatura) {
      return createError({
        statusCode: 404,
        message: "Enlace no válido o expirado",
      });
    }

    // Verificar si el estudiante ya está registrado
    const estudianteExistente = await prisma.estudiante.findUnique({
      where: { correo },
    });

    if (estudianteExistente) {
      return createError({
        statusCode: 400,
        message: "El correo electrónico ya está registrado",
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el estudiante
    const estudiante = await prisma.estudiante.create({
      data: {
        nombre,
        correo,
        contrasena: hashedPassword,
        documentoIdentidad,
        carrera,
        asignaturaId: asignatura.id,
      },
    });

    return { estudiante };
  } catch (error) {
    console.error("Error registrando el estudiante:", error);
    return createError({
      statusCode: 500,
      message: "Error registrando el estudiante",
    });
  } finally {
    await prisma.$disconnect();
  }
});