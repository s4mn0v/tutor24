<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

interface Evento {
  id: number;
  title: string;
  date: string;
  importance: 'low' | 'medium' | 'high';
  asignatura: {
    id: number;
    nombre: string;
  };
}

interface Asignatura {
  id: number;
  nombre: string;
}

interface CalendarResponse {
  eventos: Evento[];
  asignaturas: Asignatura[];
}

interface NewReminder {
  text: string;
  date: Date | null;
  importance: 'low' | 'medium' | 'high';
  asignaturaId: number | null;
}

const { user } = useAuth();
const currentDate = ref<Date>(new Date());
const selectedDate = ref<Date | null>(null);
const showModal = ref(false);
const asignaturas = ref<Asignatura[]>([]);
const eventos = ref<Evento[]>([]);
const selectedAsignatura = ref<string | number | undefined>(undefined);

const newReminder = ref<NewReminder>({
  text: '',
  date: null,
  importance: 'medium',
  asignaturaId: null
});

const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()]);
const currentYear = computed(() => currentDate.value.getFullYear());

const fetchEventos = async () => {
  try {
    const response = await $fetch<CalendarResponse>('/api/docente/eventos');
    eventos.value = response.eventos;
    asignaturas.value = response.asignaturas;
  } catch (error) {
    console.error('Error al obtener eventos:', error);
  }
};

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasReminder: boolean;
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: CalendarDay[] = [];

  // Add days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ 
      date, 
      isCurrentMonth: false, 
      isToday: isToday(date), 
      hasReminder: hasReminder(date) 
    });
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ 
      date, 
      isCurrentMonth: true, 
      isToday: isToday(date), 
      hasReminder: hasReminder(date) 
    });
  }

  // Add days from next month
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ 
      date, 
      isCurrentMonth: false, 
      isToday: isToday(date), 
      hasReminder: hasReminder(date) 
    });
  }

  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const selectDate = (date: Date) => {
  if (isPastDate(date)) {
    return; // No permitir seleccionar fechas pasadas
  }
  selectedDate.value = date;
  newReminder.value.date = date;
  showModal.value = true;
};

