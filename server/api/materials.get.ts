// server/api/materials.get.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const asignaturaId = parseInt(getQuery(event).asignaturaId as string, 10);
  
  if (!asignaturaId) {
    throw createError({ 
      statusCode: 400, 
      message: 'Falta el ID de la asignatura.' 
    });
  }

  const materials = await prisma.material.findMany({
    where: { 
      idAsignatura: asignaturaId 
    },
    orderBy: {
      creadoEn: 'desc' // Ordenamos por fecha de creación, más recientes primero
    },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      url: true,
      creadoEn: true
    },
  });

  return materials;
});