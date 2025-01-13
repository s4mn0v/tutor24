<!-- pages/teacher/create-course.vue -->
<template>
  <div>
    <h1>Create New Course</h1>
    <form @submit.prevent="createCourse">
      <input v-model="courseName" placeholder="Course Name" required />
      <button type="submit">Create Course</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const courseName = ref('')

const createCourse = async () => {
  try {
    const response = await $fetch('/api/courses', {
      method: 'POST',
      body: { name: courseName.value },
    })
    console.log('Course created', response)
    // Handle success (e.g., show message, redirect)
  } catch (error) {
    console.error('Error creating course', error)
    // Handle error
  }
}
</script>