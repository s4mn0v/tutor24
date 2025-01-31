export default defineAppConfig({
  ui: {
    strategy: "override", // Sobrescribe la configuración por defecto
    card: {
      background: "bg-zinc-100 dark:bg-zinc-900",
    },
    input: {
      background: "bg-zinc-100 dark:bg-zinc-900",
      color: {
        white: {
          outline:
            "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
        },
        gray: {
          outline:
            "shadow-sm bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400",
        },
      },
    },
    textarea: {
      background: "bg-zinc-100 dark:bg-zinc-900", // Fondo del textarea
      color: {
        white: {
          outline:
            "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white ring-0 ring-inset ring-transparent focus:ring-0 focus:ring-transparent", // Elimina el outline y el ring
        },
        gray: {
          outline:
            "shadow-sm bg-zinc-50 dark:bg-zinc-800 text-gray-900 dark:text-white ring-0 ring-inset ring-transparent focus:ring-0 focus:ring-transparent", // Elimina el outline y el ring
        },
      },
    },
    dropdown: {
      background: 'bg-white dark:bg-zinc-900',
      ring: 'ring-0 ring-gray-200 dark:ring-gray-700',
    },
    table: {
      tbody:
        "divide-y divide-zinc-200 dark:divide-gray-800 dark:bg-zinc-900 rounded-lg",
      th: {
        color: "text-gray-900 dark:text-white", // Color del texto en las celdas de encabezado
        background: "bg-zinc-900 dark:bg-zinc-900", // Fondo de las celdas de encabezado
      },
      td: {
        color: "text-zinc-900 dark:text-white", // Color del texto en las celdas de datos
        background: "bg-zinc-900 dark:bg-zinc-900", // Fondo de las celdas de datos
      },
      tr: {
        hover: "hover:bg-zinc-900 dark:hover:bg-zinc-900", // Fondo al pasar el ratón sobre una fila
      },
      divide: "divide-red-200 dark:divide-red-700", // Color de las líneas divisorias entre filas
    },
  },
});
