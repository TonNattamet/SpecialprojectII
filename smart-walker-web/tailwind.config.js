/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ตรวจสอบว่ามีแล้ว
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        },
      },
      animation: {
        scan: 'scan 3s linear infinite',
        flicker: 'flicker 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out forwards',
      },
      colors: {
        'sci-fi': '#00f0ff',
      },
      dropShadow: {
        'neon': ['0 0 5px #0ff', '0 0 10px #0ff'],
      },
    },
  },
  plugins: [],
};
