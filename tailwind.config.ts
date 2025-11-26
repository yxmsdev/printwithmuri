import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F4008A',
        'primary-hover': '#D1007A',
        dark: '#333333',
        medium: '#666666',
        light: '#F5F5F5',
        success: '#22C55E',
        error: '#EF4444',
        'stroke-grey': '#E5E5E5',
        'text-black': '#1A1A1A',
        'body-grey': '#F9F9F9',
        'text-grey': '#8D8D8D',
        'form-field-grey': '#7A7A7A',
        'nav-line-grey': '#E6E6E6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
