/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8'
        }
      },
      boxShadow: { card: '0 4px 20px -8px rgba(0,0,0,0.15)' }
    }
  },
  plugins: []
};
