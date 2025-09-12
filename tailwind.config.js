/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // 👈 include app folder
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 include src folder if you keep helpers/components
  ],
  theme: {
    extend: {
      colors: {
        gigablue: "#0047AB", // Example custom color (GigaSmart branding later)
        gigagreen: "#00C49A",
      },
    },
  },
  plugins: [],
};
