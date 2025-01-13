// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for login page
  if (to.path === '/login') {
    return
  }

  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  // If no token or user info, redirect to login
  if (!token || !user) {
    return navigateTo('/login')
  }

  const userRole: 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE' = JSON.parse(user).role

  // Define allowed routes per role
  const allowedRoutes: Record<'ADMIN' | 'DOCENTE' | 'ESTUDIANTE', string[]> = {
    ADMIN: ['/admin'],
    DOCENTE: ['/teacher'],
    ESTUDIANTE: ['/student']
  }

  // Check if user has access to the route
  const currentPath = to.path
  if (!allowedRoutes[userRole]?.includes(currentPath)) {
    // Redirect to the default route for their role
    return navigateTo(allowedRoutes[userRole]?.[0] || '/login')
  }
})
