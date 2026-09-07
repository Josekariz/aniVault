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
        canvas: "#f3f5f8",
        surface: "#ffffff",
        "surface-2": "#e8ecf2",
        ink: {
          DEFAULT: "#141820",
          muted: "#4b5568",
          subtle: "#7b8494",
        },
        accent: {
          DEFAULT: "#e11d38",
          soft: "#ffe4e8",
        },
        score: "#c27803",
        app: {
          DEFAULT: "#f3f5f8",
          elevated: "#ffffff",
          soft: "#ffffff",
          hover: "#e8ecf2",
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
        soft: "0 10px 40px -18px rgba(20, 24, 32, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
