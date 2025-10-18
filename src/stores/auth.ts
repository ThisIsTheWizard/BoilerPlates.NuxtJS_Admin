import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useCookie } from "nuxt/app";

import type { AuthSession, AuthTokens } from "@/types/auth";

const COOKIE_NAME = "nuxt-admin-auth";
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type PersistedAuth = {
  tokens: AuthTokens | null;
  session: AuthSession | null;
  remember?: boolean;
};

const baseCookieOptions = {
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

const createCookieOptions = (persistForWeek?: boolean) => ({
  ...baseCookieOptions,
  maxAge: persistForWeek ? REMEMBER_MAX_AGE : undefined,
  encode: (value: PersistedAuth | null) =>
    value ? JSON.stringify(value) : "",
  decode: (value: string) => {
    if (!value) return null;
    try {
      return JSON.parse(value) as PersistedAuth;
    } catch {
      return null;
    }
  },
});

export const useAuthStore = defineStore("auth", () => {
  const tokens = ref<AuthTokens | null>(null);
  const session = ref<AuthSession | null>(null);
  const hydrated = ref(false);
  const remember = ref(false);

  const persist = () => {
    const payload: PersistedAuth | null =
      tokens.value || session.value
        ? {
            tokens: tokens.value,
            session: session.value,
            remember: remember.value,
          }
        : null;

    const cookie = useCookie<PersistedAuth | null>(
      COOKIE_NAME,
      createCookieOptions(remember.value && !!payload),
    );

    cookie.value = payload;
  };

  const hydrate = () => {
    if (hydrated.value) return;
    try {
      const cookie = useCookie<PersistedAuth | null>(COOKIE_NAME, createCookieOptions());
      const payload = cookie.value;
      if (payload) {
        tokens.value = payload.tokens ?? null;
        session.value = payload.session ?? null;
        remember.value = payload.remember ?? false;
      } else {
        tokens.value = null;
        session.value = null;
        remember.value = false;
      }
    } catch (error) {
      console.error("Failed to hydrate auth store", error);
    } finally {
      hydrated.value = true;
    }
  };

  const setTokens = (nextTokens: AuthTokens | null, options?: { remember?: boolean }) => {
    tokens.value = nextTokens;
    if (options?.remember !== undefined) {
      remember.value = options.remember;
    }
    persist();
  };

  const setSession = (nextSession: AuthSession | null) => {
    session.value = nextSession;
    persist();
  };

  const clear = () => {
    tokens.value = null;
    session.value = null;
    remember.value = false;
    const cookie = useCookie<PersistedAuth | null>(
      COOKIE_NAME,
      createCookieOptions(),
    );
    cookie.value = null;
  };

  hydrate();

  const isAuthenticated = computed(() => Boolean(tokens.value?.accessToken));

  return {
    tokens,
    session,
    hydrated,
    isAuthenticated,
    hydrate,
    setTokens,
    setSession,
    clear,
  };
});
