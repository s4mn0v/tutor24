<template>
  <div class="min-h-screen bg-white dark:bg-zinc-900">
    <!-- Sección del Encabezado -->
    <header class="bg-white dark:bg-zinc-800 shadow-sm">
      <div class="container mx-auto px-4 py-6">
        <h1 class="text-4xl font-bold text-zinc-900 dark:text-white">
          Noticias de Inteligencia Artificial para Estudiantes
        </h1>
        <p class="mt-2 text-zinc-600 dark:text-zinc-300">
          Mantente actualizado con las últimas noticias y avances en IA relevantes para tu educación
        </p>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="container mx-auto px-4 py-8">
      <!-- Sección de Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Noticias Totales
          </h3>
          <p class="text-3xl font-bold text-blue-500">{{ articles.length }}</p>
        </div>
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Interacciones con Gemini
          </h3>
          <p class="text-3xl font-bold text-green-500">{{ geminiInteractions }}</p>
        </div>
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Última Actualización
          </h3>
          <p class="text-lg text-zinc-600 dark:text-gray-300">
            {{ formatDate(lastUpdate) }}
          </p>
        </div>
      </div>

      <!-- Estado de Error -->
      <div v-if="error" class="bg-red-500 text-white p-4 rounded-lg mb-8">
        {{ error }}
      </div>

      <!-- Estado de Carga -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Cuadrícula de Noticias -->
      <div v-else-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="article in articles" :key="article.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out transform hover:scale-105">
          <div class="relative">
            <a :href="article.url" target="_blank" rel="noopener noreferrer">
              <img :src="article.image" :alt="article.title" class="w-full h-56 object-cover cursor-pointer"
                @error="handleImageError">
            </a>
            <div class="absolute top-0 right-0 m-4">
              <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                {{ article.category }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-3 text-zinc-900 dark:text-white">
              {{ article.title }}
            </h2>
            <p class="text-zinc-600 dark:text-gray-300 mb-4 text-base leading-relaxed">
              {{ article.summary }}
            </p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-zinc-500 dark:text-gray-400">
                {{ formatDate(article.date) }}
              </span>
              <button @click="showArticleDetails(article)"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center space-x-2">
                <span>Más información</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div v-else class="text-center py-12">
        <p class="text-zinc-600 dark:text-gray-300 text-xl">No hay noticias disponibles en este momento.</p>
      </div>

      <!-- Modal de Artículo -->
      <div v-if="selectedArticle"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <h2 class="text-3xl font-bold text-zinc-900 dark:text-white">
                {{ selectedArticle.title }}
              </h2>
              <button @click="closeModal"
                class="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <img :src="selectedArticle.image" :alt="selectedArticle.title"
              class="w-full h-80 object-cover mb-6 rounded-lg" @error="handleImageError">

            <!-- Resumen de Gemini -->
            <div class="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-6 mb-6">
              <h3 class="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
                Resumen por IA
              </h3>
              <div v-if="geminiLoading" class="flex justify-center items-center h-20">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
              <div v-else-if="geminiSummary" class="text-zinc-600 dark:text-gray-300 text-lg space-y-4">
                <div class="prose prose-invert max-w-none whitespace-pre-line">
                  {{ geminiSummary }}
                </div>
              </div>
            </div>

            <!-- Chat con Gemini -->
            <div class="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-6">
              <h3 class="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
                Consulta a Gemini sobre esta noticia
              </h3>
              <div class="mb-4">
                <textarea v-model="userMessage"
                  class="w-full p-4 border rounded-md bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white text-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Haz cualquier pregunta sobre esta noticia..." rows="4"></textarea>
              </div>
              <div class="flex justify-end space-x-4">
                <button @click="askGemini" :disabled="!userMessage || geminiLoading"
                  class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center space-x-2">
                  <span>{{ geminiLoading ? 'Procesando...' : 'Preguntar a Gemini' }}</span>
                  <svg v-if="!geminiLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                </button>
              </div>

              <!-- Respuesta de Gemini -->
              <div v-if="geminiResponse"
                class="mt-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-300 dark:border-zinc-700">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="bg-green-500 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 class="text-xl font-semibold text-zinc-900 dark:text-white">Respuesta de Gemini</h4>
                  </div>
                  <button @click="closeGeminiResponse"
                    class="text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div class="prose dark:prose-invert max-w-none">
                  <p class="text-zinc-600 dark:text-gray-300 text-lg">{{ geminiResponse }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Article {
  id: number;
  title: string;
  summary: string;
  fullContent: string;
  image: string;
  date: string;
  category: string;
  url?: string;
  description?: string;
  content?: string;
}

// Usar useState para almacenar las noticias
const articles = useState<Article[]>('articles', () => []);
const selectedArticle = ref<Article | null>(null);
const userMessage = ref('');
const geminiLoading = ref(false);
const geminiInteractions = ref(0);
const geminiResponse = ref<string | null>(null);
const geminiSummary = ref<string | null>(null);
const loading = ref(true);
const error = ref('');
const lastUpdate = ref(new Date().toISOString());

// Función para esperar un tiempo determinado (para reintentos)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

onMounted(() => {
  // Solo cargar noticias si no están ya en el estado
  if (articles.value.length === 0) {
    fetchLatestNews();
  } else {
    loading.value = false; // Si ya hay noticias, no mostrar carga
  }
  setupDailyUpdate();
});

function setupDailyUpdate() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    fetchLatestNews();
    setupDailyUpdate();
  }, timeUntilMidnight);
}

