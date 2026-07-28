/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050308',
        gold: '#c9a44c',
        'gold-soft': '#e8cf8a',
        violet: '#7b2fff',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        display: ['"Orbitron"', '"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
