/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme backgrounds - exact colors requested
        'dark': {
          950: '#0f0f10', // Primary dark background
          900: '#121212', // Secondary dark background
          800: '#1a1a1a', // Card backgrounds
          700: '#2a2a2a', // Lighter elements
          600: '#3a3a3a', // Borders/dividers
          500: '#4a4a4a', // Text secondary
        },
        // Custom gray shades
        'gray': {
          750: '#374151', // Custom gray shade for elevated elements
          850: '#1f2937', // Custom gray shade for chat background
        },
        // Wine accent colors - exact shades requested
        'wine': {
          800: '#7b1e2b', // Primary wine accent
          700: '#8b1e3a', // Secondary wine accent
          600: '#9a2e4a', // Lighter wine
          500: '#a93e5a', // Hover states
          400: '#b84e6a', // Light wine
        },
      },
      backgroundImage: {
        // Dark login background
        'dark-gradient': 'linear-gradient(135deg, #0f0f10 0%, #121212 100%)',
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'wine-ring': '0 0 0 2px rgba(123, 30, 43, 0.3)',
        'red-ring': '0 0 0 2px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}