import { GoogleGenerativeAI } from "@google/generative-ai"
import { PrismaClient } from "@prisma/client"
import { google } from "googleapis"
import { readBody, createError, defineEventHandler, getQuery } from "h3"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const prisma = new PrismaClient()

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
})

// Almacén de memoria para cada estudiante
interface StudentContext {
  messages: string[]
  currentTopic?: string
  lastQuiz?: {
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
  }
  conversationContext?: string
}

const studentMemory: { [key: string]: StudentContext } = {}

async function analyzeDocument(nombre: string) {
  const topics = nombre
    .split(/[,;.-]/)
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0)

  return {
    title: nombre,
    topics: topics.length > 0 ? topics : ["Tema general"],
    summary: `Material sobre ${nombre}`,
  }
}

async function getYouTubeVideos(query: string) {
  try {
    const response = await youtube.search.list({
      part: ["id", "snippet"],
      q: query,
      type: ["video"],
      maxResults: 1,
      relevanceLanguage: "es",
      videoEmbeddable: "true",
    })

    if (response?.data?.items?.[0]) {
      const video = response.data.items[0]
      return {
        id: video.id?.videoId || "",
        title: video.snippet?.title || "",
        description: video.snippet?.description || "",
      }
    }
    return null
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching YouTube videos:", error.message)
    } else {
      console.error("Unknown error fetching YouTube videos:", error)
    }
    return null
  }
}

