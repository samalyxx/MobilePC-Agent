import type { Config } from "tailwindcss";

export default {
  content: ["./app.vue", "./components/**/*.{vue,ts}", "./composables/**/*.ts", "./pages/**/*.vue"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        paper: "#f7f8f3",
        steel: "#3b5b65",
        signal: "#1f8a70",
        caution: "#c97718"
      }
    }
  },
  plugins: []
} satisfies Config;
