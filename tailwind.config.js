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
          50: '#f0f4fe',
          100: '#dd87ee',
          200: '#bfd3fc',
          300: '#93b4fa',
          400: '#608bf5',
          500: '#3b62ee',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e2e6b',
          900: '#1c2854',
          950: '#111733',
        }
      }
    },
  },
  plugins: [],
}
