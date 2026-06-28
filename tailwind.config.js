/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        onday: {
          black: "#050505",
          white: "#ffffff",
          lime: "#d7ff00",
          slate: "#4b676e",
          panel: "#111819",
          line: "#263437"
        }
      },
      boxShadow: {
        panel: "0 18px 60px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};
