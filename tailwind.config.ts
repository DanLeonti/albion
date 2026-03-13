import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        silver: "#C0C0C0",
        gold: "#FFD700",
        albion: {
          dark: "#1a1a2e",
          darker: "#16213e",
          accent: "#0f3460",
          highlight: "#e94560",
        },
      },
    },
  },
  plugins: [],
};
export default config;
