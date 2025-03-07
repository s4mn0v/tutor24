import { defineEventHandler, readBody, createError } from "h3"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useRuntimeConfig } from "#imports"

// Definir interfaces para los errores
interface GeminiError {
  status?: number;
  message?: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey || process.env.NUXT_GEMINI_API_KEY
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY no está definida")
    throw createError({
      statusCode: 500,
      message: "Error de configuración del servidor: GEMINI_API_KEY no está definida",
    })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const body = await readBody(event)
    
    // Actualizado el nombre del modelo a la versión 1.5
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      // Configuración opcional para mejorar la generación
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    })
    
    // Añadir manejo de errores específicos
    try {
      const result = await model.generateContent(body.prompt)
      return result.response.text()
    } catch (modelError: unknown) {
      // Convertir el error a un tipo conocido
      const geminiError = modelError as GeminiError
      
      // Si hay un error con gemini-1.5-pro, intentar con gemini-1.5-flash como fallback
      if (geminiError.status === 404) {
        console.warn("Modelo gemini-1.5-pro no encontrado, intentando con gemini-1.5-flash...")
        const fallbackModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          }
        })
        
        const fallbackResult = await fallbackModel.generateContent(body.prompt)
        return fallbackResult.response.text()
      }
      throw modelError
    }
  } catch (error: unknown) {
    console.error("Error al generar contenido con Gemini:", error)
    const geminiError = error as GeminiError
    
    throw createError({
      statusCode: geminiError.status || 500,
      message: `Error al generar contenido con Gemini: ${geminiError.message || 'Error desconocido'}`,
      cause: error
    })
  }
})