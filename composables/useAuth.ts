// composables/useAuth.ts
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

interface AuthResponse {
  token: string;
  role: string;
}

export const useAuth = () => {
  const user = ref<{ email: string; role: string } | null>(null);
  const token = ref<string | null>(null);
  const router = useRouter();

  // Inicializar el estado de autenticación desde localStorage
  const initAuth = () => {
    if (process.client) {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
      }
    }
  };

  // Función para login
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Guardar los datos de autenticación
      token.value = response.token;
      user.value = {
        email,
        role: response.role,
      };

      // Guardar en localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user.value));

      // Redirigir según el rol
      redirectBasedOnRole(response.role);

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Función de logout
  const logout = () => {
    user.value = null;
    token.value = null;
    if (process.client) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  // Verificar si está autenticado
  const isAuthenticated = () => {
    return !!token.value;
  };

  // Obtener el rol del usuario
  const getUserRole = () => {
    return user.value?.role;
  };

  // Redirigir según el rol
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "DOCENTE":
        router.push("/teacher");
        break;
      case "ESTUDIANTE":
        router.push("/student");
        break;
      default:
        router.push("/");
    }
  };

  // Inicializar el estado de autenticación cuando se use el composable
  if (process.client) {
    initAuth();
  }

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    getUserRole,
  };
};
