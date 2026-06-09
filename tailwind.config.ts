import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        tails: {
          sage: "#8B9E7A",
          "sage-light": "#B5C9A4",
          "sage-dark": "#5E6E51",
          tan: "#C4A55A",
          "tan-light": "#DFC78A",
          "tan-dark": "#8B6F2E",
          brown: "#8B5E3C",
          cream: "#F8F7F0",
          "cream-dark": "#EEE9D8",
          ink: "#2C2A25",
          muted: "#7A7265",
          white: "#FFFFFF",
          error: "#C0392B",
          success: "#4A7C59",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-lato)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(44,42,37,0.08)",
        "card-hover": "0 8px 24px rgba(44,42,37,0.14)",
      },
      backgroundImage: {
        "paw-pattern": "url('/paw-pattern.svg')",
      },
    },
  },
  plugins: [],
};

export default config;
