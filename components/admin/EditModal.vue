<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Editar Usuario</h3>
      </template>

      <UForm :state="user" @submit="handleSubmit">
        <!-- Nombre -->
        <UFormGroup label="Nombre" name="nombre">
          <UInput v-model="user.nombre" />
        </UFormGroup>
        <br />

        <!-- Correo -->
        <UFormGroup label="Correo" name="correo">
          <UInput v-model="user.correo" type="email" @keydown="preventInvalidEmail" />
        </UFormGroup>
        <br />

        <!-- Teléfono -->
        <UFormGroup label="Teléfono" name="telefono">
          <UInput v-model="user.telefono" type="tel" @keydown="preventNonNumeric" />
        </UFormGroup>
        <br />

        <!-- Documento -->
        <UFormGroup label="Documento" name="documentoIdentidad">
          <UInput v-model="user.documentoIdentidad" type="text" @keydown="preventNonNumeric" />
        </UFormGroup>
        <br />

        <!-- Contraseña -->
        <UFormGroup label="Contraseña" name="contrasena">
          <UInput v-model="newPassword" type="password" placeholder="Dejar en blanco para no cambiar" />
        </UFormGroup>
        <br />

        <!-- Botón de guardar -->
        <UButton type="submit">Guardar</UButton>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Define la interfaz User
interface User {
  documentoIdentidad: string;
  nombre: string;
  correo: string;
  telefono: string;
  id: number;
  rol: string;
  contrasena: string;
}

// Props
const props = defineProps({
  user: {
    type: Object as () => User,
    required: true,
  },
})

// Emits
const emit = defineEmits(['submit'])

// Estado del modal
const isOpen = ref(false)

// Nueva contraseña (no se vincula directamente al usuario)
const newPassword = ref('')

// Abrir el modal
const openModalEdit = () => {
  isOpen.value = true
  newPassword.value = '' // Reiniciar el campo de contraseña al abrir el modal
}

// Cerrar el modal
const closeModal = () => {
  isOpen.value = false
}

// Prevenir caracteres no numéricos en teléfono y documento
const preventNonNumeric = (event: KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] // Teclas permitidas
  if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
    event.preventDefault() // Bloquear caracteres no numéricos
  }
}

// Prevenir caracteres no válidos en el correo
const preventInvalidEmail = (event: KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] // Teclas permitidas
  if (!/[a-zA-Z0-9@._-]/.test(event.key) && !allowedKeys.includes(event.key)) {
    event.preventDefault() // Bloquear caracteres no válidos
  }
}

// Manejar el envío del formulario
const handleSubmit = () => {
  const updatedUser = { ...props.user }
  if (newPassword.value) {
    updatedUser.contrasena = newPassword.value // Solo actualizar la contraseña si se proporciona una nueva
  }
  emit('submit', updatedUser)
  closeModal()
}

// Exponer métodos para que el componente padre pueda controlar el modal
defineExpose({ openModalEdit, closeModal })
</script>