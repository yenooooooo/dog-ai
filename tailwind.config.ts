import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mw: {
          green: {
            50: '#F0F7F1',
            100: '#D6EBDA',
            200: '#A8D5B0',
            300: '#6BBF7B',
            400: '#3DA854',
            500: '#2D8A42',
            600: '#246E35',
            700: '#1B5228',
            800: '#133A1C',
            900: '#0A2110',
          },
          gray: {
            0: '#FFFFFF',
            50: '#FAFAF7',
            100: '#F3F2EE',
            200: '#E5E3DD',
            300: '#C9C6BD',
            400: '#A09D94',
            500: '#787571',
            600: '#5C5955',
            700: '#3D3B38',
            800: '#252422',
            900: '#1A1917',
          },
          amber: {
            400: '#FBBF24',
            500: '#F59E0B',
          },
          danger: '#DC4A3F',
          warning: '#E8973E',
          info: '#4A90D9',
        },
      },
      borderRadius: {
        mw: '14px',
        'mw-sm': '10px',
        'mw-lg': '16px',
        'mw-xl': '24px',
      },
      animation: {
        'sheet-up': 'sheetUp 400ms cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s ease infinite',
      },
      keyframes: {
        sheetUp: {
          '0%': { transform: 'translateY(100%)' },
          '70%': { transform: 'translateY(-2%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        gentlePulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(45, 138, 66, 0.2)' },
          '50%': { boxShadow: '0 0 0 8px rgba(45, 138, 66, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
