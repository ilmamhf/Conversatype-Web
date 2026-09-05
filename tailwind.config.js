/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fbf0',
          100: '#e3f7df',
          400: '#79dc38',
          500: '#58cc02', // Duolingo iconic green
          600: '#46a302',
          700: '#378002',
        },
        monkey: {
          bg: '#323437',
          main: '#e2b714',
          caret: '#e2b714',
          sub: '#646669',
          text: '#d1d0c5',
          error: '#ca4754',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace', 'Courier New'],
      },
      boxShadow: {
        'tactile': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'tactile-brand': '0 4px 0 0 #46a302',
        'tactile-slate': '0 4px 0 0 #334155',
        'tactile-amber': '0 4px 0 0 #b45309',
      }
    },
  },
  plugins: [],
};
