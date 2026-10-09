/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        race: {
          bg: '#0f172a',
          card: '#1e293b',
          accent: '#38bdf8',
          track: '#334155',
          gold: '#fbbf24',
          silver: '#94a3b8',
          bronze: '#d97706',
          correct: '#22c55e',
          wrong: '#ef4444',
          pending: '#64748b'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.8s infinite',
      }
    },
  },
  plugins: [],
}
