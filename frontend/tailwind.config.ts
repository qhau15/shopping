import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory:   '#F8F6F1',
        champagne: '#C4A862',
        'warm-black': '#0A0A0A',
        'warm-gray': {
          50:  '#FAFAF7',
          100: '#F5F4F0',
          200: '#E8E6E1',
          300: '#D4D2CC',
          400: '#9E9B94',
          600: '#6B6860',
          900: '#1A1916',
        },
      },
      fontFamily: {
        serif: ['var(--font-main)', 'Be Vietnam Pro', 'sans-serif'],
        sans:  ['var(--font-main)', 'Be Vietnam Pro', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.3em',
        'ultra-wide': '0.4em',
      },
    },
  },
  plugins: [],
}

export default config
