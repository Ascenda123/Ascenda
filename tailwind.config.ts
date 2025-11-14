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
        ink: '#111111',
        charcoal: '#1C1C1C',
        ash: '#666666',
        cloud: '#808080',
        mist: '#F0F8FF',
        powder: '#B3D9F2',
        skyline: '#4FC3F7',
        accentBlue: '#A8D5E3',
        divider: '#E0E0E0',
        hoverGrey: '#F5F5F5'
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
