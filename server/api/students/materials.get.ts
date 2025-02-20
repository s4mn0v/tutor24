import { PrismaClient } from "@prisma/client";
import { defineEventHandler, createError, getRequestHeaders } from "h3";
import { analyzeDocument } from "../../utils/geminiAI";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
interface AnalyzedMaterial {
  id: number;
  nombre: string;
  tipo: string;
  url: string;
  creadoEn: string;
  topics: string[];
}

export default defineEventHandler(async (event) => {
  try {
    // Obtener el token del header
    const headers = getRequestHeaders(event);
    const token = headers.authorization?.split(" ")[1] || "";

    if (!token) {
      throw createError({ statusCode: 401, message: "Acceso no autorizado" });
    }

    // Decodificar el token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as {
      userId: number;
      asignaturaId: number;
    };

    // Obtener materiales de SU asignatura
    const materials = await prisma.material.findMany({
      where: {
        idAsignatura: decoded.asignaturaId, // <-- Usamos el ID desde el token
        tipo: {
          in: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ],
        },
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        creadoEn: true,
        url: true,
      },
    });

    // Procesar análisis (opcional)
    const analyzedMaterials: AnalyzedMaterial[] = [];
    for (const material of materials) {
      const topics = await analyzeDocument(material.url, material.tipo);
      analyzedMaterials.push({
        ...material,
        creadoEn: material.creadoEn.toISOString(),
        topics,
      });
      // Pausa opcional de 1 segundo entre solicitudes para darle un respiro a la API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return analyzedMaterials;
  } catch (error) {
    console.error("Error:", error);
    throw createError({
      statusCode: 500,
      message: "Error al obtener materiales",
    });
  }
});
