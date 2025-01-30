// server/utils/geminiAI.ts
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { Part } from "@google/generative-ai";
import { extractDocumentContent } from "./documentExtractor";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const cache = new Map<string, string[]>(); // Cache en memoria para evitar solicitudes duplicadas

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeDocument(url: string, tipo: string): Promise<string[]> {
  try {
    const cacheKey = `${url}-${tipo}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const content = await extractDocumentContent(url, tipo);
    let model: GenerativeModel;
    let prompt: string | (string | Part)[];

    if (tipo.includes('image')) {
      model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      const imagePart: Part = {
        inlineData: {
          data: Buffer.from(await fetch(content).then(r => r.arrayBuffer())).toString('base64'),
          mimeType: tipo
        }
      };
      prompt = [
        "Analiza esta imagen y lista los 5 principales temas o conceptos.",
        imagePart
      ];
    } else {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
      prompt = `Lista los 5 temas principales de este texto:\n\n${content}\n\nSolo la lista, sin texto adicional.`;
    }

    return await fetchWithRetries(model, prompt, cacheKey);
  } catch (error) {
    console.error("Error al analizar:", error);
    return [`Error: ${error instanceof Error ? error.message : 'Desconocido'}`];
  }
}

async function fetchWithRetries(model: GenerativeModel, prompt: string | (string | Part)[], cacheKey: string, retries = 3, delayMs = 5000): Promise<string[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const topics = text.split('\n').filter(line => line.trim() !== '').slice(0, 5);

      cache.set(cacheKey, topics); // Guarda en cache para evitar repeticiones
      return topics;
    } catch (error: any) {
      if (error.status === 429) {
        console.warn(`Límite de solicitudes alcanzado. Reintentando en ${delayMs}ms... (Intento ${attempt + 1}/${retries})`);
        await delay(delayMs);
        delayMs *= 2; // Aumenta el tiempo de espera exponencialmente
      } else {
        throw error;
      }
    }
  }
  throw new Error("Se alcanzó el máximo de reintentos debido a errores 429.");
}
