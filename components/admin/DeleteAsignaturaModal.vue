<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Confirmar Eliminación de Asignatura</h3>
      </template>

      <!-- Mensaje dinámico según el tipo de eliminación -->
      <p v-if="asignatura">¿Estás seguro de eliminar la asignatura <strong>{{ asignatura.nombre }}</strong>?</p>
      <p v-else-if="selectedAsignaturas.length > 0">
        ¿Estás seguro de eliminar las <strong>{{ selectedAsignaturas.length }}</strong> asignaturas seleccionadas?
      </p>
      <p v-else>No se ha seleccionado ninguna asignatura para eliminar.</p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" @click="closeModal">Cancelar</UButton>
          <UButton color="red" @click="confirmDelete">Eliminar</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'

interface Asignatura {
  id: number;
  nombre: string;
  carrera: string;
}

const props = defineProps({
  asignatura: {
    type: Object as PropType<Asignatura | null>,
    default: null,
  },
  selectedAsignaturas: {
    type: Array as () => Asignatura[],
    default: () => [],
  },
});

const emit = defineEmits(['confirm'])

const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const confirmDelete = () => {
  if (props.asignatura) {
    emit('confirm', props.asignatura)
  } else if (props.selectedAsignaturas.length > 0) {
    emit('confirm', props.selectedAsignaturas)
  }
  closeModal()
}

defineExpose({ openModal, closeModal })
</script>