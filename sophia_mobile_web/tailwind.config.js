/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#30cfd0',
        accent: '#9BE9EA',
        background: '#330867',
        obsidian: '#1a0440',
        gold: '#9BE9EA',
        'gold-soft': '#c8f4f4',
        violet: '#330867',
        cyan: '#30cfd0',
      },
      fontFamily: {
        heading: ['Dark Castle'],
        display: ['Dark Castle'],
        ui: ['Dark Castle'],
        charm: ['Urban Jungle'],
      },
    },
  },
  plugins: [],
};
