/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(221.55deg, #E1CFE6 9.5%, #C2A0CD 25.86%, #86409B 41.81%, #432068 53.26%, #000035 63.48%, #000000 75.34%)",
      },
    },
  },
  plugins: [],
};
