/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f8',
          500: '#0e8ce9',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b85',
          900: '#0b3f6f',
          950: '#07284b',
        },
        navy: {
          800: '#0f172a',
          850: '#0d1527',
          900: '#0a0f1d',
          950: '#060a15',
        },
        accent: {
          purple: '#6366f1',
          teal: '#0d9488',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

