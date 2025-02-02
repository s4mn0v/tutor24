<script setup lang="ts">
// Usa el composable useColorMode de Nuxt para detectar el tema actual
const colorMode = useColorMode()

// Variable computada para determinar si el tema es oscuro
const isDark = computed(() => colorMode.value === 'dark')

// Ruta dinámica del logo basada en el tema actual
const logoPath = computed(() => {
  return isDark.value
    ? '/logos/dark.png' // Ruta del logo para tema oscuro
    : '/logos/light.png' // Ruta del logo para tema claro
})
</script>

<template>
  <!-- ClientOnly asegura que el componente solo se renderice en el lado del cliente -->
  <ClientOnly>
    <!-- Imagen del logo -->
    <img
      :src="logoPath"
      alt="Logo de la aplicación"
      class="logo"
    />
    <!-- Fallback mientras el componente se carga -->
    <template #fallback>
      <div class="logo-placeholder" />
    </template>
  </ClientOnly>
</template>

<style scoped>
/* Estilos para el logo */
.logo {
  width: 150px; /* Ajusta el tamaño según tus necesidades */
  height: auto; /* Mantiene la proporción de la imagen */
}

/* Estilos para el placeholder (mientras el logo se carga) */
.logo-placeholder {
  width: 150px; /* Mismo ancho que el logo */
  height: 70px; /* Ajusta la altura según el tamaño del logo */
  background-color: transparent; /* Fondo transparente */
}
</style>