// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Estructura típica de Jekyll/GitHub Pages
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/**/*.html",
    "./assets/js/**/*.js",
    "./assets/css/**/*.css",
    "./blog/**/*.html",
    "./comunidad/**/*.html",
    "./contacto/**/*.html",
    "./proyecto/**/*.html",
    "./recursos/**/*.html",
    "./servicios/**/*.html",
    "./*.html",
  ],

  // ✅ Evita que Tailwind elimine clases dinámicas o generadas por JS
  safelist: [
    'status-completed',
    'bg-verde-neon/20',
    'text-verde-neon',
    'dark:text-negro-profundo',
    'px-3',
    'py-1',
    'text-xs',
    'font-semibold',
    'rounded-full',
    'transition-all',
    'duration-500',
  ],

  theme: {
    extend: {
      // 🎨 Paleta de colores personalizada de InitNullTV
      colors: {
        'turquesa': 'var(--color-turquesa)',
        'negro-profundo': 'var(--color-negro-profundo)',
        'morado-neon': 'var(--color-morado-neon)',
        'verde-neon': 'var(--color-verde-neon)',
        'gris-claro': 'var(--color-gris-claro)',
        'fondo-claro': 'var(--color-fondo-claro)',
        'fondo-oscuro-suave': 'var(--color-fondo-oscuro-suave)',
        'texto-principal': 'var(--color-texto-principal)',
      },

      // 🔤 Fuentes oficiales
      fontFamily: {
        'base': ['var(--font-base)', 'sans-serif'],       // Roboto
        'titulos': ['var(--font-titulos)', 'sans-serif'], // Orbitron
        'subtitulo': ['var(--font-subtitulo)', 'sans-serif'], // Montserrat
        'code': ['var(--font-code)', 'monospace'],        // Fira Code / Roboto Mono
      },

      // ⚡ Transiciones y animaciones suaves para estados dinámicos
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
      },
    },
  },

  // 🔌 Plugins opcionales: puedes añadir según necesidad
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
