<template>
  <div class="h-screen p-2 md:p-4">
    <div class="max-w-full md:max-w-6xl mx-auto h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div class="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-4 bg-white/70 dark:bg-gray-800/30 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 h-full">
        <!-- Panel Lateral -->
        <div class="p-6 border-r border-gray-200/50 dark:border-gray-700/50">
          <!-- Perfil y Nivel -->
          <div class="text-center mb-8">
            <div class="relative inline-block">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-2">
                {{ getInitials(studentName || 'Estudiante') }}
              </div>
              <div class="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center text-gray-900 font-bold text-sm border-2 border-gray-300 dark:border-gray-800">
                {{ studentLevel }}
              </div>
            </div>
            <h2 class="text-gray-900 dark:text-white font-medium mt-4">{{ studentName || 'Estudiante' }}</h2>
          </div>

          <!-- Progreso General -->
          <div class="mb-8">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-gray-900 dark:text-white font-medium">Progreso General</h3>
              <span class="text-blue-400 font-medium">{{ Math.round(overallProgress) }}%</span>
            </div>
            <div class="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 transition-all duration-500 ease-out"
                :style="{ width: `${overallProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- Documentos y Temas -->
          <div class="space-y-4 mb-8">
            <h3 class="text-gray-900 dark:text-white font-medium mb-4">Material de Estudio</h3>
            <div v-if="documents && documents.length > 0" class="space-y-2">
              <div v-for="doc in documents" 
                   :key="doc.id" 
                   class="rounded-lg">
                <!-- Título del Documento -->
                <div 
                  @click="doc.isExpanded = !doc.isExpanded"
                  class="flex items-center justify-between p-3 bg-gray-100/50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-blue-400">
                      📄
                    </span>
                    <span class="text-gray-900 dark:text-gray-200">{{ formatDocumentTitle(doc.title) }}</span>
                  </div>
                  <span class="text-gray-500 dark:text-gray-400 transform transition-transform" 
                        :class="doc.isExpanded ? 'rotate-180' : ''">
                    ▼
                  </span>
                </div>
                
                <!-- Temas del Documento -->
                <div v-if="doc.isExpanded" class="bg-white/30 dark:bg-gray-900/30">
                  <div 
                    v-for="topic in doc.topics" 
                    :key="`${doc.id}-${topic}`"
                    @click="selectTopic(topic)"
                    class="p-3 text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/30 dark:hover:bg-gray-700/30 cursor-pointer transition-all flex items-center gap-2 group border-t border-gray-200/50 dark:border-gray-800/50"
                  >
                    <div class="w-2 h-2 rounded-full"
                         :class="[
                           isTopicCompleted(topic) ? 'bg-green-500' :
                           isTopicInProgress(topic) ? 'bg-yellow-500' :
                           'bg-gray-500'
                         ]">
                    </div>
                    <span class="flex-1">{{ topic }}</span>
                    <span class="opacity-0 group-hover:opacity-100 text-blue-400 text-sm">
                      Estudiar →
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-800 dark:text-gray-400 text-center p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              No hay materiales disponibles
            </div>
          </div>
        </div>

        <!-- Área Principal -->
        <div class="flex flex-col h-[calc(100vh-50px)]">
          <!-- Header -->
          <div class="p-4 md:p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Tu Asistente de Aprendizaje Inteligente
                </h1>
                <div v-if="currentTopic" class="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  Estudiando: {{ currentTopic }}
                </div>
              </div>
              <!-- Tiempo Conectado y XP -->
              <div class="flex items-center gap-3 bg-gray-200/30 dark:bg-gray-700/30 px-4 py-2 rounded-lg border border-gray-300/30 dark:border-gray-600/30">
                <div class="flex items-center gap-1">
                  <span class="text-blue-400">⏱️</span>
                  <span class="text-gray-900 dark:text-white font-medium">{{ formatConnectedTime }}</span>
                  <span class="text-gray-700 dark:text-gray-400 text-sm">conectado</span>
                </div>
                <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div class="group relative">
                  <div class="flex items-center gap-1">
                    <span class="text-purple-400">⭐</span>
                    <span class="text-gray-900 dark:text-white font-medium">{{ xp }}</span>
                    <span class="text-gray-700 dark:text-gray-400 text-sm">XP</span>
                  </div>
                  <div class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 
                              opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
                    Gana XP respondiendo correctamente
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div ref="chatContainer" 
               class="flex-1 overflow-y-auto p-6 space-y-6">
            <div v-for="(message, index) in chatMessages" 
                 :key="index"
                 :class="[
                   'flex',
                   message.role === 'user' ? 'justify-end' : 'justify-start'
                 ]">
              <div :class="[
                'rounded-2xl p-4 max-w-[80%] shadow-lg',
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 text-black dark:text-red-600 ml-auto' 
                  : 'bg-zinc-900/50 dark:bg-gray-700/50 backdrop-blur-sm text-black dark:text-red-600'
              ]">
                <div class="prose prose-invert max-w-none">
                  <div v-html="sanitizeAndFormat(message.content)"></div>
                  <div v-if="message.videoEmbed" class="mt-4" v-html="message.videoEmbed"></div>
                </div>
                <!-- Quiz Interface -->
                <div v-if="message.quiz" class="mt-4 space-y-4">
                  <div class="p-6 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-300/50 dark:border-gray-700/50">
                    <p class="font-medium text-lg mb-6">{{ message.quiz.question }}</p>
                    <div class="space-y-3">
                      <button
                        v-for="(option, index) in message.quiz.options" 
                        :key="index" 
                        class="w-full text-left p-4 rounded-xl border border-gray-300/50 dark:border-gray-600/50 bg-gray-100/30 dark:bg-gray-700/30 hover:bg-gray-200/30 dark:hover:bg-gray-700/50 hover:border-blue-500/50 transition-all duration-300 flex items-center space-x-4"
                        @click="selectAnswer(String.fromCharCode(65 + index))"
                      >
                        <span class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 flex items-center justify-center font-medium text-blue-400">
                          {{ String.fromCharCode(65 + index) }}
                        </span>
                        <span class="flex-1">{{ option }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Answer Feedback -->
                <div v-if="message.answerFeedback" 
                     :class="[
                       'mt-4 p-4 rounded-xl border',
                       message.answerFeedback.isCorrect 
                         ? 'bg-green-100/30 border-green-300/30 text-green-900 dark:bg-green-900/30 dark:border-green-500/30 dark:text-green-100' 
                         : 'bg-red-100/30 border-red-300/30 text-red-900 dark:bg-red-900/30 dark:border-red-500/30 dark:text-red-100'
                     ]">
                  <div class="flex items-start gap-3">
                    <div :class="[
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      message.answerFeedback.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    ]">
                      <span v-if="message.answerFeedback.isCorrect" 
                            class="text-xl">✓</span>
                      <span v-else 
                            class="text-xl">✗</span>
                    </div>
                    <div>
                      <p class="font-medium mb-1">
                        {{ message.answerFeedback.isCorrect ? '¡Correcto!' : 'Incorrecto' }}
                      </p>
                      <p class="text-sm opacity-90">{{ message.answerFeedback.feedback }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Form -->
          <div class="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-100/30 dark:bg-gray-800/30 backdrop-blur-sm">
            <form @submit.prevent="sendMessage" class="flex gap-3">
              <input
                v-model="userInput"
                type="text"
                placeholder="Escribe tu mensaje aquí..."
                class="flex-1 p-4 rounded-xl border border-gray-300/50 dark:border-gray-600/50 bg-gray-100 text-gray-900 dark:bg-gray-700/30 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                :disabled="isLoading"
              />
              <button
                type="submit"
                :disabled="isLoading"
                class="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl hover:from-blue-300 hover:to-blue-400 dark:hover:from-blue-500 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-medium shadow-lg shadow-blue-500/20"
              >
                <span v-if="isLoading">
                  <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </span>
                <span>{{ isLoading ? 'Procesando...' : 'Enviar' }}</span>
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
  createdAt: Date
  updatedAt: Date
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
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
  videoEmbed?: string
}

