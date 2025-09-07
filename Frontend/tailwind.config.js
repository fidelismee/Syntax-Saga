/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#AF803C',
          50: '#faf6f0',
          100: '#f4ebdc',
          200: '#e8d4b8',
          300: '#d9b78b',
          400: '#c99761',
          500: '#AF803C',
          600: '#9a6a2f',
          700: '#7d5427',
          800: '#644222',
          900: '#51351d',
        },
        dark: {
          100: '#2E2E2E',
          200: '#242424',
          300: '#1A1A1A',
          400: '#111111',
          500: '#0A0A0A',
        }
      },
      fontFamily: {
        'aboreto': ['Aboreto', 'cursive'],
      },
      animation: {
        'glow': 'glow 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            'text-shadow': '0 0 4px #AF803C, 0 0 8px #AF803C',
            opacity: '0.3'
          },
          '50%': {
            'text-shadow': '0 0 10px #AF803C, 0 0 15px #AF803C',
            opacity: '0.6'
          }
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          to: {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      }
    },
  },
  plugins: [],
}
