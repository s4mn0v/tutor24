import { PrismaClient } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { type H3Event, createError, getRequestHeaders, readBody, defineEventHandler } from "h3"
import jwt from "jsonwebtoken"
import axios from "axios"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const prisma = new PrismaClient()

interface StudentContext {
  messages: string[]
  currentTopic?: string
  studySession?: {
    topic: string
    startTime: Date
    concepts: string[]
    examples: string[]
  }
  progress: { topic: string; lastReviewed: Date; masteryLevel: number }[]
  xp: number
  streak: number
  lastLoginDate: Date
  conversationHistory: string[]
}

interface Material {
  id: number
  nombre: string
  tipo: string
  url: string
  creadoEn: Date
  idAsignatura: number
  topics?: string[]
}

const studentContexts = new Map<number, StudentContext>()

async function getOrCreateStudentContext(userId: number): Promise<StudentContext> {
  if (studentContexts.has(userId)) {
    return studentContexts.get(userId)!
  }

  const student = await prisma.estudiante.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      streak: true,
      lastLoginDate: true,
    },
  })

  if (!student) {
    throw new Error("Estudiante no encontrado")
  }

  const newContext: StudentContext = {
    messages: [],
    progress: [],
    xp: student.xp || 0,
    streak: student.streak || 0,
    lastLoginDate: student.lastLoginDate || new Date(),
    conversationHistory: [],
  }

  studentContexts.set(userId, newContext)
  return newContext
}

