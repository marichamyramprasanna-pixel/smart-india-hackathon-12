/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          glow: 'var(--primary-glow)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Cybersecurity Specific Palette
        cyber: {
          950: '#030712',
          900: '#070B14',
          850: '#0B132B',
          800: '#0F1B3C',
          700: '#1A2954',
          600: '#283E7A',
          cyan: '#00F0FF',
          blue: '#38BDF8',
          purple: '#A855F7',
          violet: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          red: '#EF4444',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'cyan-glow-sm': '0 0 10px -2px rgba(0, 240, 255, 0.25)',
        'red-glow': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'red-glow-sm': '0 0 10px -2px rgba(239, 68, 68, 0.3)',
        'purple-glow': '0 0 20px -3px rgba(168, 85, 247, 0.4)',
        'amber-glow': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'emerald-glow': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'cyber-grid': 'radial-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px)',
        'cyber-grid-dense': 'radial-gradient(rgba(0, 240, 255, 0.12) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid-24': '24px 24px',
        'grid-16': '16px 16px',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-radar': 'pulse-radar 2.5s ease-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'threat-ping': 'threat-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.99)' },
        },
        'pulse-radar': {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'threat-ping': {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
