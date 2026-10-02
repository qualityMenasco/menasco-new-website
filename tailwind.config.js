/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MENASCO blue — primary accent, used with restraint. 500 preserves the
        // exact brand hex (#1cb7f0) for decorative/large-scale use; 600 is
        // tuned a shade darker so button/link text clears WCAG AA (4.5:1)
        // against white and warmwhite.
        brand: {
          50: '#eef9ff',
          100: '#d9f2fe',
          200: '#b3e6fd',
          300: '#7ad4fb',
          400: '#3dc0f5',
          500: '#1cb7f0',
          600: '#0c76a3',
          700: '#0a5f86',
          800: '#0c4d6c',
          900: '#0e3f58',
          950: '#082735',
        },
        // Dark surfaces
        ink: '#0a0b0d', // near-black — deepest surface / primary text on light
        charcoal: '#15181c', // deep charcoal — primary dark section background
        graphite: '#1f2328', // secondary dark surface — cards/panels on dark bg
        slatealt: '#1b1f24', // tertiary dark surface — subtle differentiation
        // Light surfaces
        warmwhite: '#faf8f4', // warm white — primary light background
        stone: '#f3efe8', // secondary light surface
        // Muted sand / metallic accent
        sand: {
          50: '#f8f4ec',
          100: '#efe7d5',
          200: '#e2d3b3',
          300: '#cdb98d',
          400: '#b39c6c',
          500: '#96805a',
          600: '#7a6848',
        },
        // Neutral gray scale
        gray: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#dcdde0',
          300: '#c1c3c8',
          400: '#9a9da4',
          500: '#75787f',
          600: '#585b62',
          700: '#404349',
          800: '#292b30',
          900: '#1a1c1f',
        },
        // Status colors
        success: { DEFAULT: '#1f7a4b', subtle: '#e6f3ec' },
        warning: { DEFAULT: '#b56b16', subtle: '#faf0e2' },
        error: { DEFAULT: '#b33a3a', subtle: '#f8e9e9' },
        info: { DEFAULT: '#355d8a', subtle: '#e8eef4' },
      },
      fontFamily: {
        sans: ['Inter', '"IBM Plex Sans Arabic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"IBM Plex Sans Arabic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.75rem, 2.1rem + 2.6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1: ['clamp(2.25rem, 1.85rem + 1.6vw, 3.375rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.75rem, 1.5rem + 1vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h3: ['clamp(1.375rem, 1.2rem + 0.7vw, 1.875rem)', { lineHeight: '1.25', letterSpacing: '-0.005em' }],
        h4: ['clamp(1.125rem, 1.05rem + 0.3vw, 1.375rem)', { lineHeight: '1.3', letterSpacing: '0' }],
        'body-lg': ['1.1875rem', { lineHeight: '1.65' }],
        body: ['1rem', { lineHeight: '1.65' }],
        small: ['0.875rem', { lineHeight: '1.55' }],
        caption: ['0.75rem', { lineHeight: '1.45' }],
        eyebrow: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.14em' }],
        stat: ['clamp(2.25rem, 1.9rem + 1.4vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.01em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        narrow: '48rem',
        container: '80rem',
        wide: '90rem',
      },
      borderRadius: {
        xs: '0.1875rem',
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl2: '1.25rem',
        xl3: '1.5rem',
      },
      boxShadow: {
        soft: '0 10px 40px rgba(10, 11, 13, 0.08)',
        strong: '0 20px 60px rgba(10, 11, 13, 0.14)',
        edge: 'inset 0 0 0 1px rgba(10, 11, 13, 0.08)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        engineered: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      screens: {
        // 360px (not desktop's old 480px) — matches the mobile experience's
        // original design-token value from shared/tailwind-theme.js, which
        // this config has absorbed now that there's one Tailwind build for
        // both. Desktop had exactly one `xs:` usage (Stack.tsx's `xs:gap-2`,
        // a minor spacing tweak) so this is safe for desktop; mobile relies
        // on it functionally (MobileHeader, ServicesPage/Manufacturing grid
        // columns) so it needs to keep its real, narrower value.
        xs: '360px',
      },
    },
  },
  plugins: [],
};
