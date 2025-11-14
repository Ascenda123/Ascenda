import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        slateInk: '#0f172a',
        slateMist: '#f8fafc',
        slateLine: '#e2e8f0'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif'
        ]
      },
      boxShadow: {
        'surface-sm': '0 12px 40px rgba(15, 23, 42, 0.08)',
        'surface-lg': '0 25px 80px rgba(15, 23, 42, 0.12)'
      },
      borderRadius: {
        '4xl': '2.25rem'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
