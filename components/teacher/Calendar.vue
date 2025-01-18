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
            <div v-if="reminders.length > 0" class="space-y-2">
              <UCard v-for="reminder in reminders" :key="reminder.id" :ui="{
                base: 'transition-all duration-200 ease-in-out hover:shadow-md',
                background: getReminderColor(reminder.importance),
                divide: 'divide-y divide-gray-200 dark:divide-gray-600'
              }">
                <template #header>
                  <div class="flex justify-between items-center">
                    <p class="text-xs font-medium">{{ formatDate(reminder.date) }}</p>
                    <UBadge :color="getReminderBadgeColor(reminder.importance)" size="xs">
                      {{ reminder.importance }}
                    </UBadge>
                  </div>
                </template>
                <div class="py-1">
                  <p class="text-xs">{{ reminder.text }}</p>
                </div>
                <template #footer>
                  <div class="flex justify-end">
                    <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" @click="deleteReminder(reminder.id)" />
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
          <h3 class="text-base font-semibol">
            Agregar Recordatorio
          </h3>
        </template>
        <form @submit.prevent="addReminder" class="space-y-4">
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
            <UButton size="sm" @click="addReminder">
              Agregar
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentDate = ref(new Date());
const selectedDate = ref(null);
const reminders = ref([]);
const showModal = ref(false);

const newReminder = ref({
  text: '',
  date: null,
  importance: 'medium'
});

const daysOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()]);
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ date, isCurrentMonth: false, isToday: isToday(date), hasReminder: hasReminder(date) });
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ date, isCurrentMonth: true, isToday: isToday(date), hasReminder: hasReminder(date) });
  }

  // Add days from next month
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({ date, isCurrentMonth: false, isToday: isToday(date), hasReminder: hasReminder(date) });
  }

  return days;
});

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const selectDate = (date) => {
  if (isPastDate(date)) {
    return; // No permitir seleccionar fechas pasadas
  }
  selectedDate.value = date;
  newReminder.value.date = date;
  showModal.value = true;
};

const isSelected = (date) => {
  return selectedDate.value && date.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignorar la hora, comparar solo la fecha
  return date < today;
};

const hasReminder = (date) => {
  return reminders.value.some(reminder =>
    new Date(reminder.date).toDateString() === date.toDateString()
  );
};

const addReminder = () => {
  if (newReminder.value.text.trim() && newReminder.value.date && !isPastDate(newReminder.value.date)) {
    reminders.value.push({
      id: Date.now(),
      date: new Date(newReminder.value.date),
      text: newReminder.value.text,
      importance: newReminder.value.importance
    });
    newReminder.value = {
      text: '',
      date: selectedDate.value,
      importance: 'medium'
    };
    showModal.value = false;
  }
};

const deleteReminder = (id) => {
  reminders.value = reminders.value.filter(reminder => reminder.id !== id);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const getReminderColor = (importance) => {
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

const getReminderBadgeColor = (importance) => {
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
</script>

<style scoped>
.teacher-calendar {
  height: calc(50vh);
}
</style>