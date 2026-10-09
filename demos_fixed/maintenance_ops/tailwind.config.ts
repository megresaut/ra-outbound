import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#f7f7f9",
          raised: "#ffffff",
          subtle: "#f0f0f3",
          panel: "#eaeaef",
        },
        border: {
          subtle: "rgba(0, 0, 0, 0.06)",
          DEFAULT: "rgba(0, 0, 0, 0.1)",
          strong: "rgba(0, 0, 0, 0.18)",
        },
        text: {
          primary: "rgba(15, 17, 22, 0.95)",
          secondary: "rgba(15, 17, 22, 0.68)",
          tertiary: "rgba(15, 17, 22, 0.45)",
          dim: "rgba(15, 17, 22, 0.28)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          bright: "var(--accent-bright)",
          dim: "var(--accent-dim)",
          glow: "var(--accent-glow)",
          border: "var(--accent-border)",
        },
        status: {
          success: "#16803c",
          warning: "#9a6700",
          error: "#cf222e",
          info: "var(--accent)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
