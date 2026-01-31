/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4fe',
          100: '#dde6fc',
          200: '#c2d4fa',
          300: '#99b8f6',
          400: '#6b92f0',
          500: '#466ee6',
          600: '#3051c9',
          700: '#2740a8',
          800: '#253587',
          900: '#222f6d',
          950: '#171e41',
        },
        accent: {
          500: '#06b6d4', // Cyan for highlights
          600: '#0891b2',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'premium': '0 20px 40px -6px rgba(0, 0, 0, 0.1), 0 12px 20px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}