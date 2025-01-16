// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === "/login") {
    return;
  }

  if (process.client) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return navigateTo("/login");
    }

    const userRole: "ADMIN" | "DOCENTE" | "ESTUDIANTE" = JSON.parse(user).role;

    const allowedRoutes: Record<"ADMIN" | "DOCENTE" | "ESTUDIANTE", string[]> = {
      ADMIN: ["/admin", "/admin/*"],
      DOCENTE: ["/teacher", "/teacher/*"],
      ESTUDIANTE: ["/student", "/student/*"],
    };

    const currentPath = to.path;
    const isAllowed = allowedRoutes[userRole]?.some(allowedRoute => {
      if (allowedRoute.endsWith('/*')) {
        const baseRoute = allowedRoute.slice(0, -2);
        return currentPath.startsWith(baseRoute);
      }
      return currentPath === allowedRoute;
    });

    if (!isAllowed) {
      return navigateTo(allowedRoutes[userRole]?.[0] || "/login");
    }
  } else {
    return;
  }
});