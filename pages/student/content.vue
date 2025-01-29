<template>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Contenido del Curso</h2>
      <div v-if="materials.length > 0">
        <div v-for="material in materials" :key="material.id" class="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ material.nombre }}</h3>
          <div class="mt-2">
            <a :href="material.url" target="_blank" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Ver en línea</a>
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
    url: string
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
  
  