/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Identidade do Mentor: laranja + azul.
        marca: {
          laranja: '#F47A20',
          azul: '#123A66',
          azulClaro: '#1E5A99',
        },
        senso: {
          seiri: '#E4572E',
          seiton: '#2E86AB',
          seiso: '#3FA34D',
          seiketsu: '#6A4C93',
          shitsuke: '#C9A227',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.8)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: { pop: 'pop 0.25s ease-out' },
    },
  },
  plugins: [],
}
