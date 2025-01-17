<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Confirmar Eliminación</h3>
      </template>

      <!-- Mensaje dinámico según el tipo de eliminación -->
      <p v-if="user">¿Estás seguro de que deseas eliminar a <strong>{{ user.nombre }}</strong>?</p>
      <p v-else-if="selectedUsers.length > 0">
        ¿Estás seguro de que deseas eliminar a los <strong>{{ selectedUsers.length }}</strong> usuarios seleccionados?
      </p>
      <p v-else>No se ha seleccionado ningún usuario para eliminar.</p>

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

// Define la interfaz User
interface User {
  id: number;
  nombre: string;
  documentoIdentidad?: string;
  correo?: string;
  telefono?: string;
  rol?: string;
  contrasena?: string;
}

// Props
const props = defineProps({
  user: {
    type: Object as PropType<User | null | undefined>,
    required: false,
    default: () => null,
  },
  selectedUsers: {
    type: Array as () => User[],
    required: false,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['confirm'])

// Estado del modal
const isOpen = ref(false)

// Abrir el modal
const openModalDelete = () => {
  isOpen.value = true
}

// Cerrar el modal
const closeModal = () => {
  isOpen.value = false
}

// Confirmar eliminación
const confirmDelete = () => {
  if (props.user) {
    // Eliminar un solo usuario
    emit('confirm', props.user);
  } else if (props.selectedUsers.length > 0) {
    // Eliminar múltiples usuarios
    emit('confirm', props.selectedUsers);
  }
  closeModal();
}

// Exponer métodos para control desde el componente padre
defineExpose({ openModalDelete, closeModal })
</script>