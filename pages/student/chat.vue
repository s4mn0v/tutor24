<template>
  <div class="h-screen w-full overflow-hidden">
    <div class="w-full mx-auto h-full overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-[300px,1fr] h-full overflow-hidden">
        <!-- Panel Lateral (colapsable en móvil) -->
        <div :class="[
          'bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 transition-all duration-300 overflow-hidden flex flex-col',
          isSidebarOpen ? 'max-h-[70vh] md:max-h-screen' : 'max-h-[60px]'
        ]">
          <div class="p-4 border-b border-gray-800 flex items-center justify-between cursor-pointer" @click="toggleSidebar">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-base font-bold text-white">
                  {{ getInitials(studentName || 'Estudiante') }}
                </div>
                <div class="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center text-gray-900 font-bold text-xs border-2 border-gray-900">
                  {{ studentLevel }}
                </div>
              </div>
              <div>
                <h2 class="text-white font-medium text-sm">{{ studentName || 'Estudiante' }}</h2>
                <div class="flex items-center gap-1 text-xs text-gray-400">
                  <span class="text-purple-400">⭐</span>
                  <span>{{ xp }} XP</span>
                </div>
              </div>
            </div>
            <div class="text-gray-400 transform transition-transform" :class="isSidebarOpen ? 'rotate-180' : ''">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div class="flex-1 overflow-hidden flex flex-col">
            <!-- Progreso General -->
            <div class="p-4">
              <div class="flex justify-between items-center mb-1">
                <h3 class="text-white font-medium text-sm">Progreso General</h3>
                <span class="text-purple-400 font-medium text-sm">{{ Math.round(overallProgress) }}%</span>
              </div>
              <div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  :style="{ width: `${overallProgress}%` }"
                ></div>
              </div>
            </div>

            <!-- Documentos y Temas -->
            <div class="px-4 pb-2">
              <div class="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Material de Estudio
              </div>
            </div>

            <div class="overflow-y-auto flex-grow scrollbar-thin px-4 pb-4">
              <div v-if="documents && documents.length > 0" class="space-y-2">
                <div v-for="(doc, docIndex) in documents" 
                     :key="doc.id" 
                     class="rounded-lg mb-2">
                  <div 
                    @click="toggleDocument(doc, docIndex)"
                    class="flex items-center justify-between p-3 bg-gray-800/50 cursor-pointer hover:bg-gray-700/50 transition-all rounded-lg text-sm"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="text-purple-400 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <span class="text-gray-100 truncate font-medium">{{ formatDocumentTitle(doc.title) }}</span>
                    </div>
                    <span class="text-gray-400 transform transition-transform flex-shrink-0" 
                          :class="doc.isExpanded ? 'rotate-180' : ''">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                  
                  <div v-if="doc.isExpanded" class="mt-1 pl-2 space-y-1">
                    <div 
                      v-for="topic in doc.topics" 
                      :key="`${doc.id}-${topic}`"
                      @click="selectTopic(topic)"
                      class="p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 cursor-pointer transition-all flex items-center gap-2 group rounded-lg text-sm"
                    >
                      <div class="w-2 h-2 rounded-full flex-shrink-0"
                           :class="[
                             isTopicCompleted(topic) ? 'bg-green-500' :
                             isTopicInProgress(topic) ? 'bg-yellow-500' :
                             'bg-gray-600'
                           ]">
                      </div>
                      <span class="flex-1 truncate">{{ topic }}</span>
                      <span class="opacity-0 group-hover:opacity-100 text-purple-400 text-xs flex-shrink-0 flex items-center gap-1">
                        Estudiar
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-400 text-sm p-3 bg-gray-800/30 rounded-lg">
                <div class="flex flex-col items-center justify-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No hay documentos disponibles</p>
                  <p class="text-xs mt-1">Tu profesor aún no ha subido material</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Área Principal -->
        <div class="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-none md:rounded-r-xl">
          <!-- Header -->
          <div class="p-4 border-b border-gray-800">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Tu Asistente de Aprendizaje
                </h1>
                <div v-if="currentTopic" class="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  <span class="truncate max-w-[200px] md:max-w-[400px]">{{ currentTopic }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-lg">
                  <span class="text-purple-400">⭐</span>
                  <span class="text-white font-medium">{{ xp }}</span>
                  <span class="text-gray-400">XP</span>
                </div>
                <div class="text-gray-400 hidden sm:block">
                  {{ formatConnectedTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div ref="chatContainer" 
               class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-for="(message, index) in chatMessages" 
                 :key="index"
                 class="flex w-full mb-4"
                 :class="[message.role === 'user' ? 'justify-end' : 'justify-start']">
              <div :class="[
                'max-w-[90%] md:max-w-[85%] rounded-lg p-3 md:p-4 shadow-lg',
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                  : 'bg-gray-800/90 text-white border border-gray-700/50'
              ]">
                <!-- Contenido del mensaje -->
                <div class="prose prose-invert max-w-none text-sm">
                  <div v-html="sanitizeHTML(message.content || message.text || '')"></div>
                </div>
                
                <!-- Video Embed -->
                <div v-if="message.videoEmbed || (message.videoData && message.videoData.videoId)" class="mt-4 rounded-lg overflow-hidden border border-gray-700/50">
                  <div v-if="message.videoEmbed" v-html="sanitizeHTML(message.videoEmbed)"></div>
                  <div v-else-if="message.videoData && message.videoData.videoId" class="video-embed">
                    <iframe 
                      v-if="message.videoData.provider === 'youtube'" 
                      :src="`https://www.youtube.com/embed/${message.videoData.videoId}`" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>

                <!-- Quiz Interface -->
                <div v-if="message.quiz" class="mt-4">
                  <div class="space-y-3">
                    <h3 class="text-sm md:text-base font-medium text-white bg-gray-700/30 p-3 rounded-lg border-l-4 border-purple-500">{{ message.quiz.question }}</h3>
                    <div class="space-y-2">
                      <button
                        v-for="(option, optIndex) in message.quiz.options" 
                        :key="optIndex"
                        @click="selectAnswer(String.fromCharCode(65 + optIndex))"
                        class="w-full group"
                      >
                        <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-600/30 transition-all duration-300 text-sm border border-gray-700/30 hover:border-purple-500/30">
                          <div class="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-600/50 flex items-center justify-center font-medium text-blue-300 text-sm">
                            {{ String.fromCharCode(65 + optIndex) }}
                          </div>
                          <div class="flex-1 text-left">
                            {{ option }}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Answer Feedback -->
                <div v-if="message.answerFeedback" 
                     class="mt-4 p-3 rounded-lg"
                     :class="[
                       message.answerFeedback.isCorrect 
                         ? 'bg-green-900/20 border border-green-500/20' 
                         : 'bg-red-900/20 border border-red-500/20'
                     ]">
                  <div class="flex items-start gap-3">
                    <div :class="[
                      'flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center',
                      message.answerFeedback.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    ]">
                      <span v-if="message.answerFeedback.isCorrect" class="text-green-400">✓</span>
                      <span v-else class="text-red-400">✗</span>
                    </div>
                    <div>
                      <p class="font-medium mb-1 text-sm">
                        {{ message.answerFeedback.isCorrect ? '¡Correcto!' : 'Incorrecto' }}
                      </p>
                      <p class="text-gray-300 text-sm">{{ message.answerFeedback.feedback }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas cuando hay un tema activo -->
          <div v-if="currentTopic" class="px-4 py-2 border-t border-gray-800 flex flex-wrap gap-2">
            <button 
              @click="requestContent('quiz')"
              class="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quiz
            </button>
            <button 
              @click="requestContent('video')"
              class="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Video
            </button>
            <button 
              @click="requestContent('examples')"
              class="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Más ejemplos
            </button>
          </div>

          <!-- Input Form -->
          <div class="p-4 border-t border-gray-800 bg-gray-900/50">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input
                v-model="userInput"
                type="text"
                placeholder="Escribe tu mensaje aquí..."
                class="flex-1 p-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                :disabled="isLoading"
              />
              <button
                type="submit"
                :disabled="isLoading"
                class="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium text-sm shadow-lg"
              >
                <span v-if="isLoading">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </span>
                <span>{{ isLoading ? 'Procesando...' : 'Enviar' }}</span>
                <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Interfaces
interface Document {
  id: number
  title: string
  topics: string[]
  isExpanded: boolean
  type: string
  url: string
  createdAt?: Date
  updatedAt?: Date
}

interface ChatMessage {
  role?: 'user' | 'assistant'
  content?: string
  text?: string | null
  messageType?: 'welcome' | 'topic' | 'response' | 'quiz' | 'quiz_response' | 'video'
  welcomeData?: {
    title: string
    description: string
    features: Array<{
      icon: string
      title: string
      description: string
    }>
    cta: string
  }
  topicData?: {
    title: string
    key_concepts: string[]
    examples: Array<{
      title: string
      description: string
    }>
  }
  currentTopic?: string
  quiz?: {
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
  }
  answerFeedback?: {
    isCorrect: boolean
    feedback: string
  }
  videoData?: {
    provider: string
    videoId: string
    title: string
    description?: string
    thumbnailUrl?: string
  }
  videoEmbed?: string
  xp?: number
}

// Estados
const token = ref<string | null>(null)
const documents = ref<Document[]>([])
const studentName = ref('')
const studentLevel = ref(1)
const xp = ref(0)
const userInput = ref('')
const isLoading = ref(false)
const chatMessages = ref<ChatMessage[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const currentTopic = ref('')
const topics = ref<any[]>([])
const startTime = ref(Date.now())
const currentTime = ref(Date.now())
const timeInterval = ref<NodeJS.Timeout | null>(null)
const isSidebarOpen = ref(true)

// Tiempo conectado
const formatConnectedTime = computed(() => {
  const diff = Math.floor((currentTime.value - startTime.value) / 1000)
  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

// Funciones
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

// Función para alternar la visibilidad del sidebar en móvil
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Función para expandir/colapsar un documento
const toggleDocument = (doc: Document, index: number) => {
  doc.isExpanded = !doc.isExpanded
  
  // No cargar automáticamente el primer tema, dejar que el usuario elija
}

// Función para obtener el token
function getToken(): string | null {
  if (token.value) return token.value
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    token.value = storedToken
    return storedToken
  }
  return null
}

// Modificar la función sanitizeHTML para evitar duplicación
const sanitizeHTML = (content: string): string => {
  if (!content) return ''
  
  // Evitar procesar contenido que ya parece HTML
  if (content.includes('<div') || content.includes('<p') || content.includes('<h')) {
    return DOMPurify.sanitize(content, {
      ADD_TAGS: ['iframe', 'style', 'svg', 'path', 'polygon', 'rect', 'circle', 'line', 'polyline'],
      ADD_ATTR: ['class', 'style', 'xmlns', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 
                'stroke-linecap', 'stroke-linejoin', 'points', 'x', 'y', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'd',
                'frameborder', 'allow', 'allowfullscreen', 'src']
    })
  }
  
  // Procesar como markdown solo si no es HTML
  const htmlContent = marked.parse(content, { async: false }) as string
  return DOMPurify.sanitize(htmlContent)
}

// Función para hacer scroll al final del chat
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Función para actualizar XP
const updateXP = (newXP: number) => {
  xp.value = newXP
}

// Función para actualizar el progreso de un tema
const updateProgress = (topic: string | undefined, isCorrect?: boolean) => {
  if (!topic) return
  const topicIndex = topics.value.findIndex(t => t.name === topic)
  if (topicIndex === -1) {
    topics.value.push({
      name: topic,
      progress: isCorrect ? 20 : 0,
      completed: false,
      inProgress: true
    })
  } else {
    const currentTopic = topics.value[topicIndex]
    if (isCorrect) {
      currentTopic.progress = Math.min(100, currentTopic.progress + 20)
    }
    currentTopic.completed = currentTopic.progress === 100
    currentTopic.inProgress = currentTopic.progress > 0 && currentTopic.progress < 100
  }
}

// Calcular progreso general
const overallProgress = computed(() => {
  if (topics.value.length === 0) return 0
  return topics.value.reduce((acc, topic) => acc + (topic.progress || 0), 0) / topics.value.length
})

// Función para formatear el título del documento
const formatDocumentTitle = (title: string): string => {
  return title.replace(/\.[^/.]+$/, "").toUpperCase()
}

// Funciones para verificar el estado de los temas
const isTopicCompleted = (topic: string): boolean => {
  return topics.value.find(t => t.name === topic)?.completed || false
}

const isTopicInProgress = (topic: string): boolean => {
  return topics.value.find(t => t.name === topic)?.inProgress || false
}

// Función para solicitar contenido específico (quiz, video, ejemplos)
const requestContent = (type: string) => {
  if (!currentTopic.value) return
  
  let message = '';
  switch (type) {
    case 'quiz':
      message = `Quiz sobre ${currentTopic.value}`;
      break;
    case 'video':
      message = `Video sobre ${currentTopic.value}`;
      break;
    case 'examples':
      message = `Más ejemplos de ${currentTopic.value}`;
      break;
  }
  
  if (message) {
    sendMessage(undefined, message);
  }
}

// Función para seleccionar una respuesta en el quiz
const selectAnswer = (answer: string) => {
  sendMessage(undefined, answer)
}

// Modificar la función selectTopic para mostrar correctamente el contenido del tema
const selectTopic = async (topic: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    // En móvil, cerrar el sidebar después de seleccionar un tema
    if (window.innerWidth < 768) {
      isSidebarOpen.value = false
    }

    isLoading.value = true
    
    // Mostrar mensaje de carga
    chatMessages.value.push({
      role: 'user',
      content: `Quiero estudiar sobre: ${topic}`
    })
    
    await nextTick()
    scrollToBottom()
    
    // Mostrar mensaje de carga
    chatMessages.value.push({
      role: 'assistant',
      content: `<div class="flex items-center gap-3 bg-gray-800/50 p-3 rounded-lg">
        <svg class="animate-spin h-5 w-5 text-purple-400" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <div>
          <p class="text-sm font-medium">Preparando información sobre:</p>
          <p class="text-purple-400 font-semibold">${topic}</p>
        </div>
      </div>`
    })

    await nextTick()
    scrollToBottom()

    const response = await fetch('/api/students/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        message: `STUDY_TOPIC:${topic}`,
        initialContent: true // Indicar al backend que queremos el contenido inicial
      })
    })

    if (!response.ok) {
      throw new Error('Error al procesar el tema')
    }

    const data = await response.json()
    
    // Eliminar el mensaje de carga
    chatMessages.value.pop()

    // Mostrar el contenido inicial del tema de forma estructurada
    if (data.topicData) {
      const { title, key_concepts, examples } = data.topicData
      
      let conceptsHtml = ''
      if (key_concepts && key_concepts.length > 0) {
        conceptsHtml = `
          <div class="mt-4 bg-gray-800/30 p-3 rounded-lg border-l-4 border-purple-500">
            <h3 class="text-base font-semibold text-purple-400 mb-2">Conceptos clave:</h3>
            <ul class="list-disc pl-5 space-y-1 text-sm">
              ${key_concepts.map((concept: string) => `<li>${concept}</li>`).join('')}
            </ul>
          </div>
        `
      }
      
      // Mostrar solo un ejemplo inicial si hay disponibles
      let exampleHtml = ''
      if (examples && examples.length > 0) {
        const firstExample = examples[0]
        exampleHtml = `
          <div class="mt-4">
            <h3 class="text-base font-semibold text-purple-400 mb-2">Ejemplo práctico:</h3>
            <div class="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
              <h4 class="font-medium text-white text-sm">${firstExample.title}</h4>
              <p class="text-gray-300 text-sm mt-2">${firstExample.description}</p>
            </div>
          </div>
        `
      }
      
      chatMessages.value.push({
        role: 'assistant',
        content: `
          <div class="space-y-3">
            <div class="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-lg font-bold text-white">${title || topic}</h2>
            </div>
            
            ${data.text ? `<p class="text-gray-300 text-sm">${data.text}</p>` : ''}
            
            ${conceptsHtml}
            ${exampleHtml}
            
            <p class="text-gray-300 text-sm mt-3 bg-gray-800/20 p-3 rounded-lg border border-gray-700/30">
              Puedes solicitar más ejemplos, videos o realizar un quiz sobre este tema usando los botones de abajo o escribiendo en el chat.
            </p>
          </div>
        `
      })
    } else if (data.text) {
      // Si no hay datos estructurados, mostrar el texto plano
      chatMessages.value.push({
        role: 'assistant',
        content: data.text
      })
    }

    if (data.topics) {
      topics.value = data.topics.map((topic: any) => ({
        name: topic.name,
        progress: topic.progress || 0,
        completed: topic.completed || false,
        inProgress: topic.inProgress || false
      }))
    }

    // Actualizar el tema actual
    currentTopic.value = data.currentTopic || topic

    // Scroll to bottom after adding new message
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('Error al seleccionar tema:', error)
    chatMessages.value.push({
      role: 'assistant',
      content: `
        <div class="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm">Lo siento, hubo un error al cargar el tema. Por favor, intenta de nuevo.</p>
          </div>
        </div>
      `
    })
  } finally {
    isLoading.value = false
  }
}

