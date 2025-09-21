/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Uses .dark class on <html> or <body>
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "hsl(0, 5%, 95%)",    // light mode background (lighter)
          secondary: "hsl(0, 5%, 90%)",  // light mode secondary background
          dark: "hsl(225, 49%, 5%)",     // dark mode background
          'dark-secondary': "hsl(225, 49%, 8%)", // dark mode secondary background
        },
        text: {
          DEFAULT: "hsl(225, 49%, 15%)", // light mode text (darker for better contrast)
          secondary: "hsl(225, 49%, 40%)", // light mode secondary text
          dark: "hsl(0, 5%, 90%)",       // dark mode text
          'dark-secondary': "hsl(0, 5%, 65%)", // dark mode secondary text
        },
        border: {
          DEFAULT: "hsl(0, 5%, 80%)",    // light mode border
          dark: "hsl(225, 49%, 15%)",    // dark mode border
        },
        special: {
          DEFAULT: "hsl(145, 80%, 44%)", // primary special color
          hover: "hsl(145, 80%, 38%)",   // hover state
          light: "hsla(145, 50%, 69%, 1.00)",   // light variant for light mode
          dark: "hsl(145, 70%, 35%)",    // dark variant for dark mode
        }
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, hsl(0, 5%, 95%) 0%, hsl(0, 5%, 85%) 100%)',
        'gradient-dark': 'linear-gradient(135deg, hsl(225, 49%, 5%) 0%, hsl(225, 49%, 10%) 100%)',
      }
    },
  },
  plugins: [],
}