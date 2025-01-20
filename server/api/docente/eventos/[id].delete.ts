import { PrismaClient } from "@prisma/client";
import { parse } from "cookie"; // Asegúrate de tener la librería 'cookie' instalada para parsear cookies
import jwt from "jsonwebtoken"; // Asegúrate de tener la librería 'jsonwebtoken' instalada

const prisma = new PrismaClient();

// Tipo para el payload decodificado del JWT
interface UserPayload {
  email: string;
  role: string;
}

export default defineEventHandler(async (event) => {
  try {
    // Obtener cookies de la solicitud
    const cookies = parse(event.req.headers.cookie || "");
    const token = cookies.token || null;

    // Verificar si el token existe
    if (!token) {
      throw createError({
        statusCode: 401,
        message: "No autorizado, token no encontrado",
      });
    }

    // Verificar autenticación usando el token (decodificando el token JWT)
    let user: UserPayload;
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("La clave secreta JWT no está definida");
      }
      user = jwt.verify(token, secret) as UserPayload; // Utiliza tu clave secreta
    } catch (err) {
      throw createError({
        statusCode: 401,
        message: "Token inválido",
      });
    }

    if (!user || user.role !== "DOCENTE") {
      throw createError({
        statusCode: 401,
        message: "No autorizado",
      });
    }

    const id = event.context.params?.id ? Number.parseInt(event.context.params.id, 10) : null;

    if (id === null) {
      throw createError({
        statusCode: 400,
        message: "ID de evento no válido",
      });
    }

    // Verificar que el evento existe y pertenece a una asignatura del docente
    const evento = await prisma.event.findFirst({
      where: {
        id,
        asignatura: {
          docente: {
            correo: user.email, // Verificar que el evento pertenece al docente
          },
        },
      },
    });

    if (!evento) {
      throw createError({
        statusCode: 404,
        message: "Evento no encontrado",
      });
    }

    // Eliminar el evento
    await prisma.event.delete({
      where: {
        id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    throw createError({
      statusCode: 500,
      message: "Error al eliminar el evento",
    });
  }
});
