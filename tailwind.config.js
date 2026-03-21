/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        primary:  ['var(--font-primary)', 'Georgia', 'serif'],
        mono:     ['var(--font-mono)', 'Fira Code', 'monospace'],
        display:  ['var(--font-primary)', 'Georgia', 'serif'],
        body:     ['var(--font-primary)', 'Georgia', 'serif'],
      },
      colors: {
        // ── The Meat Up CSS-var tokens ──────────────────────────────────────
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          subtle:  'var(--accent-subtle)',
          border:  'var(--accent-border)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          subtle:  'var(--gold-subtle)',
          border:  'var(--gold-border)',
        },
        // Semantic
        success: {
          DEFAULT: 'var(--success)',
          subtle:  'var(--success-subtle)',
          border:  'var(--success-border)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle:  'var(--warning-subtle)',
          border:  'var(--warning-border)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          subtle:  'var(--danger-subtle)',
          border:  'var(--danger-border)',
        },
        info: {
          DEFAULT: 'var(--info)',
          subtle:  'var(--info-subtle)',
          border:  'var(--info-border)',
        },
        // Backgrounds
        bg: {
          base:    'var(--bg-base)',
          surface: 'var(--bg-surface)',
          subtle:  'var(--bg-subtle)',
          overlay: 'var(--bg-overlay)',
        },
        // Text
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          inverse:   'var(--text-inverse)',
        },
        // Borders
        border: {
          DEFAULT: 'var(--border-default)',
          strong:  'var(--border-strong)',
          subtle:  'var(--border-subtle)',
        },
        // The Meat Up brand direct values
        meatup: {
          red:    '#8B1A1A',
          gold:   '#D4A017',
          dark:   '#0F0F0F',
          surface:'#1A1A1A',
          warm:   '#F5F0EB',
        },
        // Legacy compat — keeps existing component code working
        surface: {
          DEFAULT: 'var(--bg-surface)',
          soft:    'var(--bg-base)',
          muted:   'var(--bg-subtle)',
        },
        sidebar: {
          DEFAULT: 'var(--bg-surface)',
          hover:   'var(--bg-subtle)',
          active:  'var(--accent-subtle)',
          border:  'var(--border-subtle)',
        },
        brand: {
          50:  'var(--accent-subtle)',
          100: '#3A1515',
          200: '#5A1818',
          300: '#7A1A1A',
          400: '#8B1A1A',
          500: '#A01E1E',
          600: 'var(--accent)',
          700: 'var(--accent-hover)',
          800: '#6B1212',
          900: '#4A0C0C',
        },
      },
      boxShadow: {
        xs:    'var(--shadow-xs)',
        sm:    'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        card:  'var(--shadow-xs)',
        panel: 'var(--shadow-sm)',
        lift:  'var(--shadow-md)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
        '2xl': '14px',
      },
      animation: {
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-up':       'fadeUp 0.2s ease-out',
        'pulse-soft':    'pulseSoft 2s ease-in-out infinite',
        'skeleton':      'skeletonPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideInLeft: {
          '0%':   { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
