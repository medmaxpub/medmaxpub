/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#081c3a",
          teal: "#15616d",
          gold: "#e3a008",
          mist: "#f4f7fb",
          ink: "#14213d",
          sky: "#d9eff5",
          slate: "#5c677d"
        }
      },
      boxShadow: {
        panel: "0 28px 60px rgba(8, 28, 58, 0.08)"
      },
      backgroundImage: {
        "hero-texture":
          "radial-gradient(circle at top left, rgba(227,160,8,0.18), transparent 32%), radial-gradient(circle at right, rgba(21,97,109,0.18), transparent 36%)"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
