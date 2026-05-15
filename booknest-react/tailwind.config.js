/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BookNest brand palette — deep forest + warm parchment + gold
        brand: {
          50:  '#f5f0e8',
          100: '#e8ddc8',
          200: '#d4bb96',
          300: '#bc9460',
          400: '#a67c3d',
          500: '#8b6327',
          600: '#6d4e1f',
          700: '#503a17',
          800: '#35260f',
          900: '#1c1408',
        },
        forest: {
          50:  '#edf4ef',
          100: '#c8dece',
          200: '#96bf9e',
          300: '#5f9d6e',
          400: '#3d7f52',
          500: '#2a6139',
          600: '#1f4d2d',
          700: '#163921',
          800: '#0d2516',
          900: '#06130b',
        },
        parchment: {
          50:  '#fdfaf4',
          100: '#f8f0de',
          200: '#f0e1bc',
          300: '#e6ce96',
          400: '#dab86a',
          500: '#cda043',
        },
        ink: {
          900: '#0f0d0a',
          800: '#1a1714',
          700: '#2c2822',
          600: '#3d3830',
          500: '#55503f',
          300: '#a19f9a',
        },
        sky: {
          50:  '#e0f7ff',
          100: '#b3ebff',
          200: '#80dcff',
          300: '#4dccff',
          400: '#26bbff',
          500: '#00a8e8',
          600: '#0088cc',
          700: '#006699',
          800: '#004d77',
          900: '#003355',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'book': '4px 4px 0px 0px rgba(139,99,39,0.25)',
        'book-hover': '6px 6px 0px 0px rgba(139,99,39,0.4)',
        'card': '0 2px 20px rgba(15,13,10,0.08), 0 1px 4px rgba(15,13,10,0.04)',
        'elevated': '0 8px 40px rgba(15,13,10,0.12), 0 2px 8px rgba(15,13,10,0.06)',
      },
      backgroundImage: {
        // Paper texture removed - use custom CSS if needed
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.8s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};
