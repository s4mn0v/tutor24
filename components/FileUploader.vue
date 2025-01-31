<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-4">Subir Archivo</h2>
    <input type="file" @change="handleFileChange" />
    <button
      @click="uploadFile"
      :disabled="!selectedFile"
      class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-zinc-300"
    >
      Subir
    </button>

    <div v-if="uploading" class="mt-4 text-gray-600">Subiendo archivo...</div>
    <div v-if="error" class="mt-4 text-red-600">Error: {{ error }}</div>
    <div v-if="success" class="mt-4 text-green-600">Archivo subido con éxito.</div>

    <!-- Lista de archivos subidos -->
    <div v-if="materiales.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold mb-2">Archivos Subidos:</h3>
      <ul class="list-disc pl-5">
        <li v-for="material in materiales" :key="material.id" class="mb-2">
          <a :href="material.url" target="_blank" class="text-blue-500 hover:underline">
            {{ material.nombre }}
          </a>
          <span class="text-gray-500 text-sm ml-2">({{ material.tipo }})</span>
          <UButton
                @click="deleteMaterial(material.id)"
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                :loading="deleting === material.id"
              >
                Eliminar
              </UButton> 
        </li>
      </ul>
    </div>
    <div v-else class="mt-4 text-gray-600">
      No hay archivos subidos aún.
    </div>
  </div>
</template>

<script>
export default {
  props: {
    idAsignatura: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      selectedFile: null,
      uploading: false,
      success: false,
      error: null,
      materiales: [], // Lista de materiales subidos
      deleting: null, // ID del material que se está eliminando
    };
  },
  mounted() {
    this.fetchMateriales();
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    async fetchMateriales() {
      try {
        const response = await fetch(`/api/materials/${this.idAsignatura}`);
        if (!response.ok) {
          throw new Error('Error al obtener los materiales.');
        }
        this.materiales = await response.json();
      } catch (err) {
        this.error = err.message;
      }
    },
    async uploadFile() {
      if (!this.selectedFile) return;

      this.uploading = true;
      this.success = false;
      this.error = null;

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('idAsignatura', this.idAsignatura.toString());

      try {
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al subir el archivo.');
        }

        this.success = true;
        await this.fetchMateriales(); // Actualizar la lista de materiales después de subir
      } catch (err) {
        this.error = err.message;
      } finally {
        this.uploading = false;
      }
    },
    async deleteMaterial(idMaterial) {
      this.deleting = idMaterial;
      try {
        const response = await fetch(`/api/materials/${idMaterial}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar el archivo.');
        }

        // Actualizar la lista de materiales después de eliminar
        await this.fetchMateriales();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.deleting = null;
      }
    },
  },
};
</script>