<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Información de la Asignatura -->
    <div class="bg-white shadow-sm mb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-blue-600 py-6">
          {{ asignatura?.nombre }}
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          <div>
            <p class="text-gray-600"><span class="font-medium">Carrera:</span> {{ asignatura?.carrera }}</p>
            <p class="text-gray-600"><span class="font-medium">Jornada:</span> {{ asignatura?.jornada }}</p>
          </div>
          <div>
            <p class="text-gray-600"><span class="font-medium">Estudiantes:</span> {{ asignatura?.estudiantes?.length || 0 }}</p>
            <p class="text-gray-600">
              <span class="font-medium">Estado:</span>
              <span :class="asignatura?.activo ? 'text-green-600' : 'text-red-600'">
                {{ asignatura?.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Programático -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 class="text-xl font-semibold mb-4 sm:mb-0">Contenido Programático</h2>
            <UButton
              v-if="materialesList.length < 3"
              color="green"
              @click="handleUploadClick"
              :loading="isUploading"
              :disabled="isUploading"
            >
              {{ isUploading ? 'Subiendo...' : 'Subir Información' }}
            </UButton>
          </div>

          <!-- Lista de Materiales -->
          <div v-if="materialesList.length > 0" class="space-y-4">
            <TransitionGroup name="list">
              <div
                v-for="material in materialesList"
                :key="material.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <div class="flex items-center space-x-3">
                  <div class="i-heroicons-document text-xl text-blue-600" />
                  <div>
                    <p class="font-medium text-gray-900">{{ material.nombreArchivo }}</p>
                    <p class="text-sm text-gray-500">
                      Subido el {{ formatearFecha(material.creadoEn) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <UButton
                    color="blue"
                    variant="ghost"
                    icon="i-heroicons-arrow-down-tray"
                    @click="downloadMaterial(material.id)"
                    aria-label="Descargar material"
                  />
                  <UButton
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    :loading="isDeletingId === material.id"
                    @click="deleteMaterial(material.id)"
                    aria-label="Eliminar material"
                  />
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- Estado vacío -->
          <div v-else class="text-center py-12">
            <div class="i-heroicons-document-plus text-4xl text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 mb-2">No hay materiales subidos aún.</p>
            <p class="text-sm text-gray-400">Puedes subir hasta 3 archivos para el contenido programático.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input oculto para subida de archivos -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="handleFileUpload"
      accept=".pdf,.doc,.docx,.txt"
    >

    <!-- Modal de confirmación para eliminar -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Confirmar eliminación</h3>
        </template>
        <p class="text-gray-600">¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.</p>
        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton color="gray" @click="showDeleteModal = false">Cancelar</UButton>
            <UButton 
              color="red" 
              :loading="isDeletingId !== null"
              @click="confirmDelete"
            >
              Eliminar
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch, useToast } from '#imports'

interface Asignatura {
  id: number
  nombre: string
  carrera: string
  jornada: string
  estudiantes: any[]
  activo: boolean
}

interface Material {
  id: number
  nombreArchivo: string
  tipoArchivo: string
  creadoEn: string
}

const route = useRoute()
const asignatura = ref<Asignatura | null>(null)
const materiales = ref<Material[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const isDeletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const materialToDelete = ref<number | null>(null)
const toast = useToast()

const materialesList = computed(() => {
  return Array.isArray(materiales.value) 
    ? materiales.value
        .filter(m => m.nombreArchivo && m.creadoEn)
        .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
    : []
})

const formatearFecha = (fechaStr: string): string => {
  if (!fechaStr) return 'Fecha no disponible'
  
  try {
    const fecha = new Date(fechaStr)
    if (isNaN(fecha.getTime())) return 'Fecha no disponible'
    
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Fecha no disponible'
  }
}

onMounted(async () => {
  await fetchAsignaturaDetails()
  await fetchMateriales()
})

const fetchAsignaturaDetails = async (): Promise<void> => {
  try {
    const { data } = await useFetch<Asignatura>(`/api/asignaturas/${route.params.id}`)
    if (data.value) {
      asignatura.value = data.value
    }
  } catch (error) {
    console.error('Error obteniendo detalles de la asignatura:', error)
    toast.add({ title: 'Error al cargar los detalles de la asignatura', color: 'red' })
  }
}

const fetchMateriales = async (): Promise<void> => {
  try {
    const { data, error } = await useFetch<Material[]>(`/api/asignaturas/${route.params.id}/materiales`)
    if (error.value) throw error.value
    if (data.value) {
      materiales.value = data.value
    }
  } catch (error) {
    console.error('Error obteniendo materiales:', error)
    toast.add({ title: 'Error al cargar los materiales', color: 'red' })
    materiales.value = []
  }
}

const handleUploadClick = (): void => {
  if (materialesList.value.length >= 3) {
    toast.add({ 
      title: 'Límite alcanzado', 
      description: 'Ya has subido el máximo de 3 archivos permitidos.',
      color: 'yellow' 
    })
    return
  }
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) {
    console.log('No se seleccionó ningún archivo')
    return
  }
  
  console.log('Archivo seleccionado:', file.name, 'Tipo:', file.type, 'Tamaño:', file.size)

  // Validar tamaño del archivo (máximo 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB en bytes
  if (file.size > MAX_FILE_SIZE) {
    toast.add({ 
      title: 'Archivo demasiado grande', 
      description: 'El archivo no debe superar los 10MB',
      color: 'red' 
    })
    input.value = ''
    return
  }

  // Validar tipo de archivo
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedTypes.includes(fileExtension)) {
    toast.add({ 
      title: 'Tipo de archivo no permitido', 
      description: 'Solo se permiten archivos PDF, DOC, DOCX y TXT',
      color: 'red' 
    })
    input.value = ''
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  try {
    console.log('Iniciando carga de archivo:', file.name)

    const { data, error } = await useFetch<Material>(`/api/asignaturas/${route.params.id}/materiales`, {
      method: 'POST',
      body: formData,
    })

    console.log('Respuesta del servidor:', data.value, error.value)

    if (error.value) throw error.value

    if (data.value) {
      materiales.value = [data.value, ...materiales.value]
      toast.add({
        title: 'Archivo subido con éxito', 
        description: 'El material ha sido agregado correctamente',
        color: 'green' 
      })
    } else {
      throw new Error('No se recibieron datos del servidor')
    }
  } catch (error) {
    console.error('Error al subir el archivo:', error)
    toast.add({ 
      title: 'Error al subir el archivo', 
      description: 'Por favor, intenta nuevamente',
      color: 'red' 
    })
  } finally {
    isUploading.value = false
    if (input) input.value = ''
  }
}

const downloadMaterial = async (materialId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/asignaturas/${route.params.id}/materiales/${materialId}/download`)
    if (!response.ok) throw new Error('Error al descargar el archivo')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = materialesList.value.find(m => m.id === materialId)?.nombreArchivo || 'material'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar el material:', error)
    toast.add({ 
      title: 'Error al descargar el material', 
      description: 'Por favor, intenta nuevamente',
      color: 'red' 
    })
  }
}

const deleteMaterial = (materialId: number): void => {
  materialToDelete.value = materialId
  showDeleteModal.value = true
}

const confirmDelete = async (): Promise<void> => {
  if (!materialToDelete.value) return

  isDeletingId.value = materialToDelete.value
  try {
    const { error } = await useFetch(`/api/asignaturas/${route.params.id}/materiales/${materialToDelete.value}`, {
      method: 'DELETE'
    })
    
    if (!error.value) {
      materiales.value = materialesList.value.filter(m => m.id !== materialToDelete.value)
      toast.add({ 
        title: 'Material eliminado con éxito',
        description: 'El material ha sido eliminado correctamente',
        color: 'green' 
      })
      showDeleteModal.value = false
    } else {
      throw error.value
    }
  } catch (error) {
    console.error('Error al eliminar el material:', error)
    toast.add({ 
      title: 'Error al eliminar el material',
      description: 'Por favor, intenta nuevamente',
      color: 'red' 
    })
  } finally {
    isDeletingId.value = null
    materialToDelete.value = null
  }
}
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

