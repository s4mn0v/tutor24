// server/api/students/materials.get.ts
import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError } from "h3";
import { analyzeDocument } from "../../utils/geminiAI";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const materials = await prisma.material.findMany({
      select: {
        id: true,
        nombre: true,
        tipo: true,
        creadoEn: true,
        url: true,
      },
      where: {
        tipo: {
          in: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          ]
        }
      }
    });

    const analyzedMaterials = await Promise.all(materials.map(async (material) => {
      const topics = await analyzeDocument(material.url, material.tipo);
      return {
        ...material,
        creadoEn: material.creadoEn.toISOString(),
        topics,
      };
    }));

    return analyzedMaterials;
  } catch (error) {
    console.error("Error al obtener materiales:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al obtener materiales",
    });
  }
});