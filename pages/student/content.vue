<!-- pages/student/content.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Contenido del Curso</h2>
    <div v-if="materials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="material in materials" :key="material.id" class="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ material.nombre }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">Tipo: {{ material.tipo }}</p>
        <div class="mt-2">
          <a :href="material.url" target="_blank" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Ver en línea</a>
        </div>
        <div v-if="material.topics && material.topics.length > 0" class="mt-4">
          <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300">Temas principales:</h4>
          <ul class="list-disc list-inside">
            <li v-for="(topic, index) in material.topics" :key="index" class="text-gray-600 dark:text-gray-400">
              {{ topic }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-600 dark:text-gray-400">
      No hay materiales disponibles en este momento.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Material {
  id: number
  nombre: string
  tipo: string
  url: string
  topics: string[]
}

const materials = ref<Material[]>([])

const fetchMaterials = async () => {
  try {
    const response = await $fetch<Material[]>('/api/students/materials')
    materials.value = response
  } catch (error) {
    console.error('Error al obtener materiales:', error)
  }
}

onMounted(() => {
  fetchMaterials()
})
</script>