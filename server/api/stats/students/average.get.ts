import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  const [studentsCount, subjectsCount] = await Promise.all([
    prisma.estudiante.count(),
    prisma.asignatura.count(),
  ]);

  const average =
    subjectsCount > 0 ? (studentsCount / subjectsCount).toFixed(1) : 0;

  return { average };
});
