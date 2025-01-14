<template>
  <nav class="shadow-md bg-white text-gray-800 dark:bg-zinc-900 dark:text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold">
            TUTOR - <slot name="title">Rol</slot>
          </NuxtLink>
        </div>

        <!-- Menu Items (Desktop) -->
        <div class="hidden md:flex space-x-8 items-center">
          <NuxtLink 
            v-for="item in filteredMenuItems" 
            :key="item.label" 
            :to="item.link"
            class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {{ item.label }}
          </NuxtLink>
        </div>

        <!-- Dark Mode Toggle Button -->
        <div class="flex items-center space-x-4">
          <Theme />
          <ButtonLogOut />

          <!-- Mobile Menu Button -->
          <button 
            @click="toggleMobileMenu"
            class="bg-gray-100 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 md:hidden dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            <span class="sr-only">Open menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div 
      v-if="isMobileMenuOpen"
      class="md:hidden border-t bg-gray-50 border-gray-200 dark:bg-zinc-800 dark:border-gray-700"
    >
      <div class="px-2 py-3 space-y-1">
        <NuxtLink 
          v-for="item in filteredMenuItems" 
          :key="item.label" 
          :to="item.link"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';

const { getUserRole } = useAuth();

// State to control mobile menu visibility
const isMobileMenuOpen = ref(false);

// Toggle function for mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Menu items with role restrictions
const menuItems = [
  { 
    label: 'Home', 
    link: '/',
    roles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE'] // visible to all authenticated users
  },
  { 
    label: 'Dashboard Admin', 
    link: '/',
    roles: ['ADMIN']
  },
  { 
    label: 'Panel Docente', 
    link: '/',
    roles: ['DOCENTE']
  },
  { 
    label: 'Área Estudiante', 
    link: '/',
    roles: ['ESTUDIANTE']
  },
  { 
    label: 'Gestión Usuarios', 
    link: '/',
    roles: ['ADMIN']
  },
  { 
    label: 'Mis Cursos', 
    link: '/',
    roles: ['DOCENTE', 'ESTUDIANTE']
  },
];

// Filter menu items based on user role
const filteredMenuItems = computed(() => {
  const userRole = getUserRole();
  if (!userRole) return []; // If no role, show no menu items
  
  return menuItems.filter(item => item.roles.includes(userRole));
});
</script>

<style scoped>
nav {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>