/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B88E2F',
        'primary-light': '#DCB97A',
        'bg-cream': '#FFF3E3',
        'bg-light': '#F9F1E7',
        'text-dark': '#3A3A3A',
        'text-gray': '#898989',
        'text-light': '#9F9F9F',
        'border-light': '#D9D9D9',
        'badge-new': '#2EC1AC',
        'badge-sale': '#E97171',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

