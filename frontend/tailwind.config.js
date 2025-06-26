/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 2s linear infinite',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'opacity': 'opacity',
        'transform': 'transform',
      },
      transitionDuration: {
        '300': '300ms',
        '500': '500ms',
      },
      zIndex: {
        '60': '60',
      }
    },
  },
  plugins: [],
}
