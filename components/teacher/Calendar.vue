<template>
  <div class="min-h-screen bg-white dark:bg-transparent">
    <div class="max-w-7xl mx-auto bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden">
      <div class="flex flex-col lg:flex-row">
        <!-- Calendario -->
        <div class="w-full lg:w-2/3 p-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
              {{ currentMonthName }} {{ currentYear }}
            </h2>
            <div class="flex space-x-2">
              <button @click="previousMonth" class="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors">
                <i class="i-heroicons-chevron-left-20-solid w-5 h-5 text-gray-600 dark:text-gray-300"></i>
              </button>
              <button @click="nextMonth" class="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <i class="i-heroicons-chevron-right-20-solid w-5 h-5 text-gray-600 dark:text-gray-300"></i>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in daysOfWeek" :key="day" class="text-center font-semibold text-gray-600 dark:text-gray-400 text-xs lg:text-sm">
              {{ day }}
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="{ date, isCurrentMonth, isToday } in calendarDays"
              :key="date.toISOString()"
              @click="selectDate(date)"
              :class="[
                'p-1 w-full aspect-square rounded-lg text-center transition-colors text-xs lg:text-sm',
                isCurrentMonth ? 'hover:bg-blue-100 dark:hover:bg-blue-900' : 'text-gray-400 dark:text-gray-600',
                isToday ? 'bg-blue-200 dark:bg-blue-800 font-bold' : '',
                isSelected(date) ? 'bg-blue-500 text-white' : '',
                isFutureDate(date) ? 'cursor-pointer' : 'cursor-not-allowed',
              ]"
              :disabled="!isFutureDate(date)"
            >
              <span>{{ date.getDate() }}</span>
            </button>
          </div>
        </div>

        <!-- Recordatorios -->
        <div class="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 p-4">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recordatorios</h3>
          <div class="overflow-y-auto max-h-[calc(100vh-16rem)]">
            <ul v-if="recordatorios.length" class="space-y-2">
              <li 
                v-for="reminder in recordatorios" 
                :key="reminder.id" 
                :class="[
                  'p-3 rounded-lg mb-2 relative',
                  reminderImportanceClass(reminder.importancia)
                ]"
              >
                <button 
                  @click="deleteReminder(reminder.id)" 
                  class="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  aria-label="Eliminar recordatorio"
                >
                  <i class="i-heroicons-trash-20-solid w-5 h-5"></i>
                </button>
                <div>
                  <h4 class="font-semibold text-gray-800 dark:text-white">{{ reminder.titulo }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ reminder.descripcion }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Fecha: {{ formatDate(new Date(reminder.fecha)) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Asignatura: {{ getAsignaturaNombre(reminder.asignaturaId) }}
                  </p>
                </div>
              </li>
            </ul>
            <p v-else class="text-gray-600 dark:text-gray-400">No hay recordatorios.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Recordatorio -->
    <UModal v-model="showModal">
      <div class="bg-white dark:bg-zinc-800 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Nuevo Recordatorio</h3>
        <form @submit.prevent="addReminder" class="space-y-4">
          <UFormGroup label="Título" name="title">
            <UInput v-model="newReminder.title" placeholder="Título del recordatorio" required />
          </UFormGroup>
          <UFormGroup label="Descripción" name="description">
            <UTextarea v-model="newReminder.description" placeholder="Descripción del recordatorio" />
          </UFormGroup>
          <UFormGroup label="Asignatura" name="asignatura">
            <USelect v-model="newReminder.asignaturaId" :options="asignaturasOptions" placeholder="Selecciona una asignatura" required />
          </UFormGroup>
          <UFormGroup label="Importancia" name="importance">
            <USelect v-model="newReminder.importance" :options="importanceOptions" placeholder="Selecciona la importancia" required />
          </UFormGroup>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" @click="showModal = false">Cancelar</UButton>
            <UButton color="primary" type="submit" :loading="isLoading">Guardar</UButton>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Toast Notification -->
    <div v-if="notification" :class="[
      'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300',
      { 'bg-green-500': notification.type === 'success',
        'bg-red-500': notification.type === 'error',
        'bg-blue-500': notification.type === 'info',
        'bg-yellow-500': notification.type === 'warning' }
    ]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';

interface Recordatorio {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  asignaturaId: number;
  importancia: 'BAJA' | 'MEDIA' | 'ALTA';
}

interface Asignatura {
  id: number;
  nombre: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface EventoResponse {
  id: number;
  title: string;
  description: string;
  date: string;
  importance: 'BAJA' | 'MEDIA' | 'ALTA';
  asignatura: {
    id: number;
    nombre: string;
  };
}

const { token, refreshToken } = useAuth();
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const showModal = ref(false);
const isLoading = ref(false);
const recordatorios = ref<Recordatorio[]>([]);
const asignaturas = ref<Asignatura[]>([]);
const notification = ref<Notification | null>(null);

const newReminder = ref({
  title: '',
  description: '',
  asignaturaId: 0,
  importance: ''
});

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()]);
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    const date = new Date(year, month, -startingDayOfWeek + i + 1);
    days.push({ date, isCurrentMonth: false, isToday: isToday(date) });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true, isToday: isToday(date) });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false, isToday: isToday(date) });
  }

  return days;
});