// Modificar la función createWelcomeMessage para mostrar una introducción profesional
const createWelcomeMessage = (): ChatMessage => {
  return {
    role: 'assistant',
    content: `
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/30">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            ¡Bienvenido a tu Asistente de Aprendizaje Personal!
          </h2>
          
          <p class="text-sm mt-2">Soy tu tutor virtual, diseñado para ayudarte a dominar tus materias de estudio de manera interactiva y personalizada.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-all">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                📚
              </div>
              <h3 class="font-medium text-white text-sm">Estudio Guiado</h3>
            </div>
            <p class="text-sm text-gray-300 mt-2">Explora los temas de tus cursos con explicaciones claras y detalladas.</p>
          </div>
          
          <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-all">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                🧠
              </div>
              <h3 class="font-medium text-white text-sm">Evaluación</h3>
            </div>
            <p class="text-sm text-gray-300 mt-2">Pon a prueba tu conocimiento con cuestionarios interactivos.</p>
          </div>
          
          <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-all">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                🎯
              </div>
              <h3 class="font-medium text-white text-sm">Progreso</h3>
            </div>
            <p class="text-sm text-gray-300 mt-2">Visualiza tu avance y gana XP mientras aprendes a tu ritmo.</p>
          </div>
          
          <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-all">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                🎬
              </div>
              <h3 class="font-medium text-white text-sm">Multimedia</h3>
            </div>
            <p class="text-sm text-gray-300 mt-2">Accede a videos explicativos y recursos complementarios.</p>
          </div>
        </div>
        
        <div class="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30 mt-3">
          <p class="text-sm">Para comenzar, selecciona un tema del panel izquierdo o hazme una pregunta específica sobre algún concepto que quieras aprender.</p>
        </div>
        
        <p class="mt-3 text-purple-400 text-sm font-medium">¿En qué te puedo ayudar hoy?</p>
      </div>
    `
  }
}

