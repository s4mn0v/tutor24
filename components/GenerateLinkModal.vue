<template>
    <div class="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
      <!-- Formulario para crear asignaturas -->
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Crear Nueva Asignatura</h2>
      <UForm @submit="createSubject" class="space-y-4 mb-8">
        <UFormGroup label="Nombre de la Asignatura" name="nombre" required>
          <UInput v-model="nombre" placeholder="Introduce el nombre de la asignatura" />
        </UFormGroup>
  
        <UFormGroup label="Fecha de Expiración del Enlace" name="fechaExpiracion" required>
          <UInput v-model="fechaExpiracion" type="datetime-local" />
        </UFormGroup>
  
        <UButton type="submit" color="primary" :loading="loading">
          {{ loading ? 'Creando...' : 'Crear Asignatura' }}
        </UButton>
      </UForm>
  
      <!-- Lista de asignaturas creadas -->
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Asignaturas Creadas</h2>
      <div v-if="asignaturas.length > 0" class="space-y-4">
        <div v-for="asignatura in asignaturas" :key="asignatura.id" class="p-4 border rounded-lg dark:border-gray-700">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ asignatura.nombre }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Fecha de expiración: {{ new Date(asignatura.fechaExpiracion).toLocaleString() }}
              </p>
            </div>
            <div class="flex space-x-2">
              <!-- Botón para generar el enlace temporal -->
              <GenerateLinkModal :asignaturaId="asignatura.id" @enlace-generado="fetchAsignaturas" />
              <!-- Botón para eliminar -->
              <UButton @click="deleteSubject(asignatura.id)" color="red" size="sm">
                Eliminar
              </UButton>
            </div>
          </div>
          <!-- Mostrar el enlace temporal si está generado -->
          <div v-if="asignatura.enlaceRegistro" class="mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Enlace temporal:</p>
            <div class="flex items-center space-x-2">
              <UInput :model-value="`${baseUrl}/inscribir?enlace=${asignatura.enlaceRegistro}`" readonly class="flex-1" />
              <UButton @click="copyLink(asignatura.enlaceRegistro)" color="gray" size="sm">
                Copiar
              </UButton>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-600 dark:text-gray-400">
        No hay asignaturas creadas.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import GenerateLinkModal from '~/components/GenerateLinkModal.vue'; // Importar el componente
  
  const nombre = ref('');
  const fechaExpiracion = ref('');
  const loading = ref(false);
  const asignaturas = ref([]);
  const baseUrl = ref('http://localhost:3000'); // Cambia esto por tu URL de producción
  
  // Obtener las asignaturas creadas
  const fetchAsignaturas = async () => {
    try {
      const response = await $fetch('/api/asignaturas');
      asignaturas.value = response;
    } catch (error) {
      console.error('Error obteniendo las asignaturas:', error);
    }
  };
  
  // Crear una nueva asignatura
  const createSubject = async () => {
    if (!nombre.value || !fechaExpiracion.value) {
      alert('Por favor, completa todos los campos.');
      return;
    }
  
    loading.value = true;
  
    try {
      const response = await $fetch('/api/asignaturas/create', {
        method: 'POST',
        body: {
          nombre: nombre.value,
          idDocente: 1, // Aquí debes obtener el ID del docente autenticado
          fechaExpiracion: fechaExpiracion.value,
        },
      });
  
      alert('Asignatura creada exitosamente!');
      nombre.value = '';
      fechaExpiracion.value = '';
      await fetchAsignaturas(); // Actualizar la lista de asignaturas
    } catch (error) {
      console.error('Error creando la asignatura:', error);
      alert('Hubo un error al crear la asignatura.');
    } finally {
      loading.value = false;
    }
  };
  
  // Copiar el enlace al portapapeles
  const copyLink = (enlace) => {
    navigator.clipboard.writeText(`${baseUrl.value}/inscribir?enlace=${enlace}`);
    alert('Enlace copiado al portapapeles!');
  };
  
  // Eliminar una asignatura
  const deleteSubject = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta asignatura?')) {
      try {
        await $fetch(`/api/asignaturas/delete`, {
          method: 'DELETE',
          body: { id },
        });
        await fetchAsignaturas(); // Actualizar la lista de asignaturas
      } catch (error) {
        console.error('Error eliminando la asignatura:', error);
      }
    }
  };
  
  // Cargar las asignaturas al montar el componente
  onMounted(() => {
    fetchAsignaturas();
  });
  </script>
  
  <style scoped>
  /* Estilos adicionales si son necesarios */
  </style>