// Estados
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

let timeInterval: NodeJS.Timeout

// Funciones
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

const sanitizeAndFormat = (content: string): string => {
  if (!content) return ''
  const htmlContent = marked.parse(content, { async: false }) as string
  return DOMPurify.sanitize(htmlContent)
}

const selectTopic = async (topic: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    isLoading.value = true
    chatMessages.value.push({
      role: 'assistant',
      content: `💡 Has seleccionado el tema: "${topic}". Estoy preparando la información...`
    })

    const response = await fetch('/api/students/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        message: `STUDY_TOPIC:${topic}`
      })
    })

    if (!response.ok) {
      throw new Error('Error al procesar el tema')
    }

    const data = await response.json()
    
    chatMessages.value.pop()

    if (data.text) {
      chatMessages.value.push({
        role: 'assistant',
        content: data.text
      })
    }

    if (data.quiz) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text,
        quiz: data.quiz
      }
      chatMessages.value.push(assistantMessage)
    }

    if (data.topics) {
      topics.value = data.topics.map((topic: any) => ({
        name: topic.name,
        progress: topic.progress || 0,
        completed: topic.completed || false,
        inProgress: topic.inProgress || false
      }))
    }

    // Scroll to bottom after adding new message
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('Error al seleccionar tema:', error)
    chatMessages.value.push({
      role: 'assistant',
      content: 'Lo siento, hubo un error al cargar el tema. Por favor, intenta de nuevo.'
    })
  } finally {
    isLoading.value = false
  }
}

