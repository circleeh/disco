/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        midcentury: {
          mustard: '#e1ad01',
          olive: '#808000',
          burntOrange: '#cc5500',
          walnut: '#5c4033',
          cream: '#f5f5dc',
          charcoal: '#36454f',
        },
        retroFuturistic: {
          teal: '#008080',
          silver: '#C0C0C0',
          gold: '#FFD700',
          navy: '#000080',
          maroon: '#800000',
        }
      }
    },
  },
  plugins: [],
}
