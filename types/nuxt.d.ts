declare module "nuxt/schema" {
  interface PageMeta {
    layout?: false | "default" | "private";
    auth?: "guest" | "auth";
  }
}

declare module "#app" {
  interface PageMeta {
    layout?: false | "default" | "private";
    auth?: "guest" | "auth";
  }
}

export {};
