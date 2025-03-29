/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'discord-blue': '#5865F2',
        'discord-dark': '#36393F',
        'discord-darker': '#2F3136',
        'discord-darkest': '#202225',
      },
      keyframes: {
        'slide-in-right': {
          'from': { right: '-20rem' },
          'to': { right: '1rem' }
        },
        bxSpin: {
          '17%': { borderBottomRightRadius: '3px' },
          '25%': { transform: 'translateY(9px) rotate(22.5deg)' },
          '50%': { transform: 'translateY(18px) scale(1, .9) rotate(45deg)', borderBottomRightRadius: '40px' },
          '75%': { transform: 'translateY(9px) rotate(67.5deg)' },
          '100%': { transform: 'translateY(0) rotate(90deg)' }
        },
        shadow: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '50%': { transform: 'scale(1.2, 1)' }
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'bxSpin': 'bxSpin 0.5s linear infinite',
        'shadow': 'shadow 0.5s linear infinite'
      }
    },
  },
  plugins: [],
} 