async function fetchLatestNews() {
  try {
    loading.value = true;
    error.value = '';

    // Limpiar caché para forzar nueva carga
    localStorage.removeItem('cachedNews');
    localStorage.removeItem('cachedNewsTime');

    const response = await fetch('/api/news');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.articles?.length > 0) {
      // Limitar explícitamente a 3 noticias
      const limitedArticles = data.articles.slice(0, 3);
      
      // Usar la descripción directamente en lugar de generar con Gemini
      articles.value = limitedArticles.map((article: any, index: number) => ({
        id: index + 1,
        title: article.title || 'Sin título',
        summary: article.description || 'No hay descripción disponible',
        fullContent: article.content || article.description || 'Contenido no disponible',
        image: article.urlToImage || 'https://via.placeholder.com/800x400?text=IA+News',
        date: article.publishedAt || new Date().toISOString(),
        category: determineCategory(article.title),
        url: article.url,
        description: article.description,
        content: article.content
      }));
      
      // Guardar en caché
      const now = new Date().getTime();
      localStorage.setItem('cachedNews', JSON.stringify(articles.value));
      localStorage.setItem('cachedNewsTime', now.toString());
    } else {
      error.value = 'No se encontraron noticias de IA. Mostrando contenido de respaldo.';
      useBackupNews();
    }

    lastUpdate.value = new Date().toISOString();
  } catch (err) {
    console.error('Error al obtener noticias:', err);
    error.value = 'Error al cargar las noticias de IA. Mostrando contenido de respaldo.';
    useBackupNews();
  } finally {
    loading.value = false;
  }
}

function determineCategory(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('gpt') || lowerTitle.includes('lenguaje')) {
    return 'Avances en IA';
  } else if (lowerTitle.includes('investigación') || lowerTitle.includes('estudio')) {
    return 'Investigación';
  } else if (lowerTitle.includes('robot') || lowerTitle.includes('automati')) {
    return 'Robótica';
  } else if (lowerTitle.includes('medicina') || lowerTitle.includes('salud')) {
    return 'Salud';
  } else if (lowerTitle.includes('negocio') || lowerTitle.includes('empresa')) {
    return 'Negocios';
  } else {
    return 'Tecnología';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'https://via.placeholder.com/800x400?text=IA+News';
}

async function showArticleDetails(article: Article) {
  selectedArticle.value = article;
  geminiResponse.value = null;
  geminiSummary.value = null;
  await getGeminiSummary(article);
}

async function getGeminiSummary(article: Article) {
  geminiLoading.value = true;
  
  try {
    // Verificar si ya existe un resumen en caché para este artículo
    const cacheKey = `gemini_summary_${article.id}`;
    const cachedSummary = localStorage.getItem(cacheKey);
    
    if (cachedSummary) {
      geminiSummary.value = cachedSummary;
    } else {
      geminiSummary.value = await generateDetailedSummary(article);
      // Guardar en caché
      localStorage.setItem(cacheKey, geminiSummary.value);
      geminiInteractions.value++;
    }
  } catch (error) {
    console.error('Error al obtener el resumen de Gemini:', error);
    geminiSummary.value = 'Lo sentimos, no se pudo generar el resumen en este momento. Por favor, intenta de nuevo más tarde.';
  } finally {
    geminiLoading.value = false;
  }
}

