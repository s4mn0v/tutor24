<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isRegistering ? 'Register' : 'Sign in to your account' }}
      </h2>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address" v-model="email" />
          </div>

          <div v-if="isRegistering">
            <label for="documentoIdentidad" class="sr-only">Documento de Identidad</label>
            <input id="documentoIdentidad" name="documentoIdentidad" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Documento de Identidad" v-model="documentoIdentidad" />
          </div>

          <div v-if="isRegistering">
            <label for="nombre" class="sr-only">Nombre</label>
            <input id="nombre" name="nombre" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nombre" v-model="nombre" />
          </div>

          <div v-if="isRegistering">
            <label for="telefono" class="sr-only">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Teléfono" v-model="telefono" />
          </div>

          <div v-if="isRegistering">
            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
            <select id="role" name="role"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              v-model="role">
              <option value="ADMIN">Admin</option>
              <option value="DOCENTE">Teacher</option>
              <option value="ESTUDIANTE">Student</option>
            </select>
          </div>

          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password" v-model="password" />
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {{ isRegistering ? 'Register' : 'Sign in' }}
          </button>
        </div>
      </form>
      <div class="text-center">
        <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500"
          @click.prevent="isRegistering = !isRegistering">
          {{ isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from '#app'
import { useAuth } from '~/composables/useAuth'

// const router = useRouter()
const route = useRoute()
const { login, register, isAuthenticated } = useAuth()
const email = ref('')
const password = ref('')
const role = ref('ESTUDIANTE')
const documentoIdentidad = ref('')
const nombre = ref('')
const telefono = ref('')

// Set initial state based on query parameter
const isRegistering = ref(route.query.register === 'true')
const error = ref('')

// Redirect if already authenticated
if (isAuthenticated()) {
  const userRole = getUserRole()
  if (userRole) {
    redirectBasedOnRole(userRole)
  }
}

const handleSubmit = async () => {
  error.value = ''
  try {
    if (isRegistering.value) {
      const response = await register(email.value, password.value, role.value, documentoIdentidad.value, nombre.value, telefono.value)
      console.log('Registration response:', response)
      // After successful registration, switch to login
      isRegistering.value = false
      error.value = 'Registration successful! Please login.'
    } else {
      await login(email.value, password.value)
    }
  } catch (e) {
    error.value = e.message || 'Authentication failed. Please check your credentials.'
    console.error('Authentication error', e)
  }
}
</script>
