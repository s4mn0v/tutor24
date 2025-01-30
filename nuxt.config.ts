import { theme } from "#tailwind-config";
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  features: {
    devLogs: false // Reducir logs en producción
  },
  ssr: false,
  css: ["~/assets/css/main.css"],
  modules: [
    [
      "@prisma/nuxt",
      {
        studio: false, // Desactivar Prisma Studio en desarrollo
      },
    ],
    [
      "@nuxt/ui",
      {
        global: true,
        icons: ["heroicons"],
        safelist: [], // Limitar clases generadas
        prefix: "U", // Mejorar tree-shaking
      },
    ],
    "@nuxtjs/tailwindcss",
  ],
  components: [
    {
      path: "~/components",
      pathPrefix: false, // Mejor organización según docs
      extensions: [".vue"], // Limitar a extensiones necesarias
    },
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
      link: [
        { 
          rel: 'preload', 
          href: '/_nuxt/@nuxt/ui-templates/dist/templates.min.css',
          as: 'style'
        }
      ]
    }
  },
  colorMode: {
    preference: "system",
    fallback: "light",
  },
  // Optimizaciones de vite
  vite: {
    build: {
      cssMinify: "esbuild",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: process.env.NODE_ENV === "production",
        },
        format: {
          comments: false, // Eliminar todos los comentarios
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@google/generative-ai", "jwt-decode"],
    },
    // Layout no jode con esto
    css: {
      preprocessorMaxWorkers: true,
    },
  },
  // Configurar la carga perezosa de imágenes
  experimental: {
    asyncEntry: true, // Habilitar carga async
    componentIslands: true, // Islands architecture
    viewTransition: true,
    renderJsonPayloads: false,
    clientFallback: true,
  },
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
    moduleSideEffects: [], // Mejorar tree-shaking
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
  tailwindcss: {
    configPath: "~/tailwind.config.ts",
    exposeConfig: false, // Desactivar si no se necesita
    viewer: false, // Desactivar en producción
  },
});
