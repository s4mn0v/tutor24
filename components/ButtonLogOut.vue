<template>
  <UButton
    @click="logout"
    icon="i-heroicons-arrow-left-circle"
    size="md"
    color="red"
    :ui="{ rounded: 'rounded-full' }"
    variant="solid"
  />
</template>

<script setup>
const { logout } = useAuth()
</script>
