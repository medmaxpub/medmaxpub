/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: "#c62828",
          navy: "#2563eb",
          teal: "#60a5fa",
          gold: "#d4af37",
          mist: "#0b0f1a",
          ink: "#f8fafc",
          sky: "#141a2a",
          slate: "#94a3b8",
          surface: "#141a2a",
          elevated: "#1b2438",
          border: "#27324a"
        }
      },
      boxShadow: {
        panel: "0 24px 54px rgba(4, 10, 24, 0.48)"
      },
      backgroundImage: {
        "hero-texture":
          "radial-gradient(circle at top left, rgba(96,165,250,0.18), transparent 34%), radial-gradient(circle at right, rgba(212,175,55,0.16), transparent 32%), linear-gradient(135deg, rgba(11,15,26,0.98), rgba(20,26,42,0.98))"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
