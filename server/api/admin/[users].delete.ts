// server/api/admin/[users].delete.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, readBody, createError } from "h3"; // Importing necessary functions

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  try {
    await prisma.usuario.delete({
      where: { id },
    });
    return { message: "Usuario eliminado correctamente" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error al eliminar el usuario",
    });
  }
});
