import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { documentoIdentidad, nombre, rol, correo, contrasena } = body;

  // Verifica si el usuario ya existe
  const existingUser = await prisma.usuario.findUnique({ where: { correo } });
  if (existingUser) {
    throw createError({ statusCode: 400, message: 'Usuario ya registrado' });
  }

  // Hashea la contraseña
  const hashedPassword = await bcrypt.hash(contrasena, 10);

  // Crea el nuevo usuario
  const newUser = await prisma.usuario.create({
    data: {
      documentoIdentidad,
      nombre,
      rol,
      correo,
      contrasena: hashedPassword,
    },
  });

  return { message: 'Usuario registrado exitosamente', userId: newUser.id };
});
