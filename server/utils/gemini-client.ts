import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai"

// Singleton para la instancia de Gemini
let genAIInstance: GoogleGenerativeAI | null = null
let modelInstance: GenerativeModel | null = null

// Obtener la instancia de Gemini
export function getGeminiInstance(apiKey?: string): GoogleGenerativeAI | null {
  if (!genAIInstance && apiKey) {
    genAIInstance = new GoogleGenerativeAI(apiKey)
  }
  return genAIInstance
}

// Obtener el modelo de Gemini
export function getGeminiModel(apiKey?: string): GenerativeModel {
  if (!modelInstance) {
    const genAI = getGeminiInstance(apiKey)
    if (!genAI) {
      throw new Error("Gemini API no está inicializada")
    }
    
    // Usar gemini-1.5-pro que sabemos que funciona
    modelInstance = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    })
  }
  return modelInstance
}

// Función para generar texto con manejo de errores
export async function generateText(prompt: string, apiKey?: string): Promise<string> {
  try {
    const model = getGeminiModel(apiKey)
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error: any) {
    console.error("Error al generar texto con Gemini:", error)
    
    // Si el error es 404 y estamos usando gemini-1.5-pro, intentar con gemini-1.5-flash
    if (error.status === 404 && modelInstance) {
      try {
        console.warn("Modelo gemini-1.5-pro no disponible, intentando con gemini-1.5-flash...")
        const genAI = getGeminiInstance(apiKey)
        if (!genAI) {
          throw new Error("Gemini API no está inicializada")
        }
        
        const fallbackModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          }
        })
        
        const fallbackResult = await fallbackModel.generateContent(prompt)
        return fallbackResult.response.text()
      } catch (fallbackError) {
        console.error("Error con el modelo de fallback:", fallbackError)
        throw fallbackError
      }
    }
    
    throw error
  }
}

// Función para generar temas predeterminados
export function generateDefaultTopics(nombre: string): string[] {
  return [
    "Introducción a " + nombre,
    "Conceptos básicos de " + nombre,
    "Aplicaciones prácticas",
    "Ejemplos y casos de estudio",
    "Conclusiones y resumen",
  ]
}