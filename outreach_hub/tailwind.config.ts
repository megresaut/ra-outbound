import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        ink: {
          950: "#0a0a0b",
          900: "#101012",
          800: "#16161a",
          700: "#1d1d22",
        },
      },
    },
  },
  plugins: [],
};

export default config;
