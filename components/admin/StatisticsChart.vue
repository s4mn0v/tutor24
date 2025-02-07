<template>
  <div>
    <!-- Si usas SSR y tienes problemas, puedes envolver el componente en <client-only> -->
    <ApexChart type="bar" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Datos para la serie del gráfico
const series = ref([
  {
    name: 'Valores',
    data: [] as number[],
  },
]);

// Opciones de configuración del gráfico
const chartOptions = ref({
  chart: {
    id: 'stats-chart',
  },
  xaxis: {
    // Etiquetas para cada dato: asignaturas, estudiantes y promedio
    categories: ['Asignaturas', 'Estudiantes', 'Promedio'],
  },
  title: {
    text: 'Estadísticas de asignaturas y estudiantes',
  },
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
});

// Función para obtener datos desde tus endpoints
const fetchChartStats = async () => {
  try {
    const [subjectsRes, studentsRes, averageRes] = await Promise.all([
      $fetch('/api/stats/subjects/count'),
      $fetch('/api/stats/students/count'),
      $fetch('/api/stats/students/average'),
    ]);

    // Actualiza la serie con los datos obtenidos
    series.value = [
      {
        name: 'Valores',
        data: [
          subjectsRes.count,
          studentsRes.count,
          Number(averageRes.average),
        ],
      },
    ];
  } catch (error) {
    console.error('Error al cargar estadísticas para el gráfico:', error);
  }
};

// Cargar datos al montar el componente
onMounted(fetchChartStats);
</script>
