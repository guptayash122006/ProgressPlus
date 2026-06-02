/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0eeff',
          100: '#e3dcff',
          200: '#cbbdff',
          300: '#aa91ff',
          400: '#8a5cff',
          500: '#7c5cfc',
          600: '#6b3df7',
          700: '#5c2be3',
          800: '#4b22bf',
          900: '#3e1d9c',
        },
        surface: {
          50:  '#f8f9ff',
          100: '#eef0ff',
          800: '#1c1f3a',
          850: '#161830',
          900: '#111224',
          950: '#0a0b14',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c5cfc, #a855f7)',
        'green-gradient': 'linear-gradient(135deg, #16a34a, #22c55e)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(124,92,252,0.15)',
        'glow-lg': '0 0 60px rgba(124,92,252,0.25)',
        'card': '0 4px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease',
        'fade-in': 'fadeIn 0.3s ease',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
