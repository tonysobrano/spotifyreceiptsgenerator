/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f5f1e8',
        ink: '#1a1a1a',
        'ink-faded': '#3a3a3a',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
