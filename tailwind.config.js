/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "hsl(0, 0%, 100%)", // pure white
          secondary: "hsl(210, 20%, 96%)", // soft gray background for sections
          dark: "hsl(224, 47%, 11%)",
          'dark-secondary': "hsla(221, 48%, 9%, 1.00)",
        },
        text: {
          DEFAULT: "hsl(222, 20%, 15%)", // much darker for contrast
          secondary: "hsl(222, 10%, 40%)",
          dark: "hsl(210, 20%, 98%)",
          'dark-secondary': "hsl(210, 15%, 70%)",
        },
        border: {
          DEFAULT: "hsl(210, 20%, 85%)",
          dark: "hsl(222, 47%, 25%)",
        },
        special: {
          DEFAULT: "hsl(187, 100%, 42%)",
          hover: "hsl(187, 100%, 35%)",
          light: "hsl(187, 80%, 55%)",
          dark: "hsl(187, 100%, 42%)",
        },
        // Additional colors for the design
        slate: {
          400: "hsl(215, 20%, 65%)",
          600: "hsl(215, 25%, 27%)",
          700: "hsl(217, 33%, 17%)",
          800: "hsl(222, 47%, 11%)",
          900: "hsl(222, 47%, 11%)",
        },
        cyan: {
          400: "hsl(187, 80%, 55%)",
          500: "hsl(187, 100%, 42%)",
        },
        blue: {
          500: "hsl(217, 91%, 60%)",
          600: "hsl(217, 91%, 50%)",
        },
        green: {
          400: "hsl(142, 76%, 36%)",
          500: "hsl(142, 76%, 36%)",
        },
        yellow: {
          400: "hsl(45, 93%, 47%)",
          500: "hsl(45, 93%, 47%)",
        },
        red: {
          400: "hsl(0, 84%, 60%)",
          500: "hsl(0, 84%, 60%)",
        },
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, hsl(210, 20%, 98%) 0%, hsl(210, 20%, 92%) 100%)',
        'gradient-dark': 'linear-gradient(135deg, hsl(222, 47%, 11%) 0%, hsl(222, 47%, 15%) 100%)',
      }
    },
  },
  plugins: [],
}