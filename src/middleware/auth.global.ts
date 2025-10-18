import { storeToRefs } from "pinia";

import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  const auth = useAuthStore();
  const { tokens, session, hydrated } = storeToRefs(auth);

  if (!hydrated.value) {
    auth.hydrate();
    while (!hydrated.value) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  const hasAuth =
    Boolean(tokens.value?.accessToken) || Boolean(session.value?.user);

  const mode = to.meta.auth as "guest" | "auth" | undefined;

  if (mode === "auth" && !hasAuth) {
    return navigateTo(
      {
        path: "/login",
        query: to.path === "/login" ? undefined : { next: to.fullPath },
      },
      { replace: true }
    );
  }

  if (mode === "guest" && hasAuth) {
    return navigateTo("/dashboard", { replace: true });
  }
});
