<template>
  <div>
    <FileUploader :id-asignatura="idAsignatura" />
  </div>
</template>

<script setup>
const route = useRoute();
const idAsignatura = parseInt(route.params.id);
</script>