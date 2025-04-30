/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css', // Added styles directory
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class', // Enable dark mode using the "class" strategy
};
