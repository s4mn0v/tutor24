<template>
  <UContainer class="p-6 rounded-lg shadow-md">
    <USection title="Crear Nueva Asignatura" description="Completa el formulario para añadir una nueva asignatura.">
      <UForm @submit="createSubject" class="space-y-4 mb-8">
        <UFormItem label="Nombre de la Asignatura" name="nombre" required>
          <UInput v-model="nombre" placeholder="Introduce el nombre de la asignatura" />
        </UFormItem>

        <UFormItem label="Fecha de Expiración del Enlace" name="fechaExpiracion" required>
          <UInput v-model="fechaExpiracion" type="datetime-local" />
        </UFormItem>

        <UButton type="submit" color="primary" :loading="loading">
          {{ loading ? 'Creando...' : 'Crear Asignatura' }}
        </UButton>
      </UForm>
    </USection>

    <USection title="Asignaturas Creadas" description="Administra las asignaturas y genera enlaces temporales para inscripción.">
      <div v-if="asignaturas.length > 0" class="space-y-4">
        <UCard v-for="asignatura in asignaturas" :key="asignatura.id" class="p-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ asignatura.nombre }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Fecha de expiración: {{ new Date(asignatura.fechaExpiracion).toLocaleString() }}
              </p>
            </div>
            <div class="flex space-x-2">
              <UButton @click="generateLink(asignatura.id)" color="gray" size="sm">
                Generar Enlace
              </UButton>
              <UButton @click="deleteSubject(asignatura.id)" color="red" size="sm">
                Eliminar
              </UButton>
            </div>
          </div>
          <div v-if="asignatura.enlaceRegistro" class="mt-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">Enlace temporal:</p>
            <div class="flex items-center space-x-2">
              <UInput
                :model-value="`${baseUrl}/inscribir?enlace=${asignatura.enlaceRegistro}`"
                readonly
                class="flex-1"
              />
              <UButton @click="copyLink(asignatura.enlaceRegistro)" color="gray" size="sm">
                Copiar
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
      <div v-else class="text-gray-600 dark:text-gray-400">
        No hay asignaturas creadas.
      </div>
    </USection>
  </UContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const nombre = ref('');
const fechaExpiracion = ref('');
const loading = ref(false);
const asignaturas = ref([]);
const baseUrl = ref('http://localhost:3000');

const fetchAsignaturas = async () => {
  try {
    const response = await $fetch('/api/asignaturas');
    asignaturas.value = response;
  } catch (error) {
    console.error('Error obteniendo las asignaturas:', error);
  }
};

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
        idDocente: 1,
        fechaExpiracion: fechaExpiracion.value,
      },
    });

    alert('Asignatura creada exitosamente!');
    nombre.value = '';
    fechaExpiracion.value = '';
    await fetchAsignaturas();
  } catch (error) {
    console.error('Error creando la asignatura:', error);
    alert('Hubo un error al crear la asignatura.');
  } finally {
    loading.value = false;
  }
};

const generateLink = async (asignaturaId) => {
  try {
    const response = await $fetch(`/api/asignaturas/${asignaturaId}/generate-link`, {
      method: 'POST',
      body: { duracionHoras: 24 },
    });

    if (response.enlaceRegistro) {
      alert('Enlace generado exitosamente!');
      await fetchAsignaturas();
    }
  } catch (error) {
    console.error('Error generando el enlace:', error);
    alert('Hubo un error al generar el enlace.');
  }
};

const copyLink = (enlace) => {
  navigator.clipboard.writeText(`${baseUrl.value}/inscribir?enlace=${enlace}`);
  alert('Enlace copiado al portapapeles!');
};

const deleteSubject = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta asignatura?')) {
    try {
      await $fetch(`/api/asignaturas/delete`, {
        method: 'DELETE',
        body: { id },
      });
      await fetchAsignaturas();
    } catch (error) {
      console.error('Error eliminando la asignatura:', error);
    }
  }
};

onMounted(() => {
  fetchAsignaturas();
});
</script>
