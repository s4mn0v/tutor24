<template>
  <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Contenido del Curso</h2>
    <div v-if="materials.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="material in materials" :key="material.id" class="mb-4 p-4 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
          {{ material.nombre }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Tipo: {{ material.tipo }}
        </p>
        <div class="mt-2">
          <a :href="material.url" target="_blank"
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
            Ver en línea
          </a>
        </div>
        <!-- Se ha eliminado la sección de "Temas principales" -->
      </div>
    </div>
    <div v-else class="text-gray-600 dark:text-gray-400">
      No hay materiales disponibles en este momento.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Material {
  id: number;
  nombre: string;
  tipo: string;
  url: string;
  // Se elimina la propiedad topics ya que ya no se usa
}

const materials = ref<Material[]>([]);

const fetchMaterials = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay sesión activa");
      return;
    }
    const response = await $fetch<Material[]>("/api/students/materials", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    materials.value = response;
  } catch (error) {
    console.error("Error:", error);
  }
};

onMounted(() => {
  fetchMaterials();
});
</script>