// Modificar la función onMounted para manejar correctamente la respuesta del servidor
onMounted(async () => {
  timeInterval.value = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)

  // Ajustar sidebar en móvil al cargar
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    const response = await fetch('/api/students/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: 'inicio' })
    })

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor')
    }

    const data = await response.json()
    console.log('Datos completos:', data)
    
    // Si hay datos de bienvenida, mostrarlos
    if (data.welcomeData) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        messageType: 'welcome',
        welcomeData: data.welcomeData,
        content: `
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/30">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                ${data.welcomeData.title}
              </h2>
              <p class="text-sm mt-2">${data.welcomeData.description}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              ${data.welcomeData.features.map((feature: any) => `
                <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700/30 hover:border-purple-500/30 transition-all">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400">
                      ${feature.icon === 'book' ? '📚' : feature.icon === 'example' ? '📝' : feature.icon === 'quiz' ? '🧠' : '🎬'}
                    </div>
                    <h3 class="font-medium text-white text-sm">${feature.title}</h3>
                  </div>
                  <p class="text-sm text-gray-300 mt-2">${feature.description}</p>
                </div>
              `).join('')}
            </div>
            
            <p class="mt-3 text-purple-400 text-sm font-medium">${data.welcomeData.cta}</p>
          </div>
        `
      }
      chatMessages.value = [welcomeMessage]
    } else {
      // Si no hay datos de bienvenida, usar el mensaje personalizado
      chatMessages.value = [createWelcomeMessage()]
    }
    
    if (data.estudiante) {
      studentName.value = data.estudiante.nombre || 'Estudiante'
      studentLevel.value = data.estudiante.nivel || 1
    }

    if (data.xp) {
      xp.value = data.xp
    }

    if (data.topics) {
      topics.value = data.topics.map((topic: any) => ({
        name: topic.name,
        progress: topic.progress || 0,
        completed: topic.completed || false,
        inProgress: topic.inProgress || false
      }))
    }

    if (data.documents) {
      documents.value = data.documents.map((doc: any) => ({
        ...doc,
        isExpanded: false
      }))
      
      // Expandir automáticamente el primer documento si hay documentos disponibles
      if (documents.value.length > 0) {
        documents.value[0].isExpanded = true
        // No cargar automáticamente el primer tema, dejar que el usuario elija
      }
    }

  } catch (error) {
    console.error('Error inicial:', error)
    chatMessages.value = [{
      role: 'assistant',
      content: `
        <div class="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm">Lo siento, no pude cargar tu información. Por favor, intenta refrescar la página.</p>
          </div>
        </div>
      `
    }]
  }
})

