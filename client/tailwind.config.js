/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          bg: 'var(--orbit-bg)',
          surface: 'var(--orbit-surface)',
          card: 'var(--orbit-card)',
          border: 'var(--orbit-border)',
          'border-hover': 'var(--orbit-border-hover)',
          text: 'var(--orbit-text)',
          'text-muted': 'var(--orbit-text-muted)',
          accent: 'var(--orbit-accent)',
          'accent-hover': 'var(--orbit-accent-hover)',
          cyan: 'var(--orbit-cyan)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'node-spawn': 'nodeSpawn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'stream-pulse': 'streamPulse 1.5s ease-in-out infinite',
        'cursor-fade': 'cursorFade 0.15s ease-out',
      },
      keyframes: {
        nodeSpawn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(220, 38, 38, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(220, 38, 38, 0.35)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        streamPulse: {
          '0%, 100%': { borderColor: 'rgba(220, 38, 38, 0.3)' },
          '50%': { borderColor: 'rgba(220, 38, 38, 0.7)' },
        },
        cursorFade: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'orbit': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'orbit-lg': '0 8px 40px rgba(0, 0, 0, 0.6)',
        'glow-accent': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
