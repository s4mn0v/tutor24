import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuración para cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Cargar variables de entorno desde .env
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  console.log('Cargando variables de entorno desde:', envPath);
  dotenv.config({ path: envPath });
} else {
  console.warn('Archivo .env no encontrado en:', envPath);
  dotenv.config();
}

const apiKey = process.env.NUXT_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: No se encontró la API key de Gemini en las variables de entorno");
  process.exit(1);
}

async function testGeminiDirectly() {
  try {
    console.log("Probando API de Gemini directamente...");
    
    // Importar la biblioteca de Gemini
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Probar generación de contenido con diferentes modelos
    const modelsToTest = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`\nProbando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Escribe un breve párrafo sobre la inteligencia artificial.";
        console.log(`Prompt: "${prompt}"`);
        
        const result = await model.generateContent(prompt);
        console.log("Respuesta:", result.response.text());
        console.log(`✅ Modelo ${modelName} funciona correctamente`);
      } catch (error) {
        console.error(`❌ Error con el modelo ${modelName}:`, error);
      }
    }
    
    console.log("\nPrueba completada.");
  } catch (error) {
    console.error("Error general:", error);
  }
}

testGeminiDirectly();