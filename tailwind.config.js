/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Alexandria', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2dae3',
          300: '#b9c5d3',
          400: '#8494aa',
          500: '#506682',
          600: '#112D4F',
          700: '#0f2847',
          800: '#0d223b',
          900: '#0b1c30',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#FCB900',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
    },
  },
  plugins: [],
};
