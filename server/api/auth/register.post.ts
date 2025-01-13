import { PrismaClient, Rol } from "@prisma/client"; // Import Rol enum
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  password: string;
  role: Rol; // Change type from string to Rol
  documentoIdentidad?: string; // Optional field
  nombre?: string; // Optional field
}

export default defineEventHandler(async (event) => {
  const body: RegisterBody = await readBody(event);
  const { email, password, role, documentoIdentidad = "temp", nombre = "Temporary Name" } = body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        correo: email,
        contrasena: hashedPassword,
        rol: role,
        documentoIdentidad,
        nombre,
      },
    });

    return { message: "User registered successfully", userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
    return createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
