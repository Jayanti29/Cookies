/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        foreground: '#1A1A1A',
        accent: {
          DEFAULT: '#C8860A',
          light: '#FDF3DC',
        },
        safe: '#16A34A',
        info: '#2563EB',
        review: '#CA8A04',
        concerns: '#EA580C',
        high: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
