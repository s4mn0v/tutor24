<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Crear Nuevo Docente</h3>
      </template>

      <UForm :state="form" @submit="createDocente">
        <!-- Documento de Identidad -->
        <UFormGroup label="Documento de Identidad" name="documentoIdentidad" required>
          <UInput v-model="form.documentoIdentidad" placeholder="Ingrese el documento" @keydown="preventNonNumeric" />
        </UFormGroup>

        <!-- Nombre -->
        <UFormGroup label="Nombre" name="nombre" required>
          <UInput v-model="form.nombre" placeholder="Ingrese el nombre" />
        </UFormGroup>

        <!-- Correo Electrónico -->
        <UFormGroup label="Correo Electrónico" name="correo" required>
          <UInput v-model="form.correo" type="email" placeholder="Ingrese el correo" @keydown="preventInvalidEmail" />
        </UFormGroup>

        <!-- Teléfono -->
        <UFormGroup label="Teléfono" name="telefono">
          <UInput v-model="form.telefono" placeholder="Ingrese el teléfono" @keydown="preventNonNumeric" />
        </UFormGroup>

        <!-- Contraseña -->
        <UFormGroup label="Contraseña" name="contrasena" required>
          <UInput v-model="form.contrasena" type="password" placeholder="Ingrese la contraseña" />
        </UFormGroup>

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

// Open the modal
const openModalCreate = () => {
  isOpen.value = true
}

// Close the modal
const closeModal = () => {
  isOpen.value = false
  resetForm()
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
    })
    console.log('Docente creado:', response)
    closeModal()
    // Emitir evento para notificar que se ha creado un nuevo docente
    emit('created')
  } catch (error) {
    console.error('Error al crear el docente:', error)
  }
}

// Expose methods for control from the parent component
defineExpose({ openModalCreate, closeModal })
</script>