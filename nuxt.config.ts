import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-10-18",
  srcDir: "src",
  ssr: false,
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL,
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
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "https://nuxt.com/icon.png",
        },
      ],
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    },
  },
  pages: true,
  typescript: {
    strict: true,
    typeCheck: true,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Tailwind config injected by module, types missing in CI
  tailwindcss: {
    exposeConfig: true,
    viewer: false,
  },
});