async function generateDetailedSummary(article: Article): Promise<string> {
  const prompt = `
      Genera un resumen detallado y coherente del siguiente artículo de noticias. El resumen debe tener máximo 15 líneas y seguir esta estructura:
      1. Título del resumen (basado en el contenido del artículo, no repetir el título original)
      2. Línea en blanco
      3. Un párrafo introductorio que capture la esencia del artículo (máximo 3 líneas)
      4. Línea en blanco
      5. "Puntos clave:" (en una línea separada)
      6. 3-5 puntos clave del artículo, cada uno en una línea separada y comenzando con un guion (-)
      7. Línea en blanco (si es necesario para llegar a 15 líneas)
      8. Una o dos oraciones de conclusión que resuman las implicaciones o la importancia del artículo (máximo 2 líneas)
      Artículo:
      Título: ${article.title}
      Contenido: ${article.fullContent}
      Resumen (máximo 15 líneas):
    `;

  let retries = 0;
  const maxRetries = 3;
  let delay = 1000; // 1 segundo inicial
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (response.status === 429 && retries < maxRetries - 1) {
        console.log(`Límite de cuota alcanzado. Reintentando en ${delay}ms...`);
        await wait(delay);
        retries++;
        delay *= 2; // Espera exponencial
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.error("Error al generar resumen con Gemini:", error);
      retries++;
      
      if (retries >= maxRetries) {
        throw new Error("No se pudo generar el resumen. Por favor, intenta de nuevo más tarde.");
      }
      
      await wait(delay);
      delay *= 2; // Espera exponencial
    }
  }
  
  throw new Error("No se pudo generar el resumen después de varios intentos.");
}

async function askGemini() {
  if (!userMessage.value || !selectedArticle.value) return;

  geminiLoading.value = true;
  let retries = 0;
  const maxRetries = 3;
  let delay = 1000; // 1 segundo inicial
  
  while (retries < maxRetries) {
    try {
      const prompt = `
        Contexto: Estás analizando un artículo sobre inteligencia artificial con el siguiente título y contenido:
  
        Título: ${selectedArticle.value.title}
        Contenido: ${selectedArticle.value.fullContent}
  
        Pregunta del usuario: ${userMessage.value}
  
        Instrucciones:
        1. Responde a la pregunta del usuario de manera directa y concisa.
        2. Utiliza la información del artículo como contexto, pero no te limites estrictamente a ella.
        3. Si la pregunta no está directamente relacionada con el artículo, proporciona una respuesta general y luego intenta relacionarla con algún aspecto del artículo si es posible.
        4. Sé creativo y analítico en tu respuesta, ofreciendo perspectivas interesantes cuando sea apropiado.
        5. Si la pregunta requiere información que no está en el artículo, puedes hacer suposiciones razonables o mencionar que esa información específica no está disponible en el texto.
  
        Respuesta:
      `;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (response.status === 429 && retries < maxRetries - 1) {
        console.log(`Límite de cuota alcanzado. Reintentando en ${delay}ms...`);
        await wait(delay);
        retries++;
        delay *= 2; // Espera exponencial
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      geminiResponse.value = await response.text();
      geminiInteractions.value++;
      userMessage.value = '';
      break; // Salir del bucle si la solicitud fue exitosa
      
    } catch (error) {
      console.error('Error al consultar a Gemini:', error);
      retries++;
      
      if (retries >= maxRetries) {
        geminiResponse.value = "Error al procesar la pregunta. Por favor, intenta de nuevo más tarde.";
        break;
      }
      
      await wait(delay);
      delay *= 2; // Espera exponencial
    }
  }
  
  geminiLoading.value = false;
}

function useBackupNews() {
  articles.value = [
    {
      id: 1,
      title: "GPT-4 establece nuevo récord en pruebas de razonamiento",
      summary: "OpenAI ha anunciado un avance significativo con GPT-4, su último modelo de lenguaje. El sistema ha superado significativamente a sus predecesores en múltiples pruebas de razonamiento y comprensión del lenguaje natural.",
      fullContent: "OpenAI ha anunciado que GPT-4 ha establecido nuevos récords en diversas pruebas de razonamiento y comprensión del lenguaje natural. Este avance representa un salto significativo en las capacidades de los modelos de lenguaje y podría tener implicaciones importantes en campos como la investigación científica, la educación y el desarrollo de software.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
      date: new Date().toISOString(),
      category: "Avances en IA",
      url: "https://example.com/gpt4-record"
    },
    // ... más noticias de respaldo
  ];
}

function closeModal() {
  selectedArticle.value = null;
  geminiResponse.value = null;
  geminiSummary.value = null;
}

function closeGeminiResponse() {
  geminiResponse.value = null;
}
</script>

<style>
.prose {
  max-width: none;
}

@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.gemini-response-enter-active {
  animation: slideIn 0.3s ease-out;
}
</style>