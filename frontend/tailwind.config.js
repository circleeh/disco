/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-50': '#f0f9ff',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
        'primary-700': '#1d4ed8',
        'midcentury-mustard': '#e1ad01',
        'midcentury-olive': '#808000',
        'midcentury-burntOrange': '#cc5500',
        'midcentury-walnut': '#5c4033',
        'midcentury-cream': '#f5f5dc',
        'midcentury-charcoal': '#36454f',
        'retroFuturistic-teal': '#008080',
        'retroFuturistic-silver': '#C0C0C0',
        'retroFuturistic-gold': '#FFD700',
        'retroFuturistic-navy': '#000080',
        'retroFuturistic-maroon': '#800000',
      }
    },
  },
  plugins: [],
}
