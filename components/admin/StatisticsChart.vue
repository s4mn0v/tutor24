<template>
  <div>
    <!-- Si es necesario, envolver en <client-only> para evitar problemas en SSR -->
    <ApexChart type="bar" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const series = ref([
  {
    name: 'Valores',
    data: [] as number[],
  },
]);

const chartOptions = ref({
  chart: {
    id: 'stats-chart',
  },
  xaxis: {
    // Definimos 6 categorías para nuestro gráfico
    categories: [
      'Asignaturas totales',
      'Estudiantes totales',
      'Promedio de estudiantes',
      'Asignaturas activas',
      'Asignaturas inactivas',
      'Materiales por asignatura'
    ],
  },
  title: {
    text: 'Estadísticas Generales',
  },
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
});

const fetchChartStats = async () => {
  try {
    // Se ejecutan en paralelo todas las peticiones
    const [
      subjectsRes,
      studentsRes,
      averageStudentsRes,
      activeInactiveRes,
      averageMaterialsRes
    ] = await Promise.all([
      $fetch('/api/stats/subjects/count'),
      $fetch('/api/stats/students/count'),
      $fetch('/api/stats/students/average'),
      $fetch('/api/stats/asignaturas/active-inactive'),
      $fetch('/api/stats/materials/average'),
    ]);

    series.value = [
      {
        name: 'Valores',
        data: [
          subjectsRes.count,                             // Asignaturas totales
          studentsRes.count,                             // Estudiantes totales
          Number(averageStudentsRes.average),            // Promedio de estudiantes
          activeInactiveRes.active,                      // Asignaturas activas
          activeInactiveRes.inactive,                    // Asignaturas inactivas
          Number(averageMaterialsRes.averageMaterials)   // Promedio de materiales por asignatura
        ],
      },
    ];
  } catch (error) {
    console.error('Error al cargar estadísticas para el gráfico:', error);
  }
};

onMounted(fetchChartStats);
</script>
