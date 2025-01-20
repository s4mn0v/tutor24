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

    const body = await readBody(event);

    // Validar datos requeridos
    if (!body.title || !body.date || !body.asignaturaId) {
      throw createError({
        statusCode: 400,
        message: "Faltan campos requeridos",
      });
    }

    // Verificar que la asignatura pertenece al docente
    const asignatura = await prisma.asignatura.findFirst({
      where: {
        id: body.asignaturaId,
        docente: {
          correo: user.email, // Validar que el correo coincide con el del docente
        },
      },
    });

    if (!asignatura) {
      throw createError({
        statusCode: 404,
        message: "La asignatura no existe o no pertenece al docente",
      });
    }

    // Crear el evento
    const evento = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || "",
        date: new Date(body.date),
        published: body.published ?? true,
        asignaturaId: body.asignaturaId,
      },
      include: {
        asignatura: true, // Incluir la asignatura relacionada
      },
    });

    return evento;
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw createError({
      statusCode: 500,
      message: "Error al crear el evento",
    });
  }
});
