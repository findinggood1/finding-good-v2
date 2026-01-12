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
          primary: '#0D7C66',
          'primary-light': '#41B3A2',
          accent: '#BFD641',
          cream: '#FDF6E3',
        },
        fires: {
          feelings: '#E57373',
          influence: '#64B5F6',
          resilience: '#81C784',
          ethics: '#FFD54F',
          strengths: '#BA68C8',
        },
      },
    },
  },
  plugins: [],
}
