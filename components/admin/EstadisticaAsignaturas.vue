<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <!-- Tarjeta de Asignaturas Totales -->
    <UCard>
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
    <UCard>
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

    <!-- Tarjeta de Promedio -->
    <UCard>
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
  </div>
</template>

<script setup lang="ts">
const stats = ref({
  subjects: 0,
  students: 0,
  average: 0
});

const loading = ref({
  subjects: true,
  students: true,
  average: true
});

const fetchStats = async () => {
  try {
    // Obtener datos en paralelo
    const [subjectsRes, studentsRes, averageRes] = await Promise.all([
      $fetch('/api/stats/subjects/count'),
      $fetch('/api/stats/students/count'),
      $fetch('/api/stats/students/average')
    ]);

    stats.value = {
      subjects: subjectsRes.count,
      students: studentsRes.count,
      average: Number(averageRes.average)
    };

    // Resetear estados de carga
    loading.value = {
      subjects: false,
      students: false,
      average: false
    };

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    // Manejar errores aquí
  }
};

// Cargar datos al montar el componente
onMounted(fetchStats);
</script>