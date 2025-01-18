export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        nuxtApp.provide('user', user);
      }
    }
  });