const isTopicCompleted = (topic: string): boolean => {
  return topics.value.find(t => t.name === topic)?.completed || false
}

const isTopicInProgress = (topic: string): boolean => {
  return topics.value.find(t => t.name === topic)?.inProgress || false
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const selectAnswer = (answer: string) => {
  sendMessage(undefined, answer)
}

const formatDocumentTitle = (title: string): string => {
  return title.replace(/\.[^/.]+$/, "").toUpperCase()
}

const sendMessage = async (event?: Event, answer?: string) => {
  if (isLoading.value) return

  let message: string

  if (answer) {
    message = answer
  } else {
    message = userInput.value.trim()
  }

  if (!message) return

  chatMessages.value.push({ role: 'user', content: message })
  userInput.value = ''
  isLoading.value = true

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No hay sesión activa')
    }

    const payload = { message: message.trim() }

    const response = await fetch('/api/students/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
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

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: data.text
    }

    if (data.quiz) assistantMessage.quiz = data.quiz
    if (data.answerFeedback) assistantMessage.answerFeedback = data.answerFeedback
    if (data.currentTopic) currentTopic.value = data.currentTopic
    if (data.videoEmbed) {
      assistantMessage.videoEmbed = data.videoEmbed
    }

    chatMessages.value.push(assistantMessage)

    if (data.estudiante) {
      studentName.value = data.estudiante.nombre || ''
      studentLevel.value = data.estudiante.nivel || 1
    }

    if (data.topics) {
      topics.value = data.topics.map((topic: any) => ({
        name: topic.topic || topic.nombre,
        progress: topic.progress || 0,
        completed: topic.completed || false,
        inProgress: topic.inProgress || false
      }))
    }

    if (data.xp) {
      xp.value = data.xp
    }

    if (data.documents) {
      documents.value = data.documents
    }

    updateProgress(data.currentTopic, data.answerFeedback?.isCorrect)
  } catch (error) {
    console.error('Error completo:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    if (errorMessage === 'SESSION_EXPIRED') {
      window.location.href = '/login'
    } else {
      chatMessages.value.push({
        role: 'assistant',
        content: '❌ Lo siento, ha ocurrido un error. ¿Podrías intentar reformular tu pregunta?'
      })
    }
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

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

const overallProgress = computed(() => {
  if (topics.value.length === 0) return 0
  return topics.value.reduce((acc, topic) => acc + topic.progress, 0) / topics.value.length
})

watch(overallProgress, (newProgress) => {
  if (newProgress === 100) {
    chatMessages.value.push({
      role: 'assistant',
      content: '¡Felicidades! Has completado todos los temas del curso. ¿Hay algo más en lo que pueda ayudarte?'
    })
  }
})

onMounted(async () => {
  timeInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)

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
    
    if (data.text) {
      chatMessages.value = [{
        role: 'assistant',
        content: data.text
      }]
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
      documents.value = data.documents
    }

  } catch (error) {
    console.error('Error inicial:', error)
    chatMessages.value = [{
      role: 'assistant',
      content: 'Lo siento, no pude cargar tu información. Por favor, intenta refrescar la página.'
    }]
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style>
/* Estilos base */
.prose {
  line-height: 1.6;
}

.prose img {
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  max-width: 100%;
  margin: 0.5rem 0;
}

.prose details {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 0.75rem;
  background-color: rgba(75, 85, 99, 0.5);
}

.prose summary {
  cursor: pointer;
  font-weight: 500;
}

.prose ul, .prose ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin: 0.5rem 0;
}

.prose strong {
  color: #60a5fa;
  font-weight: 600;
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  color: #f3f4f6;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
}

.prose ul {
  list-style-type: disc;
  list-style-position: inside;
}

.prose ol {
  list-style-type: decimal;
  list-style-position: inside;
}

.prose a {
  color: #60a5fa;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

.prose blockquote {
  border-left: 4px solid #4b5563;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #9ca3af;
}

.prose pre {
  background-color: rgba(55, 65, 81, 0.5);
  padding: 1rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1rem 0;
  backdrop-filter: blur(8px);
}

.prose code {
  background-color: rgba(55, 65, 81, 0.5);
  padding: 0.25rem;
  border-radius: 0.375rem;
}

.prose iframe {
  width: 100%;
  max-width: 28rem;
  margin: 1rem auto;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

/* Animaciones */
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Personalización del scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(8px);
}

::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.5);
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>

