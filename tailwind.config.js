/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c2d4ff',
          300: '#96b3ff',
          400: '#6b8cff',
          500: '#4a6cf7',
          600: '#3451e8',
          700: '#2a3fcc',
          800: '#2535a6',
          900: '#233084',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(74, 108, 247, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(74, 108, 247, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(74, 108, 247, 0)' },
        },
      }
    },
  },
  plugins: [],
}
