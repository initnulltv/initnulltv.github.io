/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/**/*.{md,html}',
    './**/*.html',
    './assets/js/**/*.js'
  ],
  safelist: [
    { pattern: /^(text|bg|border|ring)-/ },
    'text-turquesa','text-morado-neon','text-verde-neon','text-gris-claro'
  ],
  theme: {
    extend: {
      colors: {
        'turquesa': 'var(--color-turquesa)',
        'negro-profundo': 'var(--color-negro-profundo)',
        'morado-neon': 'var(--color-morado-neon)',
        'verde-neon': 'var(--color-verde-neon)',
        'gris-claro': 'var(--color-gris-claro)'
      }
    }
  },
  plugins: []
}
