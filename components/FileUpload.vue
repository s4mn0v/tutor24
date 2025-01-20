<template>
    <div>
      <input type="file" @change="handleFileChange" accept=".pdf,.doc,.docx" multiple />
      <UButton @click="uploadFiles" :disabled="!selectedFiles.length" :loading="uploading">
        Subir archivos
      </UButton>
      <p v-if="error" class="text-red-500">{{ error }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const props = defineProps<{
    asignaturaId: number
  }>()
  
  const emit = defineEmits(['filesUploaded'])
  
  const selectedFiles = ref<File[]>([])
  const uploading = ref(false)
  const error = ref('')
  
  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      selectedFiles.value = Array.from(target.files)
    }
  }
  
  const uploadFiles = async () => {
    if (selectedFiles.value.length === 0) return
  
    uploading.value = true
    error.value = ''
  
    try {
      const formData = new FormData()
      selectedFiles.value.forEach(file => {
        formData.append('files', file)
      })
  
      const response = await $fetch(`/api/asignaturas/${props.asignaturaId}/materiales`, {
        method: 'POST',
        body: formData
      })
  
      emit('filesUploaded', response)
      selectedFiles.value = []
    } catch (e) {
      console.error('Error uploading files:', e)
      error.value = 'Error al subir los archivos. Por favor, intente de nuevo.'
    } finally {
      uploading.value = false
    }
  }
  </script>
  
  