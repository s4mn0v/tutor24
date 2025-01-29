// server/api/auth/register.post.ts
import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defineEventHandler, readBody, createError } from "h3";

const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  password: string;
  role: Rol;
  documentoIdentidad: string;
  nombre: string;
  telefono?: string;
}

export default defineEventHandler(async (event) => {
  const body: RegisterBody = await readBody(event);
  const {
    email,
    password,
    role,
    documentoIdentidad,
    nombre,
    telefono = "",
  } = body;

  // Validación de entrada
  if (!email || !password || !role || !documentoIdentidad || !nombre) {
    return createError({
      statusCode: 400,
      message: "Todos los campos son obligatorios excepto el teléfono.",
    });
  }

  // Rechazar intentos de registro con rol "ESTUDIANTE"
  if (role === "ESTUDIANTE") {
    return createError({
      statusCode: 400,
      message: "No se permite el registro directo de estudiantes.",
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [{ correo: email }, { documentoIdentidad: documentoIdentidad }],
      },
    });

    if (existingUser) {
      return createError({
        statusCode: 400,
        message:
          "Ya existe un usuario con este correo o documento de identidad.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        correo: email,
        contrasena: hashedPassword,
        rol: role,
        documentoIdentidad,
        nombre,
        telefono,
      },
    });

    return { message: "Usuario registrado exitosamente", userId: user.id };
  } catch (error: unknown) {
    console.error("Error de registro:", error);

    if (error instanceof Error) {
      return createError({
        statusCode: 500,
        message: `Error interno del servidor: ${error.message}`,
      });
    } else {
      return createError({
        statusCode: 500,
        message: "Error interno del servidor: Ocurrió un error desconocido.",
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});
