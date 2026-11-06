/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#123B70",
          "navy-dark": "#0B2447",
          "navy-light": "#1E4F8F",
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          bg: "#FFFFFF",
          surface: "#F8FAFC",
          muted: "#64748B",
          border: "#E2E8F0",
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};
