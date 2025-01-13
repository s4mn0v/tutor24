import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || 'secret'; // Usa una clave secreta más segura

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { correo, contrasena } = body;

  // Busca el usuario
  const user = await prisma.usuario.findUnique({ where: { correo } });
  if (!user) {
    throw createError({ statusCode: 401, message: 'Correo o contraseña incorrectos' });
  }

  // Verifica la contraseña
  const validPassword = await bcrypt.compare(contrasena, user.contrasena);
  if (!validPassword) {
    throw createError({ statusCode: 401, message: 'Correo o contraseña incorrectos' });
  }

  // Genera el token JWT
  const token = jwt.sign({ id: user.id, rol: user.rol }, secretKey, { expiresIn: '1h' });

  return { message: 'Login exitoso', token, rol: user.rol };
});
