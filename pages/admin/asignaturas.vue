<template>
  <div>
    <!-- Distribución con grid: la columna de las tarjetas ocupa 2/3 y la del gráfico 1/3 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Tarjetas de estadísticas (2 columnas) -->
      <div class="md:col-span-2">
        <EstadisticaAsignaturas />
      </div>
      <!-- Gráfico (1 columna) -->
      <div class="md:col-span-1">
        <StatisticsChart />
      </div>
    </div>
    <br />
    <TableSubjects />
  </div>
</template>

<script setup lang="ts">
import EstadisticaAsignaturas from '~/components/admin/EstadisticaAsignaturas.vue';
import TableSubjects from '~/components/admin/TableSubjects.vue';
import StatisticsChart from '~/components/admin/StatisticsChart.vue';
</script>
