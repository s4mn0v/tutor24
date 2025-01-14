// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware for login page
  if (to.path === "/login") {
    return;
  }

  // Check if we're on the client-side
  if (process.client) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // If no token or user info, redirect to login
    if (!token || !user) {
      return navigateTo("/login");
    }

    const userRole: "ADMIN" | "DOCENTE" | "ESTUDIANTE" = JSON.parse(user).role;

    // Define allowed routes per role
    const allowedRoutes: Record<"ADMIN" | "DOCENTE" | "ESTUDIANTE", string[]> =
      {
        ADMIN: ["/admin"],
        DOCENTE: ["/teacher"],
        ESTUDIANTE: ["/student"],
      };

    // Check if user has access to the route
    const currentPath = to.path;
    if (!allowedRoutes[userRole]?.includes(currentPath)) {
      // Redirect to the default route for their role
      return navigateTo(allowedRoutes[userRole]?.[0] || "/login");
    }
  } else {
    // Server-side: we can't check auth state, so we'll allow the navigation
    // and let the client-side handle the auth check
    return;
  }
});
