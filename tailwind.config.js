/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-montserrat)', 'Montserrat', 'Arial', 'sans-serif'],
        'alteryx': ['var(--font-montserrat)', 'Montserrat', 'Arial', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'Montserrat', 'Arial', 'sans-serif'],
        'default': ['var(--font-montserrat)', 'Montserrat', 'Arial', 'sans-serif'],
      },
      colors: {
        'alteryx-blue': '#0066CC',
        'alteryx-dark-blue': '#004499',
        'alteryx-light-blue': '#3399FF',
        'alteryx-gray': '#666666',
        'alteryx-light-gray': '#F5F5F5',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
