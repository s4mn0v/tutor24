// server/api/students/chat.post.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readBody, createError, defineEventHandler } from "h3";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message } = body;

  if (!message) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message is required",
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Eres un asistente de matemáticas para estudiantes. Responde preguntas relacionadas con el contenido del curso de matemáticas. Si la pregunta no está relacionada con matemáticas o el contenido del curso, pide amablemente que se reformule la pregunta. Aquí está la pregunta del estudiante: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { text };
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error al generar respuesta",
    });
  }
});
