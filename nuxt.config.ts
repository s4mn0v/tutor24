// https://nuxt.com/docs/api/configuration/nuxt-config
export default ({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  modules: ['@prisma/nuxt', '@nuxt/ui'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },
  colorMode: {
    preference: 'light'
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
      include: ["vue", "vue-router"],
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
  },
});