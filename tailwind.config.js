// tailwind.config.js
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
          sans: ['var(--font-poppins)'],
          mono: ['var(--font-mono)'],
        },
        borderRadius: {
          '4xl': '2rem', // 32px
        },
      },
    },
    plugins: [],
  }