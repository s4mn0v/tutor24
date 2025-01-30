// server/utils/geminiAI.ts
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import type { Part } from "@google/generative-ai";
import { extractDocumentContent } from "./documentExtractor";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeDocument(url: string, tipo: string): Promise<string[]> {
  try {
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
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.split('\n').filter(line => line.trim() !== '').slice(0, 5);
  } catch (error) {
    console.error("Error al analizar:", error);
    return [`Error: ${error instanceof Error ? error.message : 'Desconocido'}`];
  }
}