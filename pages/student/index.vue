<template>
  <div class="min-h-screen dark:bg-transparent p-4">
    <div class="max-w-4xl mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-xl overflow-hidden">
      <div class="p-4 border-b dark:border-gray-700">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Tu Asistente de Estudio Personal
        </h1>
        <div v-if="currentTopic" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Tema actual: {{ currentTopic }}
        </div>
      </div>
  
      <!-- Chat Messages -->
      <div ref="chatContainer" 
           class="h-[calc(100vh-250px)] overflow-y-auto p-4 space-y-4">
        <div v-for="(message, index) in chatMessages" 
             :key="index"
             :class="[
               'flex',
               message.role === 'user' ? 'justify-end' : 'justify-start'
             ]">
          <div :class="[
            'rounded-lg p-4 max-w-[80%]',
            message.role === 'user' 
              ? 'bg-blue-100 dark:bg-blue-900 ml-auto' 
              : 'bg-zinc-100 dark:bg-zinc-700'
          ]">
            <div class="prose dark:prose-invert max-w-none"
                 v-html="sanitizeAndFormat(message.content)" />
            
            <!-- Video Embed -->
            <div v-if="message.video" class="mt-4">
              <iframe 
                :src="'https://www.youtube.com/embed/' + message.video.id" 
                class="w-full aspect-video rounded-lg"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ message.video.title }}
              </p>
            </div>
  
            <!-- Quiz Interface -->
            <div v-if="message.quiz" class="mt-4 space-y-4">
              <div class="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p class="font-medium">{{ message.quiz.question }}</p>
                <div class="mt-4 space-y-2">
                  <div v-for="(option, index) in message.quiz.options" :key="index" class="flex items-center">
                    <span class="mr-2 font-medium">{{ String.fromCharCode(65 + index) }})</span>
                    <span>{{ option }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="!message.answerFeedback" class="space-y-2">
                <input
                  v-model="quizAnswer"
                  type="text"
                  class="w-full p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-zinc-700 
                         text-gray-900 dark:text-gray-100"
                  placeholder="Escribe tu respuesta (A, B, C o D)..."
                  maxlength="1"
                />
                <button
                  @click="submitAnswer"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors"
                >
                  Enviar Respuesta
                </button>
              </div>
            </div>
  
            <!-- Answer Feedback -->
            <div v-if="message.answerFeedback" 
                 :class="[
                   'mt-4 p-4 rounded-lg',
                   message.answerFeedback.isCorrect 
                     ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100' 
                     : 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                 ]">
              <p class="whitespace-pre-line">{{ message.answerFeedback.feedback }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Input Form -->
      <div class="p-4 border-t dark:border-zinc-700 bg-white dark:bg-zinc-800">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input
            v-model="userInput"
            type="text"
            placeholder="Escribe tu mensaje aquí..."
            class="flex-1 p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-zinc-700 
                   text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 
                   focus:border-transparent"
            :disabled="isLoading"
          />
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   flex items-center gap-2"
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
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue'
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  
  interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    video?: {
      id: string
      title: string
    }
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
  }
  
  interface MarkedLink {
    href: string
    title: string | null
    text: string
    tokens?: any[]
  }
  
  const userInput = ref('')
  const quizAnswer = ref('')
  const isLoading = ref(false)
  const chatMessages = ref<ChatMessage[]>([])
  const chatContainer = ref<HTMLElement | null>(null)
  const currentTopic = ref('')
  
  // Crear una nueva instancia del renderer
  const renderer = new marked.Renderer()
  
