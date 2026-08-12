/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-base':    'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card':    'var(--bg-card)',
        'bg-hover':   'var(--bg-hover)',
        'b-subtle':   'var(--border-subtle)',
        'b-mid':      'var(--border-mid)',
        'txt-p':      'var(--text-primary)',
        'txt-s':      'var(--text-secondary)',
        'txt-m':      'var(--text-muted)',
        'acc-blue':   'var(--accent-blue)',
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':       'fadeIn 0.2s ease both',
        'typing-blink':  'typing-blink 1s ease-in-out infinite',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};
