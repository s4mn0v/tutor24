// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Define public routes that don't require authentication
  const publicRoutes = ["/inscribir", "/login"];

  // Allow access to public routes
  if (publicRoutes.includes(to.path)) {
    return;
  }

  // Proceed only in the client side
  if (process.client) {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // If no token or user data, redirect to login
    if (!token || !userData) {
      return await navigateTo("/login");
    }

    let user;
    try {
      // Check if userData is a valid JSON string
      if (
        userData &&
        typeof userData === "string" &&
        userData.startsWith("{") &&
        userData.endsWith("}")
      ) {
        user = JSON.parse(userData);
      } else {
        throw new Error("Invalid user data");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear invalid user data from localStorage
      localStorage.removeItem("user");
      return await navigateTo("/login");
    }

    const userRole = user.role;

    // Define allowed routes based on user roles
    const allowedRoutes: Record<string, string[]> = {
      ADMIN: ["/admin", "/admin/*"],
      DOCENTE: ["/teacher", "/teacher/*"],
      ESTUDIANTE: ["/student", "/student/*"],
    };

    // Check if the current route is allowed for the user's role
    const currentPath = to.path;
    const isAllowed = allowedRoutes[userRole]?.some((allowedRoute) => {
      if (allowedRoute.endsWith("/*")) {
        const baseRoute = allowedRoute.slice(0, -2);
        return currentPath.startsWith(baseRoute);
      }
      return currentPath === allowedRoute;
    });

    // If not allowed, redirect to the default route for the user's role
    if (!isAllowed) {
      const defaultRoutes: Record<string, string> = {
        ADMIN: "/admin",
        DOCENTE: "/teacher",
        ESTUDIANTE: "/student",
      };
      return await navigateTo(defaultRoutes[userRole] || "/login");
    }
  }
});