<template>
  <div>
    <!-- Grid responsivo: 1 columna en móvil y 3 columnas en md+ -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Estadísticas ocupan 2 de las 3 columnas -->
      <div class="md:col-span-2">
        <EstadisticaAsignaturas />
      </div>
      <!-- El gráfico ocupa 1 columna -->
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
