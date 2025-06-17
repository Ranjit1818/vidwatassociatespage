/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        gray: {
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          600: "#4b5563",
          800: "#1f2937",
        },
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        green: {
          600: "#16a34a",
          700: "#15803d",
        },
        red: {
          500: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
