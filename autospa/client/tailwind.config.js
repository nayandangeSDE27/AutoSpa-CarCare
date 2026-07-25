import animate from 'tailwindcss-animate'

/**
 * Tailwind maps semantic color names to the CSS variables defined in index.css,
 * so both our own components and any shadcn/ui component consume the LOCKED
 * premium-teal palette (never shadcn defaults). Swapping in a dark palette later
 * only means overriding the CSS variables — no config change.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // page + surfaces
        background: 'var(--bg)',
        surface: 'var(--surface)',
        foreground: 'var(--text-primary)',

        // brand
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          deep: 'var(--primary-deep)',
          foreground: 'var(--on-primary)',
        },
        accent: {
          light: 'var(--accent-light)',
          mid: 'var(--accent-mid)',
          header: 'var(--accent-header)',
          DEFAULT: 'var(--accent-light)',
          foreground: 'var(--primary-deep)',
        },

        // text
        content: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },

        // borders
        hairline: 'var(--border-hairline)',
        control: 'var(--border-control)',
        strong: 'var(--border-strong)',
        border: 'var(--border-hairline)',
        input: 'var(--border-control)',
        ring: 'var(--primary)',

        // feedback
        danger: {
          DEFAULT: 'var(--danger)',
          hover: 'var(--danger-hover)',
          foreground: '#ffffff',
        },
        success: 'var(--success)',

        // shadcn compatibility aliases
        card: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--accent-light)',
          foreground: 'var(--text-secondary)',
        },
        secondary: {
          DEFAULT: 'var(--accent-light)',
          foreground: 'var(--primary-deep)',
        },
        destructive: {
          DEFAULT: 'var(--danger)',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        lg: 'var(--radius-card)',
        md: 'var(--radius-control)',
        sm: '6px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      ringColor: {
        DEFAULT: 'var(--primary)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [animate],
}
