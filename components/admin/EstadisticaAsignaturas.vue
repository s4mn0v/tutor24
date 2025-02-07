<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <!-- Tarjeta de Asignaturas Totales -->
    <UCard class="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-800 dark:to-zinc-900 shadow-md rounded-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-book-open" class="text-primary text-xl" />
          <h3 class="font-semibold">Asignaturas</h3>
        </div>
      </template>
      <div class="text-3xl font-bold">
        <template v-if="loading.subjects">Cargando...</template>
        <template v-else>{{ stats.subjects }}</template>
      </div>
    </UCard>

    <!-- Tarjeta de Estudiantes Totales -->
    <UCard class="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-800 dark:to-zinc-900 shadow-md rounded-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-user-group" class="text-green-500 text-xl" />
          <h3 class="font-semibold">Estudiantes</h3>
        </div>
      </template>
      <div class="text-3xl font-bold">
        <template v-if="loading.students">Cargando...</template>
        <template v-else>{{ stats.students }}</template>
      </div>
    </UCard>

    <!-- Tarjeta de Promedio de Estudiantes por Asignatura -->
    <UCard class="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-800 dark:to-zinc-900 shadow-md rounded-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-chart-bar" class="text-purple-500 text-xl" />
          <h3 class="font-semibold">Promedio por asignatura</h3>
        </div>
      </template>
      <div class="text-3xl font-bold">
        <template v-if="loading.average">Cargando...</template>
        <template v-else>{{ stats.average }}</template>
      </div>
    </UCard>

    <!-- Tarjeta de Asignaturas Activas -->
    <UCard class="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-800 dark:to-zinc-900 shadow-md rounded-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-circle" class="text-green-500 text-xl" />
          <h3 class="font-semibold">Asignaturas Activas</h3>
        </div>
      </template>
      <div class="text-3xl font-bold">
        <template v-if="loading.activeSubjects">Cargando...</template>
        <template v-else>{{ stats.activeSubjects }}</template>
      </div>
    </UCard>

    <!-- Tarjeta de Asignaturas Inactivas -->
    <UCard class="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-800 dark:to-zinc-900 shadow-md rounded-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-x-circle" class="text-red-500 text-xl" />
          <h3 class="font-semibold">Asignaturas Inactivas</h3>
        </div>
      </template>
      <div class="text-3xl font-bold">
        <template v-if="loading.inactiveSubjects">Cargando...</template>
        <template v-else>{{ stats.inactiveSubjects }}</template>
      </div>
    </UCard>

    <!-- Tarjeta de Promedio de Materiales por Asignatura -->
    <UCard class="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-800 dark:to-zinc-900 shadow-md rounded-md">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-document-text" class="text-blue-500 text-xl" />
          <h3 class="font-semibold">Prom. de Materiales</h3>
        </div>
      </template>
      <div class="text-3xl font-bold">
        <template v-if="loading.averageMaterials">Cargando...</template>
        <template v-else>{{ stats.averageMaterials }}</template>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const stats = ref({
  subjects: 0,
  students: 0,
  average: 0,
  activeSubjects: 0,
  inactiveSubjects: 0,
  averageMaterials: 0,
});

const loading = ref({
  subjects: true,
  students: true,
  average: true,
  activeSubjects: true,
  inactiveSubjects: true,
  averageMaterials: true,
});

const fetchStats = async () => {
  try {
    // Realizamos todas las peticiones en paralelo
    const [
      subjectsRes,
      studentsRes,
      averageRes,
      activeInactiveRes,
      averageMaterialsRes
    ] = await Promise.all([
      $fetch('/api/stats/subjects/count'),
      $fetch('/api/stats/students/count'),
      $fetch('/api/stats/students/average'),
      $fetch('/api/stats/asignaturas/active-inactive'),
      $fetch('/api/stats/materials/average'),
    ]);

    stats.value = {
      subjects: subjectsRes.count,
      students: studentsRes.count,
      average: Number(averageRes.average),
      activeSubjects: activeInactiveRes.active,
      inactiveSubjects: activeInactiveRes.inactive,
      averageMaterials: Number(averageMaterialsRes.averageMaterials),
    };

    loading.value = {
      subjects: false,
      students: false,
      average: false,
      activeSubjects: false,
      inactiveSubjects: false,
      averageMaterials: false,
    };
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    // Aquí podrías manejar los errores según tus necesidades
  }
};

onMounted(fetchStats);
</script>
