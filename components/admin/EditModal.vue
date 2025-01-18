<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Editar Usuario</h3>
      </template>

      <!-- Alert para mostrar errores -->
      <UAlert v-if="error"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        :title="error" color="red" @close="error = ''" variant="outline" />
      <br v-if="error">

      <UForm :state="user" @submit="handleSubmit">
        <!-- Nombre -->
        <UFormGroup label="Nombre" name="nombre" required>
          <UInput v-model="user.nombre" :rules="[requiredRule]" />
        </UFormGroup>
        <br />

        <!-- Correo -->
        <UFormGroup label="Correo" name="correo" required>
          <UInput v-model="user.correo" type="email" :rules="[requiredRule, emailRule]" @keydown="preventInvalidEmail" />
        </UFormGroup>
        <br />

        <!-- Teléfono -->
        <UFormGroup label="Teléfono" name="telefono" required>
          <UInput v-model="user.telefono" type="tel" :rules="[requiredRule]" @keydown="preventNonNumeric" />
        </UFormGroup>
        <br />

        <!-- Documento -->
        <UFormGroup label="Documento" name="documentoIdentidad" required>
          <UInput v-model="user.documentoIdentidad" type="text" :rules="[requiredRule]" @keydown="preventNonNumeric" />
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

// Estado de error
const error = ref('')

// Reglas de validación
const requiredRule = (value: string) => !!value || 'Este campo es requerido.'
const emailRule = (value: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Correo electrónico no válido.'
}

// Abrir el modal
const openModalEdit = () => {
  isOpen.value = true
  newPassword.value = '' // Reiniciar el campo de contraseña al abrir el modal
}

// Cerrar el modal
const closeModal = () => {
  isOpen.value = false
  error.value = '' // Limpiar el mensaje de error al cerrar el modal
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
const handleSubmit = async () => {
  const { user } = props; // Desestructuración de props
  try {
    // Validar campos requeridos
    if (!user.nombre || !user.correo || !user.telefono || !user.documentoIdentidad) {
      error.value = 'Todos los campos son requeridos, excepto la contraseña.';
      return;
    }

    const updatedUser = { ...user };
    if (newPassword.value) {
      updatedUser.contrasena = newPassword.value; // Solo actualizar la contraseña si se proporciona una nueva
    }

    // Si la actualización es exitosa, emitir el evento y cerrar el modal
    emit('submit', updatedUser);
    closeModal();
  } catch (err) {
    console.error('Error al actualizar el usuario:', err);

    // Extraer solo el mensaje del error
    let errorMessage = 'Ocurrió un error al actualizar el usuario.';
    if (typeof err === 'object' && err !== null && 'message' in err) {
      const fullMessage = (err as any).message as string;

      // Usar una expresión regular para extraer solo el mensaje después del código de estado
      const match = fullMessage.match(/:\s*\d+\s*(.*)/);
      if (match && match[1]) {
        errorMessage = match[1].trim(); // Extraer el mensaje sin el prefijo
      }
    }

    error.value = errorMessage; // Mostrar solo el mensaje
  }
};

// Exponer métodos para que el componente padre pueda controlar el modal
defineExpose({ openModalEdit, closeModal, error })
</script>