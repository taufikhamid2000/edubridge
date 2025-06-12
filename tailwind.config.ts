import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enables dark mode using a class
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        headerBg: 'var(--header-bg)',
        primaryText: 'var(--primary-text)',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      height: {
        'screen-90': '90vh',
        'screen-80': '80vh',
      },
      width: {
        'screen-90': '90vw',
        'screen-80': '80vw',
      },
      fontSize: {
        xxs: '0.625rem',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-90': '90vh',
      },
    },
  },
  plugins: [],
};

export default config;
