<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-white mb-6">Calendario del Estudiante</h1>
      <div class="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <Calendar />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Calendar from '~/components/student/Calendar.vue'
</script>