// Modificar la función sendMessage para manejar diferentes tipos de respuestas
const sendMessage = async (event?: Event, answer?: string) => {
  if (isLoading.value) return

  let message: string

  if (answer) {
    message = answer
  } else {
    message = userInput.value.trim()
  }

  if (!message) return

  // Añadir mensaje del usuario al chat
  chatMessages.value.push({ role: 'user', content: message })
  userInput.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const currentToken = getToken()
    if (!currentToken) {
      throw new Error('No hay sesión activa')
    }

    // Determinar si es una solicitud específica
    let requestType = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ejemplo') || lowerMessage.includes('ejemplos')) {
      requestType = 'examples';
    } else if (lowerMessage.includes('video') || lowerMessage.includes('videos')) {
      requestType = 'video';
    } else if (lowerMessage.includes('quiz') || lowerMessage.includes('pregunta') || lowerMessage.includes('test')) {
      requestType = 'quiz';
    }

    // Añadir el tema actual y tipo de solicitud al payload para mantener contexto
    const payload = { 
      message: message.trim(),
      currentTopic: currentTopic.value,
      requestType: requestType
    }

    const response = await fetch('/api/students/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      throw new Error('Error en la respuesta del servidor')
    }

    const data = await response.json()
    console.log('Respuesta del servidor:', data)

    // Manejar diferentes tipos de mensajes
    if (data.messageType === 'quiz') {
      // Mostrar quiz sin revelar la respuesta correcta
      chatMessages.value.push({
        role: 'assistant',
        content: `
          <div class="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30 mb-3">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm font-medium">${data.text}</p>
            </div>
          </div>
        `,
        quiz: data.quiz
      })
    } else if (data.messageType === 'quiz_response') {
      // Mostrar feedback de respuesta
      chatMessages.value.push({
        role: 'assistant',
        content: data.text,
        answerFeedback: data.answerFeedback
      })
    } else if (data.messageType === 'video') {
      // Mostrar video
      chatMessages.value.push({
        role: 'assistant',
        content: `
          <div class="mb-3">
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm font-medium">${data.text}</p>
            </div>
          </div>
        `,
        videoData: data.videoData
      })
    } else if (data.messageType === 'examples' && data.examples) {
      // Mostrar ejemplos cuando se solicitan específicamente
      const examples = data.examples;
      let examplesHtml = '';
      
      if (examples && examples.length > 0) {
        examplesHtml = `
          <div class="mt-4">
            <h3 class="text-base font-semibold text-purple-400 mb-2">Ejemplos prácticos:</h3>
            <div class="space-y-3">
              ${examples.map((example: any) => `
                <div class="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                  <h4 class="font-medium text-white text-sm">${example.title}</h4>
                  <p class="text-gray-300 text-sm mt-2">${example.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      
      chatMessages.value.push({
        role: 'assistant',
        content: `
          <div class="space-y-3">
            <div class="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-lg font-bold text-white">Ejemplos de ${currentTopic.value}</h2>
            </div>
            ${examplesHtml}
          </div>
        `
      })
    } else if (data.messageType === 'topic') {
      // Mostrar información del tema cuando se solicita específicamente
      if (data.topicData) {
        const { title, key_concepts } = data.topicData;
        
        let conceptsHtml = '';
        if (key_concepts && key_concepts.length > 0 && requestType === 'concepts') {
          conceptsHtml = `
            <div class="mt-4 bg-gray-800/30 p-3 rounded-lg border-l-4 border-purple-500">
              <h3 class="text-base font-semibold text-purple-400 mb-2">Conceptos clave:</h3>
              <ul class="list-disc pl-5 space-y-1 text-sm">
                ${key_concepts.map((concept: string) => `<li>${concept}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        
        if (requestType === 'concepts') {
          chatMessages.value.push({
            role: 'assistant',
            content: `
              <div class="space-y-3">
                <div class="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 class="text-lg font-bold text-white">Conceptos de ${title || currentTopic.value}</h2>
                </div>
                ${conceptsHtml}
              </div>
            `
          });
        }
      } else {
        chatMessages.value.push({
          role: 'assistant',
          content: data.text
        });
      }
    } else {
      // Mensaje normal
      chatMessages.value.push({
        role: 'assistant',
        content: data.text
      });
    }

    if (data.estudiante) {
      studentName.value = data.estudiante.nombre || '';
      studentLevel.value = data.estudiante.nivel || 1;
    }

    if (data.topics) {
      topics.value = data.topics.map((topic: any) => ({
        name: topic.topic || topic.nombre || topic.name,
        progress: topic.progress || 0,
        completed: topic.completed || false,
        inProgress: topic.inProgress || false
      }));
    }

    if (data.xp) {
      updateXP(data.xp);
    }

    if (data.documents) {
      documents.value = data.documents.map((doc: any) => ({
        ...doc,
        isExpanded: doc.isExpanded || false
      }));
    }

    if (data.currentTopic) {
      currentTopic.value = data.currentTopic;
    }

    updateProgress(data.currentTopic, data.answerFeedback?.isCorrect);
  } catch (error) {
    console.error('Error completo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    if (errorMessage === 'SESSION_EXPIRED') {
      window.location.href = '/login';
    } else {
      chatMessages.value.push({
        role: 'assistant',
        content: `
          <div class="bg-red-900/20 p-3 rounded-lg border border-red-500/30">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm">Lo siento, ha ocurrido un error. ¿Podrías intentar reformular tu pregunta?</p>
            </div>
          </div>
        `
      });
    }
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

watch(overallProgress, (newProgress) => {
  if (newProgress === 100) {
    chatMessages.value.push({
      role: 'assistant',
      content: `
        <div class="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold text-white text-base">¡Felicidades!</h3>
              <p class="text-sm text-gray-300">Has completado todos los temas del curso. ¿Hay algo más en lo que pueda ayudarte?</p>
            </div>
          </div>
        </div>
      `
    })
    
    nextTick(() => {
      scrollToBottom()
    })
  }
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})
</script>

<style>
/* Estilos base */
.prose {
  color: #f3f4f6;
  line-height: 1.6;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  color: #fff;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
}

.prose h1 {
  font-size: 1.5rem;
}

.prose h2 {
  font-size: 1.25rem;
}

.prose h3 {
  font-size: 1.125rem;
}

.prose p {
  margin: 0.5rem 0;
}

.prose strong {
  color: #d8b4fe;
  font-weight: 600;
}

.prose ul, .prose ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin: 0.25rem 0;
}

.prose a {
  color: #d8b4fe;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

/* Personalización del scrollbar */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms
}

/* Estilos para video embed */
.video-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.video-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* Estilos para scrollbar delgado */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.3);
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.4);
  border-radius: 2px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.6);
}

/* Media queries para responsividad */
@media (max-width: 640px) {
  .prose {
    font-size: 0.875rem;
  }
  
  .prose h1, .prose h2, .prose h3, .prose h4 {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .md\:grid-cols-\[300px\,1fr\] {
    grid-template-columns: 1fr;
  }
}

/* Modificar los estilos para asegurar que el scroll funcione correctamente */
.flex-1.overflow-y-auto {
  max-height: calc(100vh - 200px); /* Ajustar según sea necesario */
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .flex-1.overflow-y-auto {
    max-height: calc(100vh - 180px); /* Ajustar para móviles */
  }
}
</style>

<style scoped>
.prose {
  color: inherit;
  line-height: 1.6;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  color: inherit;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.prose p {
  margin: 0.5rem 0;
}

.prose ul, .prose ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin: 0.25rem 0;
}

.prose a {
  color: #93c5fd;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}
</style>