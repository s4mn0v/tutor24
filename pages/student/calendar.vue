<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Calendario del Curso</h2>
      <div v-if="events.length > 0">
        <div v-for="event in events" :key="event.id" class="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ event.title }}</h3>
          <p class="text-gray-600 dark:text-gray-300">{{ formatDate(event.date) }}</p>
          <p class="text-gray-600 dark:text-gray-300">{{ event.description }}</p>
        </div>
      </div>
      <div v-else class="text-gray-600 dark:text-gray-400">
        No hay eventos programados en este momento.
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  interface CalendarEvent {
    id: number
    title: string
    date: string
    description: string
  }
  
  const events = ref<CalendarEvent[]>([])
  
  const fetchEvents = async () => {
    try {
      const response = await $fetch<CalendarEvent[]>('/api/students/calendar')
      events.value = response
    } catch (error) {
      console.error('Error al obtener eventos del calendario:', error)
    }
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }
  
  onMounted(() => {
    fetchEvents()
  })
  </script>
  
  