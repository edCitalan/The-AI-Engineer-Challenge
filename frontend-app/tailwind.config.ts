import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fallout: {
          green: '#39FF14',
          'green-glow': '#00FF41',
          black: '#0A0A0A',
          'terminal-black': '#000000',
        },
      },
      fontFamily: {
        'terminal': ['Courier New', 'monospace'],
      },
      textShadow: {
        'fallout': '0 0 8px #39FF14, 0 0 16px #39FF14',
        'fallout-strong': '0 0 12px #39FF14, 0 0 24px #39FF14, 0 0 36px #39FF14',
      },
      boxShadow: {
        'fallout': '0 0 16px #39FF14',
        'fallout-strong': '0 0 24px #39FF14, 0 0 48px #39FF14',
      },
      animation: {
        'flicker': 'flicker 0.15s infinite linear',
        'scanline': 'scanline 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%': { textShadow: '0 0 8px #39FF14, 0 0 16px #39FF14' },
          '100%': { textShadow: '0 0 12px #39FF14, 0 0 24px #39FF14, 0 0 36px #39FF14' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-shadow-fallout': {
          'text-shadow': '0 0 8px #39FF14, 0 0 16px #39FF14',
        },
        '.text-shadow-fallout-strong': {
          'text-shadow': '0 0 12px #39FF14, 0 0 24px #39FF14, 0 0 36px #39FF14',
        },
        '.box-shadow-fallout': {
          'box-shadow': '0 0 16px #39FF14',
        },
        '.box-shadow-fallout-strong': {
          'box-shadow': '0 0 24px #39FF14, 0 0 48px #39FF14',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
export default config; 