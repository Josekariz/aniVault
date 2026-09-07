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
        canvas: "#0F1117",
        surface: "#161921",
        "surface-2": "#1c2130",
        ink: {
          DEFAULT: "#f3f5f9",
          muted: "#b4bbc8",
          subtle: "#7f8796",
        },
        accent: {
          DEFAULT: "#ff5956",
          soft: "#3a1a1d",
        },
        score: "#FFAD49",
        app: {
          DEFAULT: "#0F1117",
          elevated: "#161921",
          soft: "#161921",
          hover: "#1c2130",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        hero: 'url("/hero.png")',
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
export default config;
