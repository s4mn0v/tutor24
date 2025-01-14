import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  password: string;
  role: Rol;
  documentoIdentidad?: string;
  nombre?: string;
  telefono?: string;
}

export default defineEventHandler(async (event) => {
  const body: RegisterBody = await readBody(event);
  const {
    email,
    password,
    role,
    documentoIdentidad = "temp",
    nombre = "Temporary Name",
    telefono = "",
  } = body;

  try {
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

    return { message: "User registered successfully", userId: user.id };
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Type assertion to handle the error as an instance of Error
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
