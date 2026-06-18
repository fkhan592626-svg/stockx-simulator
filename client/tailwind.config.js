/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#533483',
        },
        green: {
          400: '#00ff88',
          500: '#00cc6a',
        },
        red: {
          400: '#ff4444',
          500: '#cc0000',
        }
      },
    },
  },
  plugins: [],
}