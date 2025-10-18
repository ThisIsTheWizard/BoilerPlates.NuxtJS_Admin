<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { storeToRefs } from "pinia";

import BlockingLoader from "@/components/ui/BlockingLoader.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

if (import.meta.client) {
  auth.hydrate();
}

const { tokens, session, hydrated } = storeToRefs(auth);

const hasSession = computed(
  () => Boolean(tokens.value?.accessToken) || Boolean(session.value?.user),
);
if (import.meta.client) {
  watchEffect(async () => {
    if (!hydrated.value) return;
    if (hasSession.value) {
      await navigateTo("/dashboard", { replace: true });
    }
  });
}

const shouldBlock = computed(() => !hydrated.value || hasSession.value);
</script>

<template>
  <BlockingLoader v-if="shouldBlock" />
  <div
    v-else
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-white p-6"
  >
    <div
      class="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/70 p-10 shadow-2xl backdrop-blur-2xl"
    >
      <slot />
    </div>
  </div>
</template>
