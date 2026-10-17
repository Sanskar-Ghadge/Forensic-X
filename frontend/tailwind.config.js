/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--bg-void)',
        console: 'var(--bg-console)',
        raised: 'var(--bg-raised)',
        edge: 'var(--edge)',
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          faint: 'var(--ink-faint)',
        },
        scan: {
          DEFAULT: 'var(--scan)',
          glow: 'rgba(34, 211, 238, 0.25)',
        },
        verified: {
          DEFAULT: 'var(--verified)',
          glow: 'rgba(52, 211, 153, 0.25)',
        },
        recovered: {
          DEFAULT: 'var(--recovered)',
          glow: 'rgba(167, 139, 250, 0.25)',
        },
        estimated: {
          DEFAULT: 'var(--estimated)',
          glow: 'rgba(251, 191, 36, 0.25)',
        },
        gap: {
          DEFAULT: 'var(--gap)',
          glow: 'rgba(251, 113, 133, 0.25)',
        },
        lead: {
          DEFAULT: 'var(--lead)',
          glow: 'rgba(96, 165, 250, 0.25)',
        },
        'on-accent': 'var(--on-accent)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        control: 'var(--radius-sm)',
        card: 'var(--radius-md)',
        panel: 'var(--radius-lg)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      transitionTimingFunction: {
        'forensic-out': 'var(--ease-out)',
        'forensic-in-out': 'var(--ease-in-out)',
      },
    },
  },
  plugins: [],
}
