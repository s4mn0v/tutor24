<template>
  <div class="bg-transparent p-4 sm:p-6">
    <UContainer>
      <div class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 class="text-2xl font-bold text-blue-600">Asignaturas</h2>
        <UButton color="blue" @click="showCreateModal = true" icon="i-heroicons-plus">
          Crear Asignatura
        </UButton>
      </div>

      <div v-if="asignaturas.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <UCard v-for="asignatura in asignaturas" :key="asignatura.id"
          class="bg-white/80 dark:bg-gray-800/80 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          @click="navigateToAsignatura(asignatura.id)">
          <template #header>
            <h3 class="text-lg sm:text-xl font-bold text-center text-blue-600 uppercase">{{ asignatura.nombre }}</h3>
          </template>
          <div class="p-4">
            <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Carrera:</strong> {{ asignatura.carrera }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Jornada:</strong> {{ asignatura.jornada }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-300"><strong>Inscritos:</strong> {{
              asignatura.estudiantes?.length || 0
            }}</p>
            <p v-if="asignatura.enlaceRegistro" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
              <strong>Enlace de registro:</strong>
              <UBadge color="blue" class="ml-2 cursor-pointer" @click.stop="copyLink(asignatura.enlaceRegistro)">
                Copiar enlace
              </UBadge>
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <strong>Expira:</strong> {{ formatDate(asignatura.fechaExpiracion) }}
            </p>
          </div>
          <template #footer>
            <div class="flex justify-between items-center">
              <UButton @click.stop="generateLink(asignatura.id)" color="blue" size="sm">
                Generar Enlace
              </UButton>
              <UButton @click.stop="deleteSubject(asignatura.id)" color="red" size="sm">
                Eliminar
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-400 py-8">
        No hay asignaturas creadas.
      </div>
    </UContainer>

    <!-- Modal para crear asignatura -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Crear Nueva Asignatura</h3>
        </template>
        <UForm :state="formState" @submit="createSubject" class="space-y-4">
          <UFormGroup label="Nombre de la Asignatura" name="nombre" required>
            <UInput v-model="formState.nombre" placeholder="Introduce el nombre de la asignatura" />
          </UFormGroup>

          <UFormGroup label="Carrera" name="carrera" required>
            <UInput v-model="formState.carrera" placeholder="Introduce el nombre de la carrera" />
          </UFormGroup>

          <UFormGroup label="Jornada" name="jornada" required>
            <USelect v-model="formState.jornada" :options="['Diurna', 'Nocturna']" />
          </UFormGroup>
        </UForm>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" @click="showCreateModal = false">Cancelar</UButton>
            <UButton color="blue" :loading="loading" @click="createSubject">
              {{ loading ? 'Creando...' : 'Crear Asignatura' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '#imports';

interface Asignatura {
  id: number;
  nombre: string;
  carrera: string;
  jornada: string;
  idDocente: number;
  activo: boolean;
  enlaceRegistro?: string | null;
  fechaExpiracion?: Date | null;
  estudiantes?: { id: number }[];
  materiales?: { id: number }[];
}

const router = useRouter();
const toast = useToast();
const loading = ref(false);
const asignaturas = ref<Asignatura[]>([]);
const showCreateModal = ref(false);

const formState = reactive({
  nombre: '',
  carrera: '',
  jornada: ''
});

const fetchAsignaturas = async () => {
  try {
    const token = localStorage.getItem('token'); // Obtener el token almacenado
    if (!token) throw new Error("No autenticado");

    const response = await $fetch<Asignatura[]>('/api/asignaturas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    asignaturas.value = response;
    console.log('Asignaturas obtenidas:', asignaturas.value);
  } catch (error) {
    console.error('Error obteniendo las asignaturas:', error);
    toast.add({ title: 'Error al cargar las asignaturas', color: 'red' });
  }
};


const createSubject = async () => {
  if (!formState.nombre || !formState.carrera || !formState.jornada) {
    toast.add({ title: 'Por favor, completa todos los campos', color: 'yellow' });
    return;
  }

  loading.value = true;

  try {
    const token = localStorage.getItem('token'); // Obtener token almacenado
    if (!token) throw new Error('No autenticado');

    console.log("Datos a enviar:", {
      nombre: formState.nombre,
      carrera: formState.carrera,
      jornada: formState.jornada,
    });

    const newAsignatura = await $fetch<Asignatura>('/api/asignaturas/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en el header
        'Content-Type': 'application/json'
      },
      body: {
        nombre: formState.nombre,
        carrera: formState.carrera,
        jornada: formState.jornada,
        // No se envía idDocente porque se obtiene del token en el backend
      },
    });

    if (newAsignatura) {
      toast.add({ title: 'Asignatura creada exitosamente!', color: 'green' });
      formState.nombre = '';
      formState.carrera = '';
      formState.jornada = '';
      showCreateModal.value = false;
      await fetchAsignaturas();
    }
  } catch (error) {
    console.error('Error creando la asignatura:', error);
    toast.add({
      title: error instanceof Error ? error.message : 'Hubo un error al crear la asignatura',
      color: 'red'
    });
  } finally {
    loading.value = false;
  }
};

const generateLink = async (asignaturaId: number) => {
  try {
    const response = await $fetch<{ enlaceRegistro: string }>(`/api/asignaturas/${asignaturaId}/generate-link`, {
      method: 'POST',
    });

    if (response && response.enlaceRegistro) {
      toast.add({ title: 'Enlace generado exitosamente! Tiene una duración de 20 minutos.', color: 'green' });
      await fetchAsignaturas();
    }
  } catch (error) {
    console.error('Error generando el enlace:', error);
    toast.add({ title: 'Hubo un error al generar el enlace', color: 'red' });
  }
};

const deleteSubject = async (id: number) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta asignatura?')) {
    try {
      await $fetch(`/api/asignaturas/${id}`, {
        method: 'DELETE'
      });

      toast.add({ title: 'Asignatura eliminada exitosamente', color: 'green' });
      await fetchAsignaturas();
    } catch (error) {
      console.error('Error eliminando la asignatura:', error);
      toast.add({ title: 'Hubo un error al eliminar la asignatura', color: 'red' });
    }
  }
};

const copyLink = (enlace: string) => {
  navigator.clipboard.writeText(`${window.location.origin}/inscribir?enlace=${enlace}`);
  toast.add({ title: 'Enlace copiado al portapapeles!', color: 'green' });
};

const navigateToAsignatura = (id: number) => {
  router.push(`/teacher/asignatura/${id}`);
};

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

onMounted(() => {
  fetchAsignaturas();
});
</script>
