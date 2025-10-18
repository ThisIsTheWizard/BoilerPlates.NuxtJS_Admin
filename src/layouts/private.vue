<script setup lang="ts">
import { gql } from "@apollo/client/core";
import { ChevronDown, Menu, X } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { computed, ref, watch, watchEffect } from "vue";

import Button from "@/components/ui/Button.vue";
import BlockingLoader from "@/components/ui/BlockingLoader.vue";
import SidebarNav from "@/components/shared/SidebarNav.vue";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { CURRENT_USER_QUERY } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import { useMutation, useQuery } from "@vue/apollo-composable";

function breadcrumbFor(pathname: string) {
  const crumbs = pathname.split("/").filter(Boolean);
  if (crumbs.length === 0) return "Dashboard";

  const navMatch = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  if (navMatch) return navMatch.title;

  return crumbs[crumbs.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

const auth = useAuthStore();

if (import.meta.client) {
  auth.hydrate();
}
const route = useRoute();
const router = useRouter();
const { tokens, session, hydrated } = storeToRefs(auth);

const mobileOpen = ref(false);
const profileOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);

const shouldFetchUser = computed(() => Boolean(tokens.value?.accessToken));

const {
  result: currentUserResult,
  loading: userLoading,
  error: currentUserError,
} = useQuery(CURRENT_USER_QUERY, null, () => ({
  fetchPolicy: "network-only",
  enabled: shouldFetchUser.value,
  ssr: false,
}));

watch(
  currentUserResult,
  (value) => {
    if (!shouldFetchUser.value || userLoading.value) return;
    if (import.meta.server) return;

    if (value?.user) {
      auth.setSession({ user: value.user });
    } else {
      auth.clear();
      void router.replace("/login");
    }
  },
  { immediate: true },
);

watch(
  currentUserError,
  (error) => {
    if (!error) return;
    if (import.meta.server) return;
    auth.clear();
    void router.replace("/login");
  },
  { immediate: true },
);

const breadcrumb = computed(() => breadcrumbFor(route.path));

const userDisplay = computed(() => {
  const user = session.value?.user;
  if (!user) {
    return {
      name: "Guest",
      role: "Not signed in",
      initials: "NA",
    };
  }

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const fallbackName = user.email ?? "User";
  const initials = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  const primaryRole = user.role;

  return {
    name: name.length > 0 ? name : fallbackName,
    role: primaryRole
      ? primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)
      : "User",
    initials: initials || fallbackName.slice(0, 2).toUpperCase(),
  };
});

const sessionUser = computed(() => session.value?.user ?? null);

const userStatusLabel = computed(() => {
  const status = sessionUser.value?.status;
  if (!status) return "Unknown status";
  return status.charAt(0).toUpperCase() + status.slice(1);
});

const { mutate: logoutMutation, loading: loggingOut } = useMutation(
  LOGOUT_MUTATION,
  () => ({
    fetchPolicy: "no-cache",
  }),
);

const handleLogout = async () => {
  try {
    await logoutMutation();
  } catch (error) {
    console.warn("[logout]", error);
  } finally {
    auth.clear();
    await router.replace("/login");
  }
};

watch(
  () => route.path,
  () => {
    profileOpen.value = false;
    mobileOpen.value = false;
  },
);

watch(
  profileOpen,
  (isOpen, _, onCleanup) => {
    if (!isOpen) return;

    const handlePointer = (event: MouseEvent) => {
      if (
        profileMenuRef.value &&
        !profileMenuRef.value.contains(event.target as Node)
      ) {
        profileOpen.value = false;
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        profileOpen.value = false;
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);

    onCleanup(() => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    });
  },
  { flush: "post" },
);

const redirectingToLogin = computed(
  () => hydrated.value && !tokens.value?.accessToken,
);

const awaitingSession = computed(
  () =>
    !hydrated.value ||
    (Boolean(tokens.value?.accessToken) &&
      (userLoading.value || !sessionUser.value)),
);

const showLoader = computed(
  () => redirectingToLogin.value || awaitingSession.value,
);
</script>

