<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Crear Nuevo Docente</h3>
      </template>

      <!-- Alert para mostrar errores -->
      <UAlert v-if="error"
        :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
        :title="error" color="red" @close="error = ''" variant="outline" />
      <br v-if="error">

      <UForm :state="form" @submit="createDocente">
        <!-- Documento de Identidad -->
        <UFormGroup label="Documento de Identidad" name="documentoIdentidad" required>
          <UInput v-model="form.documentoIdentidad" placeholder="Ingrese el documento" @keydown="preventNonNumeric"
            maxlength="10" />
        </UFormGroup>
        <br>

        <!-- Nombre -->
        <UFormGroup label="Nombre" name="nombre" required>
          <UInput v-model="form.nombre" placeholder="Ingrese el nombre" />
        </UFormGroup>
        <br>

        <!-- Correo Electrónico -->
        <UFormGroup label="Correo Electrónico" name="correo" required>
          <UInput v-model="form.correo" type="email" placeholder="Ingrese el correo" @keydown="preventInvalidEmail"
            maxlength="40" />
        </UFormGroup>
        <br>

        <!-- Teléfono -->
        <UFormGroup label="Teléfono" name="telefono">
          <UInput v-model="form.telefono" placeholder="Ingrese el teléfono" @keydown="preventNonNumeric"
            maxlength="10" />
        </UFormGroup>
        <br>

        <!-- Contraseña -->
        <UFormGroup label="Contraseña" name="contrasena" required>
          <UInput v-model="form.contrasena" type="password" placeholder="Ingrese la contraseña" minlength="8" />
        </UFormGroup>
        <br>

        <!-- Botones de acción -->
        <div class="flex justify-end gap-3 mt-4">
          <UButton type="button" color="gray" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" color="primary">Crear Docente</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Define emits
const emit = defineEmits(['created'])

// State of the modal
const isOpen = ref(false)

// Form for creating a new teacher
const form = ref({
  documentoIdentidad: '',
  nombre: '',
  correo: '',
  telefono: '',
  contrasena: '',
})

// State for error handling
const error = ref('')

// Open the modal
const openModalCreate = () => {
  isOpen.value = true
}

// Close the modal
const closeModal = () => {
  isOpen.value = false
  resetForm()
  error.value = '' // Reset error state when closing the modal
}

// Reset the form
const resetForm = () => {
  form.value = {
    documentoIdentidad: '',
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
  }
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

// Create a new teacher
const createDocente = async () => {
  try {
    const response = await $fetch('/api/admin/users', {
      method: 'POST',
      body: form.value,
    });
    console.log('Docente creado:', response);
    closeModal();
    emit('created');
  } catch (err) {
    console.error('Error al crear el docente:', err);

    // Extraer solo el mensaje del error
    let errorMessage = 'Ocurrió un error al crear el docente.';
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

// Expose methods for control from the parent component
defineExpose({ openModalCreate, closeModal })
</script>