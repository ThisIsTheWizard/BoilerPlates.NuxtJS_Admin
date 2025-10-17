import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  srcDir: "src",
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      titleTemplate: "%s | Nuxt Admin",
      meta: [
        {
          name: "description",
          content:
            "Admin tooling for managing users, roles, and permissions in the Nuxt boilerplate.",
        },
      ],
      bodyAttrs: {
        class:
          "bg-gradient-to-br from-slate-100 via-slate-200 to-white text-slate-900 antialiased",
      },
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  tailwindcss: {
    exposeConfig: true,
    viewer: false,
  },
});
