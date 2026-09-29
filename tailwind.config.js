/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#152033',
          950: '#090d16',
        },
        indigo: {
          550: '#5c52e5',
        },
        emerald: {
          450: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.5)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.5)',
      }
    },
  },
  plugins: [],
}
