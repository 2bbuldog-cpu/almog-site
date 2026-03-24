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
        heebo: ['Heebo', 'sans-serif'],
        sans: ['Heebo', 'sans-serif'],
      },
      colors: {
        navy: '#0E1E40',
        'navy-mid': '#1B3358',
        'navy-light': '#243E6B',
        gold: '#C9A84C',
        'gold-light': '#E8C96A',
        'gold-pale': '#FDF5E0',
        light: '#F7F9FC',
      },
      borderRadius: {
        DEFAULT: '16px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(14,30,64,0.08)',
        'card-hover': '0 12px 40px rgba(14,30,64,0.16)',
        gold: '0 4px 20px rgba(201,168,76,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease both',
        'slide-up': 'slideUp 0.4s ease both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
