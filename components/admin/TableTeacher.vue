<template>
  <UCard>
    <div class="flex justify-end">
      <UButton @click="openCreateModal" color="primary" class="mb-4" icon="i-heroicons-plus-circle-20-solid" />
    </div>

    <UInput v-model="search" placeholder="Buscar por nombre, correo, teléfono o documento..." />
    <!-- Botón para eliminar múltiples usuarios -->
    <UButton v-if="selected.length > 0" :disabled="selected.length === 0" @click="openDeleteModalForSelected"
      color="red" variant="outline" class="mt-4" icon="i-heroicons-trash-20-solid" title="Eliminar seleccionados" />
    <br>
    <UTable :rows="users" :columns="columns" :loading="loading"
      :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      :progress="{ color: 'primary', animation: 'carousel' }"
      :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }" v-model="selected">
      <!-- Columna de acciones personalizada -->
      <template #actions-data="{ row }">
        <UDropdown :items="actions(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>


    <!-- Paginación -->
    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-model="page" :page-count="limit" :total="total" />
    </div>

    <!-- Modal de edición -->
    <EditModal ref="editModal" :user="editingUser" @submit="editUser" />

    <!-- Modal de eliminación -->
    <DeleteModal ref="deleteModal" :user="userToDelete" :selectedUsers="selected" @confirm="handleDeleteConfirm" />

    <!-- Modal de creación de docente -->
    <CreateTeacherModal ref="createTeacherModal" @created="fetchUsers" />
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DeleteModal from './DeleteModal.vue'
import EditModal from './EditModal.vue' // Importa el nuevo componente
import CreateTeacherModal from './CreateTeacherModal.vue'

const selected = ref<User[]>([])
const editingUser = ref<User>({
  documentoIdentidad: '',
  nombre: '',
  correo: '',
  telefono: '',
  id: 0,
  rol: '',
  contrasena: '',
})

// Interfaz User
interface User {
  documentoIdentidad: string;
  nombre: string;
  correo: string;
  telefono: string;
  id: number;
  rol: string;
  contrasena: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

const search = ref('')
const page = ref(1)
const limit = ref(50)
const loading = ref(false)
const users = ref<User[]>([])
const total = ref(0)
const userToDelete = ref<User | null>(null) // Cambiado a null para manejar casos sin usuario seleccionado
const deleteModal = ref<InstanceType<typeof DeleteModal> | null>(null)
const editModal = ref<InstanceType<typeof EditModal> | null>(null) // Referencia al modal de edición
const createTeacherModal = ref<InstanceType<typeof CreateTeacherModal> | null>(null) // Referencia al modal de creación

const columns = [
  { key: '', label: '' },
  { key: 'documentoIdentidad', label: 'Documento' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'actions', label: 'Acciones' }
]

const fetchUsers = async () => {
  loading.value = true;
  const response = await $fetch<UsersResponse>('/api/admin/users', {
    query: {
      page: page.value,
      limit: limit.value,
      search: search.value.toLocaleLowerCase()
    }
  });
  const { users: fetchedUsers, total: fetchedTotal } = response;
  users.value = fetchedUsers.map(user => ({
    ...user,
    telefono: user.telefono || ''
  }));
  total.value = fetchedTotal;
  loading.value = false;
}

// Watchers para actualizar la tabla cuando cambia la página o la búsqueda
watch([page, search], fetchUsers, { immediate: true })

// Función para generar las acciones del dropdown
const actions = (row: User) => [
  [{
    label: 'Editar',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => {
      editingUser.value = { ...row }
      editModal.value?.openModalEdit() // Abrir el modal de edición
    }
  }],
  [{
    label: 'Eliminar',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {
      userToDelete.value = row;
      deleteModal.value?.openModalDelete();
    }
  }]
]

// Lógica para editar un usuario
const editUser = async (user: User) => {
  try {
    const updatedUser = await $fetch(`/api/admin/users`, {
      method: 'PUT',
      body: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono || '',
        documentoIdentidad: user.documentoIdentidad,
        contrasena: user.contrasena || undefined, // Enviar undefined si no se proporciona una nueva contraseña
      },
    });
    console.log('Usuario actualizado:', updatedUser);
    fetchUsers();
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
  }
}

// Lógica para manejar la confirmación de eliminación
const handleDeleteConfirm = async (users: User | User[]) => {
  try {
    if (Array.isArray(users)) {
      // Eliminar múltiples usuarios
      const ids = users.map(user => user.id);
      const response = await $fetch('/api/admin/select/users', {
        method: 'DELETE',
        body: { ids },
      });
      console.log('Usuarios eliminados:', response);
    } else {
      // Eliminar un solo usuario
      const response = await $fetch(`/api/admin/users`, {
        method: 'DELETE',
        body: {
          id: users.id
        }
      });
      console.log('Usuario eliminado:', response);
    }
    fetchUsers();
    selected.value = []; // Limpiar la selección después de eliminar
    userToDelete.value = null; // Limpiar el usuario a eliminar
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
}

// Abrir el modal para eliminar múltiples usuarios seleccionados
const openDeleteModalForSelected = () => {
  if (selected.value.length > 0) {
    deleteModal.value?.openModalDelete();
  }
}

// Abrir el modal de creación de docente
const openCreateModal = () => {
  createTeacherModal.value?.openModalCreate();
}
</script>