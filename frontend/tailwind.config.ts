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
        darkBg: "#0f172a", // Slate 900
        darkCard: "#1e293b", // Slate 800
        accentGreen: "#10b981", // Emerald 500
        accentRed: "#ef4444", // Red 500
      },
    },
  },
  plugins: [],
};
export default config;
