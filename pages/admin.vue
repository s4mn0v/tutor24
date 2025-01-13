<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded">
      Logout
    </button>
  </div>
</template>

<script setup>
const { logout } = useAuth()
</script>