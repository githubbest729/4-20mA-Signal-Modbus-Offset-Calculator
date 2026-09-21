/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Industrial HMI-inspired palette. Named for the fixtures they
        // evoke on a control-room panel, not generic "primary/secondary".
        panel: {
          DEFAULT: '#0D1117', // main screen background
          raised: '#141A21',  // card / module background
          inset: '#0A0E13',   // recessed field background
          border: '#232B34',
        },
        amber: {
          DEFAULT: '#F0A020', // analog gauge needle / warning LED
          dim: '#8A5D18',
          glow: '#FFC15E',
        },
        trace: {
          DEFAULT: '#39D2C0', // oscilloscope / live-signal teal
          dim: '#1E7A70',
        },
        alarm: '#F0563D',
        ok: '#4CD97B',
        ink: {
          DEFAULT: '#E6EDF3',
          muted: '#8B96A3',
          faint: '#586572',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        inset: 'inset 0 1px 3px rgba(0,0,0,0.55)',
        panel: '0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.35)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
      },
      animation: {
        blink: 'blink 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
