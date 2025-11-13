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
        night: '#040711',
        iris: '#5C6EFF',
        cyan: '#4EE0D2',
        sunrise: '#FF67D7',
        sand: '#FFE5C8'
      },
      backgroundImage: {
        'orb-gradient': 'radial-gradient(circle at 20% 20%, rgba(92,110,255,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,103,215,0.25), transparent 40%)',
        'mesh-gradient':
          'linear-gradient(120deg, rgba(5,8,22,0.95), rgba(6,10,28,0.95)), radial-gradient(circle at 10% 20%, rgba(92,110,255,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,103,215,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(78,224,210,0.2), transparent 35%)'
      },
      boxShadow: {
        'glow-lg': '0 20px 80px rgba(92, 110, 255, 0.35)',
        'glow-sm': '0 10px 40px rgba(78, 224, 210, 0.25)'
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'sans-serif'],
        display: ['var(--font-space)', 'Space Grotesk', 'sans-serif']
      },
      borderRadius: {
        '4xl': '2.5rem'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
