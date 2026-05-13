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
          mist: "#ffffff",
          ink: "#111827",
          sky: "#f8fafc",
          slate: "#4b5563",
          surface: "#ffffff",
          elevated: "#f9fafb",
          border: "#e5e7eb"
        }
      },
      boxShadow: {
        panel: "0 18px 40px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "hero-texture":
          "radial-gradient(circle at top left, rgba(96,165,250,0.08), transparent 34%), radial-gradient(circle at right, rgba(198,40,40,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,1))"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
