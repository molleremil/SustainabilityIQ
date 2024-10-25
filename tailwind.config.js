module.exports = {
  purge: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./src/index.html",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse-slow 10s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
