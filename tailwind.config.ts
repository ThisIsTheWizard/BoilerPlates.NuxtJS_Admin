import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{vue,js,ts}",
    "./src/layouts/**/*.vue",
    "./src/pages/**/*.vue",
    "./src/app.vue",
    "./src/plugins/**/*.ts",
    "./nuxt.config.ts",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5f5",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
