import { theme } from "#tailwind-config";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  ssr: false,
  css: ["~/assets/css/main.css"],
  modules: [
    "@prisma/nuxt",
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
    },
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  colorMode: {
    preference: "system",
    fallback: "light",
  },
  // Optimizaciones de vite
  vite: {
    build: {
      cssMinify: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: process.env.NODE_ENV === "production",
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@google/generative-ai"],
    },
    // Layout no jode con esto
    css: {
      preprocessorMaxWorkers: true,
    },
  },
  // Configurar la carga perezosa de imágenes
  experimental: {
    viewTransition: true,
    renderJsonPayloads: false,
    clientFallback: true,
  },
  nitro: {
    compressPublicAssets: true,
    minify: true,
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "*",
        },
      },
    },
  },
  // Añadir configuración de TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },
  // Configuración adicional para Gemini
  build: {
    transpile: ["@google/generative-ai", "cookie"],
  },
});
