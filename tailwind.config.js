/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './_includes/**/*.{html,js}',
    './_layouts/**/*.{html,js}',
    './_posts/**/*.{md,html}',
    './_recursos/**/*.{html,js}',
    './_proyecto/**/*.{html,js}',
    './_comunidad/**/*.{html,js}',
    './_contacto/**/*.{html,js}',
    './_multimedia/**/*.{html,js}',
    './blog/**/*.{html,md}',
    './assets/js/**/*.js',
    './*.{html,md}'
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
};
