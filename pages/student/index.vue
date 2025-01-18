<template>
  <div>
      <h1>Bienvenido, {{ nombre }}</h1>
      <p>Estas viendo la asignatura de {{ asginatura }}. Tu docente es {{ docente }}</p>
  </div>
</template>

<script setup>
const nombre = "Juanes";
const asginatura = "Matematicas";
const docente = "Juan Perez";
</script>