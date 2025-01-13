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

  // Initialize auth state from localStorage
  const initAuth = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Store auth data
      token.value = response.token;
      user.value = {
        email,
        role: response.role,
      };

      // Save to localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user.value));

      // Redirect based on role
      redirectBasedOnRole(response.role);

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, role: string) => {
    try {
      const response = await $fetch("/api/auth/register", {
        method: "POST",
        body: { email, password, role },
      });
      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Check auth state
  const isAuthenticated = () => {
    return !!token.value;
  };

  // Get user role
  const getUserRole = () => {
    return user.value?.role;
  };

  // Redirect based on role
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

  // Initialize auth state when composable is used
  initAuth();

  return {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    getUserRole,
  };
};