async function retryWithExponentialBackoff(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: unknown) {
      if (i === maxRetries - 1) {
        throw error // Re-throw the error on the last attempt
      }
      if (error instanceof Error && error.message.includes("429 Too Many Requests")) {
        const delay = Math.pow(2, i) * 1000 // Espera exponencial: 1s, 2s, 4s
        console.log(`Reintentando en ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        throw error // Re-throw if it's not a 429 error
      }
    }
  }
  throw new Error("Max retries reached") // This line should never be reached, but TypeScript needs it
}

async function generateContentWithRetry(prompt: string) {
  return retryWithExponentialBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(prompt)
    return result.response.text()
  })
}

async function detectCurrentTopic(messages: string[], context = "") {
  const prompt = `
    Analiza esta conversación y contexto:
    
    Contexto del material: ${context}
    
    Últimos mensajes:
    ${messages.slice(-6).join("\n")}
    
    Identifica el tema específico que se está estudiando actualmente.
    Por ejemplo: "integrales definidas", "límites al infinito", "derivadas parciales", etc.
    
    Responde SOLO con el tema identificado, sin puntuación ni formato adicional.
  `
  return generateContentWithRetry(prompt)
}

async function generateQuiz(topic: string, context: string) {
  const prompt = `
  Como profesor de matemáticas experto, genera una pregunta de quiz de selección múltiple sobre ${topic}.
  
  Contexto de la conversación: ${context}
  
  La pregunta debe seguir EXACTAMENTE este formato JSON:
  {
    "question": "El enunciado de la pregunta aquí",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctAnswer": "La letra de la opción correcta (A, B, C o D)",
    "explanation": "Una explicación detallada de por qué la respuesta es correcta y por qué las otras son incorrectas"
  }

  Requisitos importantes:
  1. La pregunta debe estar relacionada específicamente con ${topic}
  2. Las opciones deben ser claras y distinguibles entre sí
  3. La explicación debe ser detallada y educativa
  4. Incluye los símbolos matemáticos necesarios si es apropiado

  Genera una pregunta de quiz sobre ${topic}.
  `
  const response = await generateContentWithRetry(prompt)
  try {
    const parsedResponse = JSON.parse(response)
    if (
      !parsedResponse.question ||
      !Array.isArray(parsedResponse.options) ||
      parsedResponse.options.length !== 4 ||
      !parsedResponse.correctAnswer ||
      !parsedResponse.explanation
    ) {
      throw new Error("Respuesta incompleta del modelo")
    }
    return parsedResponse
  } catch (error) {
    console.error("Error parsing quiz:", error)
    return {
      question: `¿Cuál de las siguientes opciones está más relacionada con ${topic}?`,
      options: ["Opción A", "Opción B", "Opción C", "Opción D"],
      correctAnswer: "A",
      explanation: `Esta es una pregunta de respaldo relacionada con ${topic}. La opción A se considera correcta por defecto.`,
    }
  }
}

async function checkQuizAnswer(quiz: any, userAnswer: string) {
  const prompt = `
  Como profesor experto, evalúa esta respuesta:

  Pregunta: ${quiz.question}
  Opciones: ${quiz.options.join(", ")}
  Respuesta del estudiante: ${userAnswer}
  Respuesta correcta: ${quiz.correctAnswer}
  Explicación: ${quiz.explanation}

  Evalúa si la respuesta del estudiante es correcta.
  
  Responde en este formato JSON:
  {
    "isCorrect": true/false,
    "feedback": "Tu mensaje aquí"
  }

  Si es correcta:
  - Felicita al estudiante de manera entusiasta
  - Refuerza la explicación de por qué es correcta
  
  Si es incorrecta:
  - Sé amable y motivador
  - Explica por qué la respuesta es incorrecta
  - Proporciona la respuesta correcta y su explicación
  - Da un consejo para mejorar en este tipo de preguntas
  `
  const response = await generateContentWithRetry(prompt)
  try {
    const feedback = JSON.parse(response)
    if (typeof feedback.isCorrect !== "boolean" || !feedback.feedback) {
      throw new Error("Formato de retroalimentación inválido")
    }
    return feedback
  } catch (error) {
    console.error("Error parsing feedback:", error)
    return {
      isCorrect: userAnswer.toUpperCase() === quiz.correctAnswer,
      feedback: `Gracias por tu respuesta. La respuesta correcta es ${quiz.correctAnswer}. ${quiz.explanation}`,
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message, answer } = body
    const query = getQuery(event)
    const userId = query.userId as string

    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Usuario no autenticado",
      })
    }

    const estudiante = await prisma.estudiante.findFirst({
      where: { usuarioId: Number.parseInt(userId) },
      include: {
        asignatura: true,
        usuario: true,
      },
    })

    if (!estudiante) {
      throw createError({
        statusCode: 404,
        statusMessage: "Estudiante no encontrado",
      })
    }

    // Inicializar contexto si no existe
    if (!studentMemory[userId]) {
      studentMemory[userId] = {
        messages: [],
        conversationContext: "",
      }
    }

    const materials = await prisma.material.findMany({
      where: { idAsignatura: estudiante.asignaturaId },
      orderBy: { creadoEn: "desc" },
    })

    let response = ""
    let video = null
    let quiz = null
    let answerFeedback = null

    // Si hay una respuesta a un quiz, evaluarla
    if (answer && studentMemory[userId].lastQuiz) {
      const feedback = await checkQuizAnswer(studentMemory[userId].lastQuiz, answer)
      answerFeedback = feedback
      response = feedback.feedback
    } else if (message === "inicio") {
      if (materials.length === 0) {
        response = `¡Hola ${estudiante.nombre}! 👋 Bienvenido a tu asistente de estudio personal para ${estudiante.asignatura?.nombre}.

Actualmente no hay materiales subidos por tu profesor. Puedo ayudarte con preguntas o dudas matemáticas generales. ¿En qué puedo asistirte hoy?`
      } else {
        const materialsAnalysis = await Promise.all(materials.map((m) => analyzeDocument(m.nombre)))
        studentMemory[userId].conversationContext = materialsAnalysis
          .map((a) => `${a.title}: ${a.topics.join(", ")}`)
          .join("\n")

        response = `¡Hola ${estudiante.nombre}! 👋 Bienvenido a tu asistente de estudio personal para ${estudiante.asignatura?.nombre}.

Estos son los documentos disponibles para tu estudio:

${materialsAnalysis
  .map(
    (analysis) => `
**${analysis.title}**
Temas principales: ${analysis.topics.join(", ")}
`,
  )
  .join("\n")}

¿Sobre qué tema te gustaría aprender hoy? Puedo ayudarte con:
• Explicaciones detalladas de cualquier tema
• Resúmenes de los documentos
• Preguntas de práctica tipo quiz
• Videos explicativos relacionados con los temas
• Tips de estudio personalizados

¿Qué te gustaría hacer primero?`
      }
    } else {
      // Agregar mensaje del usuario a la memoria
      studentMemory[userId].messages.push(`Usuario: ${message}`)

      // Mantener solo las últimas 20 interacciones
      if (studentMemory[userId].messages.length > 40) {
        studentMemory[userId].messages = studentMemory[userId].messages.slice(-40)
      }

      // Detectar el tema actual basado en el contexto de la conversación
      const currentTopic = await detectCurrentTopic(
        studentMemory[userId].messages,
        studentMemory[userId].conversationContext,
      )
      studentMemory[userId].currentTopic = currentTopic

      if (materials.length === 0) {
        // Si no hay materiales, solo responder preguntas matemáticas
        response = await generateContentWithRetry(`
          Eres un asistente especializado en matemáticas.
          Debes mantener un tono amigable y motivador, utilizando emojis ocasionalmente.
          
          Responde a la siguiente pregunta o duda matemática: "${message}"
          
          Recuerda:
          1. Sé conciso pero informativo
          2. Usa ejemplos cuando sea apropiado
          3. Mantén un tono positivo y motivador
          4. Si la pregunta no es sobre matemáticas, indica amablemente que solo puedes ayudar con temas matemáticos
        `)
      } else {
        // Si hay materiales, procesar diferentes tipos de solicitudes
        if (message.toLowerCase().includes("video") || message.toLowerCase().includes("videos")) {
          const searchQuery = `${currentTopic} ${estudiante.asignatura?.nombre || ""} explicación`
          video = await getYouTubeVideos(searchQuery)
          if (video) {
            response = `📺 He encontrado este video que puede ayudarte con ${currentTopic}:

"${video.title}"

${video.description}

El video se mostrará a continuación. ¿Quieres que busquemos más información sobre este tema?`
          } else {
            response = `Lo siento, no pude encontrar un video relevante sobre ${currentTopic}. ¿Quieres que te explique algo sobre este tema basándome en los materiales del curso?`
          }
        } else if (
          message.toLowerCase().includes("quiz") ||
          message.toLowerCase().includes("pregunta") ||
          message.toLowerCase().includes("práctica")
        ) {
          quiz = await generateQuiz(currentTopic, studentMemory[userId].conversationContext || "")
          studentMemory[userId].lastQuiz = quiz

          response = `🎯 Aquí tienes una pregunta de práctica sobre ${currentTopic}:

${quiz.options.map((option: string, index: number) => `${String.fromCharCode(65 + index)}) ${option}`).join("\n")}

Por favor, responde con la letra de la opción que consideres correcta (A, B, C o D).`
        } else {
          response = await generateContentWithRetry(`
            Eres un asistente especializado en la asignatura ${estudiante.asignatura?.nombre}.
            Debes mantener un tono amigable y motivador, utilizando emojis ocasionalmente.
            
            Contexto del estudiante:
            - Nombre: ${estudiante.nombre}
            - Asignatura: ${estudiante.asignatura?.nombre}
            - Carrera: ${estudiante.carrera}
            - Tema actual: ${currentTopic}
            
            Materiales disponibles:
            ${studentMemory[userId].conversationContext}
            
            Historial de la conversación:
            ${studentMemory[userId].messages.slice(-6).join("\n")}
            
            Responde al mensaje del estudiante: "${message}"
            
            Recuerda:
          1. Sé conciso pero informativo
          2. Usa ejemplos cuando sea apropiado
          3. Mantén un tono positivo y motivador
          4. Sugiere recursos adicionales cuando sea relevante
          5. Si el tema no está claro, pregunta para aclarar
          `)
        }
      }
    }

    // Agregar respuesta a la memoria
    studentMemory[userId].messages.push(`Asistente: ${response}`)

    return {
      text: response,
      video,
      quiz,
      answerFeedback,
      currentTopic: studentMemory[userId].currentTopic,
    }
  } catch (error) {
    console.error("Error:", error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error al procesar tu solicitud: " + (error instanceof Error ? error.message : String(error)),
    })
  }
})