<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Asistente de IA para Matemáticas</h2>
    <div class="h-96 overflow-y-auto mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div v-for="(message, index) in chatMessages" :key="index" class="mb-4">
        <div :class="[
          'p-3 rounded-lg',
          message.role === 'user' ? 'bg-blue-100 text-blue-800 ml-auto dark:bg-blue-700 dark:text-blue-100' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
        ]" :style="{ maxWidth: '80%', width: 'fit-content' }">
          {{ message.content }}
        </div>
      </div>
    </div>
    <form @submit.prevent="sendMessage" class="flex">
      <input v-model="userInput" type="text" placeholder="Haz una pregunta sobre matemáticas..."
        class="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600">
      <button type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
        :disabled="isLoading">
        {{ isLoading ? 'Enviando...' : 'Enviar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const userInput = ref('')
const isLoading = ref(false)
const chatMessages = ref<ChatMessage[]>([
  { role: 'assistant', content: 'Hola, soy tu asistente de matemáticas. ¿En qué puedo ayudarte hoy?' }
])

interface ApiResponse {
  text: string;
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMessage = userInput.value
  chatMessages.value.push({ role: 'user', content: userMessage })
  userInput.value = ''
  isLoading.value = true

  try {
    const response = await $fetch<ApiResponse>('/api/students/chat', {
      method: 'POST',
      body: { message: userMessage }
    })
    chatMessages.value.push({ role: 'assistant', content: response.text })
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    chatMessages.value.push({ role: 'assistant', content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.' })
  } finally {
    isLoading.value = false
  }
}
</script>
