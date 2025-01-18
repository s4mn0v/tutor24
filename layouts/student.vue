<template>
  <div v-cloak>
    <nav class="shadow-md bg-white text-gray-800 dark:bg-zinc-900 dark:text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold">
              <slot name="title">Pagina</slot>
            </NuxtLink>
          </div>

          <!-- Dark Mode Toggle Button -->
          <div class="flex items-center space-x-4">
            <Theme />
            <ButtonLogOut />
          </div>
        </div>
      </div>
    </nav>
    <!-- Contenedor con margen para el slot -->
    <div class="mx-4 my-6">
      <slot />
    </div>
  </div>
</template>