// Sobrescribir el método link con la implementación personalizada
renderer.link = function({ href, title, text }: { href: string, title?: string | null, text: string }): string {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${text}</a>`
}
  
  // Configurar marked con el renderer personalizado
  marked.setOptions({
    renderer,
    breaks: true,
    gfm: true
  })
  
  const sanitizeAndFormat = (content: string): string => {
    const htmlContent = marked.parse(content) as string
    return DOMPurify.sanitize(htmlContent, {
      ADD_ATTR: ['target'],
      ADD_TAGS: ['iframe']
    })
  }
  
  const scrollToBottom = () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }
  
  const submitAnswer = async () => {
    if (!quizAnswer.value.trim() || isLoading.value) return
  
    const answer = quizAnswer.value.trim().toUpperCase()
    chatMessages.value.push({ role: 'user', content: answer })
    quizAnswer.value = ''
    isLoading.value = true
  
    try {
      const { data } = await useFetch('/api/students/chat', {
        method: 'POST',
        body: { answer },
        query: { userId: '1' }
      })
      
      if (data.value && typeof data.value === 'object') {
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: data.value.text as string
        }
  
        if ('answerFeedback' in data.value && data.value.answerFeedback) {
          assistantMessage.answerFeedback = data.value.answerFeedback as {
            isCorrect: boolean
            feedback: string
          }
        }
  
        chatMessages.value.push(assistantMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      chatMessages.value.push({ 
        role: 'assistant', 
        content: '❌ Lo siento, ha ocurrido un error al evaluar tu respuesta. Por favor, intenta de nuevo.' 
      })
    } finally {
      isLoading.value = false
      await nextTick()
      scrollToBottom()
    }
  }
  
  const sendMessage = async () => {
    if (!userInput.value.trim() || isLoading.value) return
  
    const userMessage = userInput.value.trim()
    chatMessages.value.push({ role: 'user', content: userMessage })
    userInput.value = ''
    isLoading.value = true
  
    try {
      const { data } = await useFetch('/api/students/chat', {
        method: 'POST',
        body: { message: userMessage },
        query: { userId: '1' }
      })
      
      if (data.value && typeof data.value === 'object') {
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: data.value.text as string
        }
  
        if ('video' in data.value && data.value.video) {
          assistantMessage.video = data.value.video as {
            id: string
            title: string
          }
        }
  
        if ('quiz' in data.value && data.value.quiz) {
          assistantMessage.quiz = data.value.quiz as {
            question: string
            options: string[]
            correctAnswer: string
            explanation: string
          }
        }
  
        if ('currentTopic' in data.value && typeof data.value.currentTopic === 'string') {
          currentTopic.value = data.value.currentTopic
        }
  
        chatMessages.value.push(assistantMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      chatMessages.value.push({ 
        role: 'assistant', 
        content: '❌ Lo siento, ha ocurrido un error. ¿Podrías intentar reformular tu pregunta?' 
      })
    } finally {
      isLoading.value = false
      await nextTick()
      scrollToBottom()
    }
  }
  
  onMounted(async () => {
    try {
      const { data } = await useFetch('/api/students/chat', {
        method: 'POST',
        body: { message: 'inicio' },
        query: { userId: '1' }
      })
      
      if (data.value && typeof data.value === 'object') {
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: data.value.text as string
        }
  
        if ('currentTopic' in data.value && typeof data.value.currentTopic === 'string') {
          currentTopic.value = data.value.currentTopic
        }
  
        chatMessages.value.push(assistantMessage)
      }
    } catch (error) {
      console.error('Error inicial:', error)
      chatMessages.value.push({ 
        role: 'assistant', 
        content: '❌ Lo siento, no pude cargar tu información. ¿Podrías refrescar la página?' 
      })
    } finally {
      await nextTick()
      scrollToBottom()
    }
  })
  </script>
  
  <style>
  .prose {
    @apply text-gray-900 dark:text-gray-100;
  }
  
  .prose img {
    @apply rounded-lg shadow-md max-w-full my-2;
  }
  
  .prose details {
    @apply my-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-600;
  }
  
  .prose summary {
    @apply cursor-pointer font-medium;
  }
  
  .prose ul {
    @apply list-disc list-inside;
  }
  
  .prose ol {
    @apply list-decimal list-inside;
  }
  
  .prose a {
    @apply text-blue-500 hover:underline;
  }
  
  .prose blockquote {
    @apply border-l-4 border-gray-300 dark:border-gray-500 pl-4 my-2;
  }
  
  .prose pre {
    @apply bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg overflow-x-auto my-2;
  }
  
  .prose code {
    @apply bg-zinc-100 dark:bg-zinc-700 px-1 rounded;
  }
  
  .prose iframe {
    @apply w-full max-w-md mx-auto my-4 rounded-lg shadow-lg;
  }
  </style>
  
  