<template>
  <BlockingLoader v-if="showLoader" />
  <div
    v-else
    class="flex min-h-screen gap-6 bg-transparent px-4 py-6 sm:px-8"
  >
    <aside
      class="hidden w-72 flex-col rounded-3xl border border-white/40 bg-white/60 px-6 py-8 shadow-2xl backdrop-blur-2xl transition-all lg:flex lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)] lg:overflow-y-auto"
    >
      <NuxtLink to="/dashboard" class="flex items-center gap-2">
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/90 text-sm font-semibold text-white shadow-inner"
        >
          NA
        </span>
        <span class="text-lg font-semibold text-slate-900">
          Nuxt Admin
        </span>
      </NuxtLink>
      <div class="mt-8">
        <SidebarNav />
      </div>
    </aside>

    <div class="flex w-full flex-col">
      <header
        class="sticky top-0 z-20 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl"
      >
        <div class="flex h-16 items-center justify-between px-4 sm:px-6">
          <div class="flex items-center gap-3">
            <Button
              class="lg:hidden"
              size="icon"
              variant="ghost"
              aria-label="Toggle navigation"
              @click="mobileOpen = !mobileOpen"
            >
              <X v-if="mobileOpen" class="h-5 w-5" />
              <Menu v-else class="h-5 w-5" />
            </Button>
            <div class="text-sm font-semibold text-slate-700">
              {{ breadcrumb }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="relative" ref="profileMenuRef">
              <button
                type="button"
                class="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                aria-haspopup="menu"
                :aria-expanded="profileOpen"
                aria-label="Open profile menu"
                @click="profileOpen = !profileOpen"
              >
                <div class="flex flex-col items-start leading-tight">
                  <span class="text-xs font-semibold text-slate-900">
                    {{ userDisplay.name }}
                  </span>
                  <span class="text-[11px] text-slate-500">
                    {{ userDisplay.role }}
                  </span>
                </div>
                <span
                  class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
                >
                  {{ userDisplay.initials }}
                </span>
                <ChevronDown
                  :class="
                    cn(
                      'h-4 w-4 text-slate-400 transition-transform',
                      profileOpen ? 'rotate-180' : 'rotate-0',
                    )
                  "
                  aria-hidden="true"
                />
              </button>
              <div
                v-if="profileOpen"
                class="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-white/40 bg-white/95 p-4 text-left shadow-xl backdrop-blur"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
                  >
                    {{ userDisplay.initials }}
                  </span>
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-900">
                      {{ userDisplay.name }}
                    </span>
                    <span class="text-xs text-slate-500">
                      {{ sessionUser ? sessionUser.email : "No email on record" }}
                    </span>
                    <span
                      class="mt-1 inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600"
                    >
                      {{ userDisplay.role }}
                    </span>
                  </div>
                </div>

                <div class="mt-4 space-y-2 text-xs text-slate-500">
                  <template v-if="sessionUser">
                    <p>
                      Status:
                      <span class="font-medium text-slate-700">
                        {{ userStatusLabel }}
                      </span>
                    </p>
                    <p>
                      Permissions:
                      <span class="font-medium text-slate-700">
                        {{ sessionUser.permissions.length }}
                      </span>
                    </p>
                  </template>
                  <p v-else>You are not currently signed in.</p>
                </div>

                <Button
                  class="mt-4 w-full"
                  variant="danger"
                  size="sm"
                  :disabled="loggingOut"
                  @click="
                    profileOpen = false;
                    handleLogout();
                  "
                >
                  {{ loggingOut ? "Signing out..." : "Sign out" }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 px-1 py-6 sm:px-2 lg:px-4">
        <div
          class="min-h-[calc(100vh-7rem)] rounded-3xl border border-white/40 bg-white/70 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:p-8"
        >
          <slot />
        </div>
      </main>
    </div>

    <div
      :class="
        cn(
          'fixed inset-y-0 left-0 z-30 w-72 rounded-r-3xl border border-white/40 bg-white/70 px-6 py-8 shadow-2xl backdrop-blur-2xl transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )
      "
    >
      <SidebarNav :on-navigate="() => (mobileOpen = false)" />
    </div>
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-sm lg:hidden"
      @click="mobileOpen = false"
    />
  </div>
</template>
