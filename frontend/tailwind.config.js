/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f3f96",
          teal: "#2b67ca",
          gold: "#b10d33",
          mist: "#f6f8fc",
          ink: "#16294c",
          sky: "#e6eefb",
          slate: "#6d7a94"
        }
      },
      boxShadow: {
        panel: "0 24px 54px rgba(15, 63, 150, 0.08)"
      },
      backgroundImage: {
        "hero-texture":
          "radial-gradient(circle at top left, rgba(43,103,202,0.22), transparent 34%), radial-gradient(circle at right, rgba(177,13,51,0.16), transparent 32%), linear-gradient(135deg, rgba(15,63,150,0.96), rgba(22,41,76,0.98))"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
