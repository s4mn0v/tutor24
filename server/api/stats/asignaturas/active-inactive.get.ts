import { PrismaClient } from "@prisma/client";
import { defineEventHandler } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  const active = await prisma.asignatura.count({
    where: { activo: true },
  });

  const inactive = await prisma.asignatura.count({
    where: { activo: false },
  });

  return { active, inactive };
});
