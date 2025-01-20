<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Inscripción a la Asignatura</h1>
    <UForm @submit="registerStudent" class="max-w-md mx-auto space-y-4">
      <UFormGroup label="Documento de Identidad" name="documentoIdentidad" required>
        <UInput v-model="documentoIdentidad" placeholder="Introduce tu documento de identidad" />
      </UFormGroup>

      <UFormGroup label="Nombre Completo" name="nombre" required>
        <UInput v-model="nombre" placeholder="Introduce tu nombre completo" />
      </UFormGroup>

      <UFormGroup label="Carrera" name="carrera" required>
        <UInput v-model="carrera" placeholder="Introduce tu carrera" />
      </UFormGroup>

      <UFormGroup label="Correo Electrónico" name="correo" required>
        <UInput v-model="correo" type="email" placeholder="Introduce tu correo electrónico" />
      </UFormGroup>

      <UFormGroup label="Contraseña" name="contrasena" required>
        <UInput v-model="contrasena" type="password" placeholder="Introduce tu contraseña" />
      </UFormGroup>

      <UButton type="submit" color="primary" :loading="loading">
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, navigateTo } from '#app'; // Asegúrate de tener estas funciones de Nuxt 3

const route = useRoute();
const enlace = route.query.enlace; // Obtener el enlace temporal de la URL
const documentoIdentidad = ref('');
const nombre = ref('');
const carrera = ref('');
const correo = ref('');
const contrasena = ref('');
const loading = ref(false);

const registerStudent = async () => {
  if (!documentoIdentidad.value || !nombre.value || !carrera.value || !correo.value || !contrasena.value) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch('/api/estudiantes/register', {
      method: 'POST',
      body: {
        documentoIdentidad: documentoIdentidad.value,
        nombre: nombre.value,
        carrera: carrera.value,
        correo: correo.value,
        contrasena: contrasena.value,
        enlaceRegistro: enlace,
      },
    });

    alert('Estudiante registrado exitosamente!');
    navigateTo('/student'); // Redirigir al panel del estudiante
  } catch (error) {
    console.error('Error registrando el estudiante:', error);
    alert('Hubo un error al registrar el estudiante.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
