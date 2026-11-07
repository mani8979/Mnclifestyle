/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F5F0',
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F7F5F0',
          300: '#EDE9E0',
        },
        beige: {
          DEFAULT: '#EAE3D8',
          100: '#F4EFE6',
          200: '#EAE3D8',
          300: '#DDD3C4',
          400: '#C9BDAA',
        },
        charcoal: {
          DEFAULT: '#252525',
          900: '#181818',
          800: '#252525',
          700: '#383838',
          600: '#4E4E4E',
        },
        warmgrey: {
          DEFAULT: '#77736D',
          light: '#A39F99',
          dark: '#58554F',
        },
        bronze: {
          light: '#C4A77D',
          DEFAULT: '#826039', // 5.48:1 on ivory, 5.93:1 on white (Exceeds WCAG 2.1 AA 4.5:1)
          accent: '#A88962',  // Original luxury bronze for borders, plinths & graphical accents
          dark: '#684C2B',
          hover: '#735530',
        },
        espresso: {
          DEFAULT: '#30251F',
          dark: '#221915',
          light: '#42342C',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.2em',
        widest: '0.15em',
        relaxed: '0.05em',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(37, 37, 37, 0.05)',
        'luxury': '0 12px 35px -5px rgba(37, 37, 37, 0.08)',
        'elevated': '0 20px 45px -10px rgba(48, 37, 31, 0.12)',
      },
    },
  },
  plugins: [],
}
