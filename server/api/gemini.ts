import { defineEventHandler, readBody, createError } from "h3"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useRuntimeConfig } from "#imports"
import NodeCache from "node-cache"

// Crear una instancia de caché con un tiempo de vida de 30 minutos
const cache = new NodeCache({ stdTTL: 1800 });

// Configuración de reintentos
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000
};

// Definir interfaces para los errores
interface GeminiError {
  status?: number;
  message?: string;
}

// Función para esperar
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para calcular el tiempo de espera con backoff exponencial
const getRetryDelay = (retryCount: number) => {
  const delay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(2, retryCount),
    RETRY_CONFIG.maxDelay
  );
  return delay;
};

// Función para hacer la petición con reintentos
async function makeRequestWithRetry(genAI: any, model: string, prompt: string, config: any, retryCount = 0) {
  try {
    const genModel = genAI.getGenerativeModel({ 
      model,
      ...config
    });

    const result = await Promise.race([
      genModel.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000) // 30 segundos timeout
      )
    ]);

    return result.response.text();
  } catch (error: any) {
    if (retryCount < RETRY_CONFIG.maxRetries && 
        (error.status === 429 || error.message === 'Timeout' || error.status === 503)) {
      const delay = getRetryDelay(retryCount);
      console.log(`Reintentando en ${delay}ms... (Intento ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      await wait(delay);
      return makeRequestWithRetry(genAI, model, prompt, config, retryCount + 1);
    }
    throw error;
  }
}

// Definir modelos en orden de preferencia
const MODELS = [
  "gemini-1.5-flash",      // Modelo que sabemos que funciona
  "gemini-1.5-pro",        // Backup
  "gemini-2.0-flash-lite", // Alternativas más nuevas
  "gemini-2.0-flash"
];

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // Usar solo config.geminiApiKey
  const apiKey = config.geminiApiKey
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY no está definida en las variables de entorno")
    throw createError({
      statusCode: 500,
      message: "Error de configuración del servidor: GEMINI_API_KEY no está definida",
    })
  }

  try {
    const body = await readBody(event)
    const prompt = body.prompt || "";
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw createError({
        statusCode: 400,
        message: "El prompt es requerido y debe ser una cadena de texto no vacía",
      });
    }
    
    // Verificar caché
    const cacheKey = `gemini:${prompt}`;
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      console.log("Respuesta obtenida de caché");
      return cachedResponse;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Configuración común
    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024
    };

    // Intentar con cada modelo hasta que uno funcione
    let lastError: GeminiError | null = null;
    for (const model of MODELS) {
      try {
        console.log(`Intentando con modelo: ${model}`);
        const response = await makeRequestWithRetry(genAI, model, prompt, generationConfig);
        
        // Si llegamos aquí, la petición fue exitosa
        cache.set(cacheKey, response);
        return response;
      } catch (error: any) {
        console.error(`Error con modelo ${model}:`, error);
        lastError = error as GeminiError;
        
        // Si el error no es de cuota o timeout, intentar con el siguiente modelo
        if (error.status !== 429 && error.message !== 'Timeout' && error.status !== 503) {
          continue;
        }
      }
    }
    
    // Si llegamos aquí, ningún modelo funcionó
    throw createError({
      statusCode: lastError?.status || 500,
      message: `No se pudo generar contenido con ningún modelo: ${lastError?.message || 'Error desconocido'}`,
    });
    
  } catch (error: any) {
    console.error("Error al generar contenido con Gemini:", error);
    
    throw createError({
      statusCode: error.status || 500,
      message: error.message || 'Error desconocido',
      cause: error
    });
  }
});