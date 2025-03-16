export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  features: {
    devLogs: false, // Reducir logs en producción
  },
  ssr: false,
  css: ["~/assets/css/main.css"],
  modules: [
    [
      "@prisma/nuxt",
      {
        studio: false, // Desactivar Prisma Studio en desarrollo
        client: {
          // Configuración optimizada
          autoRegister: false,
          prismaPath: "node_modules/.prisma/client",
        },
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
    jwtSecret: process.env.JWT_SECRET,
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "preload",
          href: "/_nuxt/@nuxt/ui-templates/dist/templates.min.css",
          as: "style",
        },
      ],
    },
  },
  colorMode: {
    preference: "system",
    fallback: "light",
  },
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
    build: {
      cssMinify: "esbuild",
      minify: "terser",
      terserOptions: {
        format: {
          comments: false, // Eliminar todos los comentarios
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "pinia", "supabase"],
            prisma: ["@prisma/client"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@google/generative-ai", "jwt-decode"],
    },
    css: {
      preprocessorMaxWorkers: true,
    },
  },
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
      "/api/": {
        cors: true,
        headers: {
          "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers": "*",
        },
      },
      "/api/news": { swr: 1800 },
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  build: {
    transpile: ["@google/generative-ai", "cookie"],
  },
  tailwindcss: {
    configPath: "~/tailwind.config.ts",
    exposeConfig: false, // Desactivar si no se necesita
    viewer: false, // Desactivar en producción
  },
});
