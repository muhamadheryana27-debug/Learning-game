/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a365d",
        accent: "#2b6cb0",
        surface: "#ffffff",
        muted: "#edf2f7",
        success: "#38a169",
        warning: "#d69e2e",
        danger: "#e53e3e",
      },
      fontFamily: { sans: ["Inter", "Helvetica", "Arial", "sans-serif"] },
      borderRadius: { card: "1rem", pill: "999px" },
    },
  },
  plugins: [],
}