async function saveStudentContext(userId: number, context: StudentContext) {
  await prisma.estudiante.update({
    where: { id: userId },
    data: {
      xp: context.xp,
      streak: context.streak,
      lastLoginDate: context.lastLoginDate,
    },
  })
  studentContexts.set(userId, context)
}

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 10,
  initialDelay = 1000,
): Promise<T> {
  let retries = 0
  while (retries < maxRetries) {
    try {
      return await operation()
    } catch (error: any) {
      if (
        error.status === 429 ||
        (error.response && error.response.status === 429) ||
        error.message.includes("Resource has been exhausted")
      ) {
        const delay = initialDelay * Math.pow(2, retries)
        console.log(`Retrying after ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        retries++
      } else {
        throw error
      }
    }
  }
  throw new Error(`Operation failed after ${maxRetries} retries`)
}

async function generateFinalQuiz(topic: string, concepts: string[], examples: string[]) {
  return retryWithExponentialBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `
      Como profesor experto, genera 4 preguntas diferentes para evaluar el aprendizaje sobre: ${topic}

      Conceptos estudiados:
      ${concepts.join("\n")}

      Ejemplos revisados:
      ${examples.join("\n")}

      Genera 4 preguntas diferentes de selección múltiple que evalúen la comprensión de los conceptos y ejemplos estudiados.
      
      Responde en formato JSON:
      {
        "questions": [
          {
            "question": "Primera pregunta",
            "options": ["A) opción 1", "B) opción 2", "C) opción 3", "D) opción 4"],
            "correctAnswer": "A",
            "explanation": "Explicación detallada"
          },
          // ... (3 preguntas más)
        ]
      }
    `
    const result = await model.generateContent(prompt)
    const response = JSON.parse(result.response.text())
    return response.questions
  })
}

async function analyzeDocument(nombre: string, contenido: string): Promise<{ title: string; topics: string[] }> {
  return retryWithExponentialBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `
      Analiza el siguiente documento y genera una lista de temas principales que se cubren en él.
      Si el contenido no es claro o está vacío, genera temas específicos basados en el título del documento.

      Título del documento: "${nombre}"
      Contenido del documento: "${contenido}"

      Instrucciones:
      1. Identifica los conceptos clave y temas principales del documento
      2. Si el contenido está vacío, infiere temas específicos basados en el título
      3. Genera exactamente 5 temas principales y específicos
      4. Asegúrate de que los temas sean relevantes para el estudio y aprendizaje

      Responde SOLO con una lista de 5 temas específicos, uno por línea, sin numeración ni puntos.
    `
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const topics = text.split("\n").filter((topic) => topic.trim() !== "")

    return {
      title: nombre,
      topics: topics.length === 5 ? topics : generateDefaultTopics(nombre),
    }
  })
}

function generateDefaultTopics(nombre: string): string[] {
  return [
    "Introducción a " + nombre,
    "Conceptos básicos de " + nombre,
    "Aplicaciones prácticas",
    "Ejemplos y casos de estudio",
    "Conclusiones y resumen",
  ]
}

async function generateQuiz(topic: string, context: string, materials: Material[]) {
  return retryWithExponentialBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `
    Como profesor experto, genera una pregunta de evaluación sobre ${topic}.
    
    Contexto del material:
    ${materials.map((m) => `- ${m.nombre}`).join("\n")}
    
    Genera una pregunta específica basada en el tema y los nombres de los materiales disponibles.
    La pregunta debe ser de selección múltiple con 4 opciones.
    
    Responde en formato JSON:
    {
      "question": "Pregunta específica basada en el tema",
      "options": [
        "Primera opción específica",
        "Segunda opción específica",
        "Tercera opción específica",
        "Cuarta opción específica"
      ],
      "correctAnswer": "A, B, C o D",
      "explanation": "Explicación educativa que ayude a comprender el concepto"
    }
    `
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    return JSON.parse(response)
  })
}

async function checkQuizAnswer(quiz: any, userAnswer: string) {
  const isCorrect = userAnswer.toUpperCase() === quiz.correctAnswer
  return {
    isCorrect,
    feedback: isCorrect
      ? `¡Excelente! 🎉 Recuerda: ${quiz.explanation}`
      : `La respuesta correcta es ${quiz.correctAnswer}. ${quiz.explanation}`,
  }
}

async function detectCurrentTopic(messages: string[], context = "") {
  return retryWithExponentialBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `
      Analiza esta conversación y contexto:
      
      Contexto del material: ${context}
      
      Últimos mensajes:
      ${messages.slice(-6).join("\n")}
      
      Identifica el tema específico que se está estudiando actualmente.
      Responde SOLO con el tema identificado.
    `
    const result = await model.generateContent(prompt)
    return result.response.text()
  })
}

async function updateStudentProgress(userId: number, topic: string, isCorrect: boolean) {
  const context = await getOrCreateStudentContext(userId)
  const now = new Date()
  const progressIndex = context.progress.findIndex((p) => p.topic === topic)

  if (progressIndex === -1) {
    context.progress.push({
      topic,
      lastReviewed: now,
      masteryLevel: isCorrect ? 1 : 0,
    })
  } else {
    const currentProgress = context.progress[progressIndex]
    currentProgress.lastReviewed = now
    currentProgress.masteryLevel = Math.max(0, Math.min(5, currentProgress.masteryLevel + (isCorrect ? 1 : -1)))
  }

  const xpGained = isCorrect ? Math.floor(Math.random() * 5) * 100 + 100 : 0
  context.xp += xpGained

  const lastLogin = context.lastLoginDate
  const today = new Date()
  if (today.toDateString() !== lastLogin.toDateString()) {
    if ((today.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24) <= 1) {
      context.streak += 1
    } else {
      context.streak = 1
    }
    context.lastLoginDate = today
  }

  await saveStudentContext(userId, context)

  return { xpGained, newStreak: context.streak }
}

async function getMaterialesActualizados(asignaturaId: number): Promise<Material[]> {
  const materials = await prisma.material.findMany({
    where: {
      idAsignatura: asignaturaId,
    },
    orderBy: {
      creadoEn: "desc",
    },
    select: {
      id: true,
      nombre: true,
      tipo: true,
      url: true,
      creadoEn: true,
      idAsignatura: true,
    },
  })

  const analyzedMaterials = await Promise.all(
    materials.map(async (material) => {
      try {
        const analyzed = await analyzeDocument(material.nombre, "")
        return {
          ...material,
          topics: analyzed.topics,
        }
      } catch (error) {
        console.error(`Error analizando material ${material.id}:`, error)
        return {
          ...material,
          topics: generateDefaultTopics(material.nombre),
        }
      }
    }),
  )

  return analyzedMaterials
}

async function selectTopic(topic: string, contenido: string) {
  return retryWithExponentialBackoff(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `
      Eres un tutor experto en el tema "${topic}".
      
      Contenido del documento relacionado:
      "${contenido}"

      Instrucciones:
      1. Analiza el contenido del documento proporcionado
      2. Si el contenido es relevante para el tema "${topic}", úsalo como base para tu explicación
      3. Si el contenido no es relevante o está vacío, genera una explicación detallada basada en tu conocimiento experto sobre "${topic}"
      4. Da una breve introducción motivadora al tema
      5. Explica los conceptos fundamentales de manera clara y concisa
      6. Proporciona ejemplos prácticos relacionados con el tema
      7. Haz 2-3 preguntas de comprensión para evaluar el entendimiento del estudiante
      8. Anima al estudiante a hacer preguntas si tiene dudas
      
      Limita tu respuesta a aproximadamente 400-500 palabras.
      NO menciones que estás generando contenido o que no tienes información específica.
      Enfócate en proporcionar una explicación interactiva, comprensible y específica sobre el tema.
    `
    const result = await model.generateContent(prompt)
    return result.response.text()
  })
}

async function getRelatedVideo(topic: string): Promise<string> {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: "snippet",
        q: topic + " educativo",
        type: "video",
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY,
        relevanceLanguage: "es",
      },
    })

    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId
      return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    } else {
      return ""
    }
  } catch (error) {
    console.error("Error al obtener video relacionado:", error)
    return ""
  }
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const headers = getRequestHeaders(event)
    const token = headers.authorization?.split(" ")[1]

    if (!token) {
      throw createError({
        statusCode: 401,
        message: "Acceso no autorizado",
      })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
        userId: number
        asignaturaId: number
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw createError({
          statusCode: 401,
          message: "SESSION_EXPIRED",
        })
      }
      throw error
    }

    const estudiante = await prisma.estudiante.findFirst({
      where: {
        id: decoded.userId,
        asignaturaId: decoded.asignaturaId,
      },
      include: {
        asignatura: true,
        usuario: true,
      },
    })

    if (!estudiante) {
      throw createError({
        statusCode: 404,
        message: "Estudiante no encontrado",
      })
    }

    const context = await getOrCreateStudentContext(decoded.userId)
    const body = await readBody(event)
    const { message, answer } = body

    let response = ""
    let quiz: any = null
    let answerFeedback = null
    let xpGained = 0
    let newStreak = context.streak
    let videoEmbed = ""

    const materials = await getMaterialesActualizados(decoded.asignaturaId)

    context.conversationHistory = context.conversationHistory.slice(-19)
    context.conversationHistory.push(`Usuario: ${message}`)

    if (message === "inicio") {
      response = `👋 ¡Bienvenido a tu asistente personal de estudio para ${estudiante.asignatura.nombre}!

Estoy aquí para ayudarte a prepararte para tus exámenes y evaluaciones. Podemos:

📚 Estudiar cualquier tema en profundidad
📝 Practicar con ejemplos reales
💡 Resolver tus dudas específicas
🎯 Evaluar tu comprensión con quizzes personalizados

Selecciona un tema del panel izquierdo para comenzar una sesión de estudio. Te guiaré paso a paso y al final evaluaremos tu comprensión con un quiz personalizado.

¿Listo para empezar? 💪`
    } else if (message.startsWith("STUDY_TOPIC:")) {
      const selectedTopic = message.replace("STUDY_TOPIC:", "").trim()
      context.currentTopic = selectedTopic

      // Buscar el documento que contiene el tema seleccionado
      const relevantDocument = materials.find((doc) =>
        doc.topics?.some((topic) => topic.toLowerCase() === selectedTopic.toLowerCase()),
      )

      if (relevantDocument) {
        response = await selectTopic(selectedTopic, relevantDocument.nombre)

        context.studySession = {
          topic: selectedTopic,
          startTime: new Date(),
          concepts: [],
          examples: [],
        }

        // Extraer conceptos y ejemplos de la respuesta
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const conceptsPrompt = `
          Extrae los conceptos clave mencionados en esta explicación:
          ${response}
          
          Responde solo con la lista de conceptos, uno por línea.
        `
        const conceptsResult = await model.generateContent(conceptsPrompt)
        context.studySession.concepts = conceptsResult.response.text().split("\n")

        const examplesPrompt = `
          Extrae los ejemplos mencionados en esta explicación:
          ${response}
          
          Responde solo con la lista de ejemplos, uno por línea.
        `
        const examplesResult = await model.generateContent(examplesPrompt)
        context.studySession.examples = examplesResult.response.text().split("\n")

        // Obtener video relacionado
        videoEmbed = await getRelatedVideo(selectedTopic)
        if (videoEmbed) {
          response += "\n\nAquí tienes un video relacionado con el tema:\n" + videoEmbed
        }
      } else {
        // Si no se encuentra un documento relevante, generar una respuesta basada en el tema
        response = await selectTopic(selectedTopic, "")
      }
    } else if (message.toLowerCase().includes("video") || message.toLowerCase().includes("repasar")) {
      if (context.currentTopic) {
        videoEmbed = await getRelatedVideo(context.currentTopic)
        if (videoEmbed) {
          response = `Aquí tienes un video para repasar el tema "${context.currentTopic}":\n${videoEmbed}`
        } else {
          response = `Lo siento, no pude encontrar un video adecuado para el tema "${context.currentTopic}".`
        }
      } else {
        response = "Primero necesitamos seleccionar un tema antes de buscar un video. ¿Qué tema te gustaría estudiar?"
      }
    } else if (message.toLowerCase().includes("quiz") || message.toLowerCase().includes("evaluar")) {
      if (context.studySession) {
        const questions = await generateFinalQuiz(
          context.studySession.topic,
          context.studySession.concepts,
          context.studySession.examples,
        )
        quiz = {
          questions,
          currentQuestion: 0,
        }
        response =
          "¡Excelente sesión de estudio! Vamos a evaluar tu comprensión con estas preguntas. Responde con la letra de la opción que consideres correcta (A, B, C o D):"
      } else {
        response = "Primero necesitamos estudiar un tema antes de hacer el quiz. ¿Qué tema te gustaría estudiar?"
      }
    } else if (answer && quiz) {
      const feedback = await checkQuizAnswer(quiz.questions[quiz.currentQuestion], answer)
      answerFeedback = feedback
      response = feedback.feedback

      const progressUpdate = await updateStudentProgress(
        decoded.userId,
        context.currentTopic || "Tema general",
        feedback.isCorrect,
      )
      xpGained = progressUpdate.xpGained
      newStreak = progressUpdate.newStreak
      quiz.currentQuestion++
      if (quiz.currentQuestion >= quiz.questions.length) {
        quiz = null
      }
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const prompt = `
        Eres un tutor virtual especializado en ${estudiante.asignatura.nombre}.
        
        Contexto actual:
        - Tema: ${context.currentTopic || "General"}
        - Últimos mensajes: ${context.messages.slice(-3).join("\n")}
        
        Mensaje del estudiante: "${message}"
        
        Instrucciones:
        1. Responde de manera clara y didáctica
        2. Si el estudiante hace una pregunta, explica con ejemplos
        3. Si detectas confusión, ofrece una explicación alternativa
        4. Mantén un tono motivador y positivo
        
        NO menciones el quiz final.
        Enfócate en ayudar al estudiante a comprender el tema.
      `
      const result = await model.generateContent(prompt)
      response = result.response.text()

      if (context.studySession) {
        if (response.toLowerCase().includes("ejemplo")) {
          context.studySession.examples.push(response)
        }
      }
    }

    context.messages.push(`Usuario: ${message}`)
    context.messages.push(`Asistente: ${response}`)
    if (context.messages.length > 40) {
      context.messages = context.messages.slice(-40)
    }

    context.conversationHistory.push(`Asistente: ${response}`)
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20)
    }

    await saveStudentContext(decoded.userId, context)

    const documents = await getMaterialesActualizados(decoded.asignaturaId)

    return {
      text: response,
      quiz,
      answerFeedback,
      currentTopic: context.currentTopic,
      videoEmbed,
      estudiante: {
        nombre: estudiante.nombre,
        nivel: Math.floor(context.xp / 1000) + 1,
      },
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.nombre,
        topics: doc.topics || [],
        type: doc.tipo,
        url: doc.url,
      })),
      topics: context.progress.map((p) => ({
        name: p.topic,
        progress: p.masteryLevel * 20,
        completed: p.masteryLevel === 5,
        inProgress: p.masteryLevel > 0 && p.masteryLevel < 5,
      })),
      xp: context.xp,
      xpGained,
      streak: newStreak,
      conversationHistory: context.conversationHistory,
    }
  } catch (error) {
    console.error("Error detallado:", error)
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500
      const message =
        error.message === "SESSION_EXPIRED"
          ? "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión."
          : `Error al procesar tu solicitud: ${error.message}`

      if ((error as any).status === 429) {
        return {
          text: "Lo siento, el sistema está experimentando una alta demanda en este momento. Por favor, intenta de nuevo en unos minutos.",
          documents: [],
          topics: [],
        }
      }

      throw createError({
        statusCode,
        message,
      })
    } else {
      throw createError({
        statusCode: 500,
        message: "Error desconocido al procesar tu solicitud",
      })
    }
  }
})

