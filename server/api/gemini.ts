import { defineEventHandler, readBody, createError } from "h3"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.geminiApiKey) {
    console.error("GEMINI_API_KEY no está definida")
    throw createError({
      statusCode: 500,
      message: "Error de configuración del servidor: GEMINI_API_KEY no está definida",
    })
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const body = await readBody(event)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(body.prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error al generar contenido con Gemini:", error)
    throw createError({
      statusCode: 500,
      message: "Error al generar contenido con Gemini",
    })
  }
})

