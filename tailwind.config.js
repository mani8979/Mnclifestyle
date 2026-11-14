/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MNC LifeStyle Exact Palette
        'espresso-dark': '#211710',
        'warm-brown': '#49301F',
        'champagne-gold': {
          DEFAULT: '#D69A4B',
          light: '#E2AC65',
          dark: '#B87E34',
        },
        'light-cream': '#F8F0E8',
        'warm-beige': '#E9D8C5',
        'primary-text': '#211A15',

        ivory: {
          DEFAULT: '#F8F0E8',
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F8F0E8',
          300: '#E9D8C5',
        },
        beige: {
          DEFAULT: '#E9D8C5',
          100: '#F8F0E8',
          200: '#EAE3D8',
          300: '#DDD3C4',
          400: '#C9BDAA',
        },
        charcoal: {
          DEFAULT: '#211A15',
          900: '#18110B',
          800: '#211A15',
          700: '#38302A',
          600: '#4E443C',
        },
        warmgrey: {
          DEFAULT: '#77736D',
          light: '#A39F99',
          dark: '#58554F',
        },
        bronze: {
          light: '#D69A4B',
          DEFAULT: '#D69A4B', // Champagne Gold
          accent: '#D69A4B',
          dark: '#B87E34',
          hover: '#C2873B',
        },
        espresso: {
          DEFAULT: '#211710',
          dark: '#18110B',
          light: '#49301F',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
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