const asignaturasOptions = computed(() => 
  asignaturas.value.map(asignatura => ({
    label: asignatura.nombre,
    value: asignatura.id
  }))
);

const importanceOptions = [
  { label: 'Baja', value: 'BAJA' },
  { label: 'Media', value: 'MEDIA' },
  { label: 'Alta', value: 'ALTA' },
];

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const selectDate = (date: Date) => {
  selectedDate.value = date;
  if (isFutureDate(date)) {
    showModal.value = true;
  }
};

const isSelected = (date: Date) => {
  return selectedDate.value && date.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isFutureDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

const reminderImportanceClass = (importance: string) => {
  switch (importance) {
    case 'BAJA':
      return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900';
    case 'MEDIA':
      return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900';
    case 'ALTA':
      return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900';
    default:
      return 'border-l-4 border-gray-500 bg-zinc-50 dark:bg-zinc-800';
  }
};

const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 5000);
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token.value}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Token ha expirado, intentamos refrescarlo
      await refreshToken();
      headers['Authorization'] = `Bearer ${token.value}`;
      return fetch(url, { ...options, headers });
    }

    return response;
  } catch (error) {
    console.error('Error en la petición API:', error);
    throw error;
  }
};

const fetchRecordatorios = async () => {
  try {
    const response = await fetchWithAuth('/api/docente/eventos');
    if (!response.ok) {
      throw new Error('Error al obtener recordatorios');
    }
    const data = await response.json();
    
    if (Array.isArray(data.eventos)) {
      recordatorios.value = data.eventos.map((evento: EventoResponse) => ({
        id: evento.id,
        titulo: evento.title,
        descripcion: evento.description,
        fecha: evento.date,
        asignaturaId: evento.asignatura.id,
        importancia: evento.importance
      }));
    } else {
      recordatorios.value = [];
      console.error('La respuesta de eventos no es un array:', data.eventos);
    }

    if (Array.isArray(data.asignaturas)) {
      asignaturas.value = data.asignaturas;
    } else {
      asignaturas.value = [];
      console.error('La respuesta de asignaturas no es un array:', data.asignaturas);
    }
  } catch (error) {
    console.error('Error al obtener datos:', error);
    showNotification('Error al cargar los datos. Por favor, intenta de nuevo más tarde.', 'error');
  }
};

const addReminder = async () => {
  if (!selectedDate.value || !newReminder.value.title || !newReminder.value.asignaturaId || !newReminder.value.importance) {
    showNotification('Por favor, completa todos los campos requeridos.', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetchWithAuth('/api/docente/eventos', {
      method: 'POST',
      body: JSON.stringify({
        title: newReminder.value.title,
        description: newReminder.value.description,
        date: selectedDate.value.toISOString(),
        asignaturaId: newReminder.value.asignaturaId,
        importance: newReminder.value.importance
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear recordatorio');
    }

    await fetchRecordatorios();
    showModal.value = false;
    newReminder.value = { title: '', description: '', asignaturaId: 0, importance: '' };
    showNotification('Recordatorio creado exitosamente', 'success');
  } catch (error: any) {
    console.error('Error al crear recordatorio:', error);
    showNotification('Error al crear el recordatorio: ' + error.message, 'error');
  } finally {
    isLoading.value = false;
  }
};

const deleteReminder = async (id: number) => {
  try {
    const response = await fetchWithAuth(`/api/docente/eventos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar recordatorio');
    }

    const data = await response.json();
    if (data.success) {
      await fetchRecordatorios();
      showNotification('Recordatorio eliminado exitosamente', 'success');
    } else {
      throw new Error(data.message || 'Error al eliminar el recordatorio');
    }
  } catch (error: any) {
    console.error('Error al eliminar recordatorio:', error);
    showNotification('Error al eliminar el recordatorio: ' + error.message, 'error');
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const getAsignaturaNombre = (id: number) => {
  const asignatura = asignaturas.value.find(a => a.id === id);
  return asignatura ? asignatura.nombre : 'Desconocida';
};

onMounted(fetchRecordatorios);
watch(currentDate, fetchRecordatorios);
</script>

<style scoped>
@media (max-width: 1023px) {
  .calendar-container {
    padding: 0.5rem;
  }
  
  .grid-cols-7 {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
}
</style>