const isSelected = (date: Date) => {
  return selectedDate.value && date.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isPastDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const hasReminder = (date: Date) => {
  return eventos.value.some((evento: Evento) =>
    new Date(evento.date).toDateString() === date.toDateString()
  );
};

const addReminder = async () => {
  if (!selectedAsignatura.value) {
    // TODO: Mostrar mensaje de error
    return;
  }

  if (newReminder.value.text.trim() && newReminder.value.date && !isPastDate(newReminder.value.date)) {
    try {
      await $fetch('/api/docente/eventos', {
        method: 'POST',
        body: {
          title: newReminder.value.text,
          description: newReminder.value.text,
          date: newReminder.value.date.toISOString(),
          published: true,
          asignaturaId: parseInt(selectedAsignatura.value.toString(), 10)
        }
      });

      await fetchEventos();

      newReminder.value = {
        text: '',
        date: null,
        importance: 'medium',
        asignaturaId: null
      };
      newReminder.value.asignaturaId = parseInt(selectedAsignatura.value.toString(), 10);
      showModal.value = false;
    } catch (error) {
      console.error('Error al crear recordatorio:', error);
      // TODO: Mostrar mensaje de error
    }
  }
};

const deleteReminder = async (id: number) => {
  try {
    await $fetch(`/api/docente/eventos/${id}`, {
      method: 'DELETE'
    });
    await fetchEventos();
  } catch (error) {
    console.error('Error al eliminar recordatorio:', error);
    // TODO: Mostrar mensaje de error
  }
};


const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const getReminderColor = (importance: string) => {
  switch (importance) {
    case 'low':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'medium':
      return 'bg-yellow-50 dark:bg-yellow-900/20';
    case 'high':
      return 'bg-red-50 dark:bg-red-900/20';
    default:
      return 'bg-gray-50 dark:bg-gray-900/20';
  }
};

const getReminderBadgeColor = (importance: string) => {
  switch (importance) {
    case 'low':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'high':
      return 'red';
    default:
      return 'gray';
  }
};

onMounted(async () => {
  await fetchEventos();
});
</script>

<template>
  <div class="teacher-calendar w-full h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-900 p-4 rounded-lg">
    <div class="flex flex-col lg:flex-row gap-4 h-full max-h-[calc(50vh-2rem)]">
      <!-- Calendario -->
      <div class="flex-grow bg-white dark:bg-gray-700 rounded-xl shadow-xl overflow-hidden flex flex-col min-h-[30vh] lg:min-h-0 lg:max-h-[calc(50vh-2rem)]">
        <div class="p-2 sm:p-4 flex-grow flex flex-col">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {{ currentMonthName }} {{ currentYear }}
            </h2>
            <div class="flex space-x-2">
              <UButton color="indigo" variant="ghost" icon="i-heroicons-chevron-left" size="xs" @click="previousMonth" />
              <UButton color="indigo" variant="ghost" icon="i-heroicons-chevron-right" size="xs" @click="nextMonth" />
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1 mb-1">
            <div v-for="day in daysOfWeek" :key="day" class="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1 flex-grow">
            <UButton v-for="{ date, isCurrentMonth, isToday, hasReminder } in calendarDays" :key="date.toISOString()"
              @click="selectDate(date)" :color="isSelected(date) ? 'indigo' : isToday ? 'gray' : 'white'"
              :variant="isSelected(date) ? 'solid' : isToday ? 'soft' : 'ghost'"
              :disabled="isPastDate(date)"
              class="aspect-square flex flex-col items-center justify-center p-0 text-xs rounded-md transition-all duration-200 ease-in-out"
              :class="{
                'opacity-50': !isCurrentMonth || isPastDate(date),
                'font-bold': hasReminder || isToday,
                'cursor-not-allowed': isPastDate(date)
              }">
              <span :class="{ 'text-indigo-600 dark:text-indigo-400': isToday && !isSelected(date) }">
                {{ date.getDate() }}
              </span>
              <div v-if="hasReminder" class="w-1 h-1 bg-red-500 rounded-full mt-0.5"></div>
            </UButton>
          </div>
        </div>
      </div>

      <!-- Recordatorios -->
      <div class="w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-gray-700 rounded-xl shadow-xl flex flex-col min-h-[20vh] lg:min-h-0 lg:max-h-[calc(50vh-2rem)]">
        <div class="p-2 sm:p-4 flex flex-col h-full">
          <h3 class="text-base font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Recordatorios</h3>
          <div class="flex-grow overflow-y-auto pr-2">
            <div v-if="eventos.length > 0" class="space-y-2">
              <UCard v-for="evento in eventos" :key="evento.id" :ui="{
                base: 'transition-all duration-200 ease-in-out hover:shadow-md',
                background: getReminderColor(evento.importance),
                divide: 'divide-y divide-gray-200 dark:divide-gray-600'
              }">
                <template #header>
                  <div class="flex justify-between items-center">
                    <p class="text-xs font-medium">{{ formatDate(evento.date) }}</p>
                    <p class="text-xs text-gray-500">{{ evento.asignatura.nombre }}</p>
                  </div>
                </template>
                <div class="py-1">
                  <p class="text-xs">{{ evento.title }}</p>
                </div>
                <template #footer>
                  <div class="flex justify-end">
                    <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" @click="deleteReminder(evento.id)" />
                  </div>
                </template>
              </UCard>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400 text-center mt-4 text-xs">
              No hay recordatorios. Haz clic en un día para agregar uno.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar recordatorio -->
    <UModal v-model="showModal">
      <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-700' }">
        <template #header>
          <h3 class="text-base font-semibold">
            Agregar Recordatorio
          </h3>
        </template>
        <form @submit.prevent="addReminder" class="space-y-4">
          <UFormGroup label="Asignatura" name="asignatura" required>
            <USelect
              v-model="selectedAsignatura"
              :options="asignaturas.map((a: Asignatura) => ({ label: a.nombre, value: a.id.toString() }))"
              placeholder="Selecciona una asignatura"
            />
          </UFormGroup>
          <UFormGroup label="Recordatorio" name="reminder-text">
            <UTextarea v-model="newReminder.text" placeholder="Escribe tu recordatorio" required class="resize-none" />
          </UFormGroup>
          <UFormGroup label="Importancia" name="reminder-importance">
            <USelect v-model="newReminder.importance" :options="[
              { label: 'Baja', value: 'low' },
              { label: 'Media', value: 'medium' },
              { label: 'Alta', value: 'high' }
            ]" />
          </UFormGroup>
        </form>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" variant="soft" size="sm" @click="showModal = false" class="text-black dark:text-black dark:hover:text-white">
              Cancelar
            </UButton>
            <UButton size="sm" @click="addReminder" :disabled="!selectedAsignatura">
              Agregar
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
.teacher-calendar {
  height: calc(50vh);
}
</style>

