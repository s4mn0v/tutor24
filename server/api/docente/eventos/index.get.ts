// server/api/docente/eventos/index.get.ts
import { PrismaClient } from "@prisma/client";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { defineEventHandler, createError } from "h3";

const prisma = new PrismaClient();

// Tipo para el payload decodificado del JWT
interface UserPayload {
  email: string;
  role: string;
}

export default defineEventHandler(async (event) => {
  try {
    // Verificar si el token está en los encabezados
    const authorizationHeader = event.req.headers['authorization'];
    const token = authorizationHeader?.split(' ')[1] || null;

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
        message: "Token inválido o expirado",
      });
    }

    // Verificar el rol del usuario
    if (!user || user.role !== "DOCENTE") {
      throw createError({
        statusCode: 403,
        message: "No autorizado para acceder a esta información",
      });
    }

    // Obtener eventos del docente
    const eventos = await prisma.event.findMany({
      where: {
        asignatura: {
          docente: {
            correo: user.email, // Filtrar directamente por el correo del docente
          },
        },
        date: {
          gte: new Date(), // Solo eventos desde hoy
        },
      },
      include: {
        asignatura: true, // Incluir la asignatura relacionada
      },
      orderBy: {
        date: "asc", // Ordenar por fecha ascendente
      },
    });

    // Obtener asignaturas del docente
    const asignaturas = await prisma.asignatura.findMany({
      where: {
        docente: {
          correo: user.email, // Correo del docente asociado a las asignaturas
        },
        activo: true, // Solo asignaturas activas
      },
      select: {
        id: true,
        nombre: true,
        carrera: true,
      },
    });

    // Retornar eventos y asignaturas
    return {
      eventos,
      asignaturas,
    };
  } catch (error) {
    // Manejo explícito del tipo de 'error'
    if (error instanceof Error) {
      console.error("Error al obtener eventos:", error.message);
      throw createError({
        statusCode: (error as any).statusCode || 500,
        message: error.message || "Error al obtener los eventos",
      });
    }

    // En caso de un error desconocido
    console.error("Error desconocido:", error);
    throw createError({
      statusCode: 500,
      message: "Ocurrió un error inesperado",
    });
  }
});
