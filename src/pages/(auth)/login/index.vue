<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";

import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { LOGIN_MUTATION } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  auth: "guest",
});
useHead({
  title: "Login",
});

interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
}

const formState = reactive<LoginFormState>({
  email: "",
  password: "",
  remember: false,
});

const errorMessage = ref<string | null>(null);

const auth = useAuthStore();
const route = useRoute();

const { mutate: loginMutation, loading } = useMutation(LOGIN_MUTATION);

const handleSubmit = async () => {
  errorMessage.value = null;

  try {
    const result = await loginMutation({
      input: { email: formState.email, password: formState.password },
    });

    const tokens = result?.data?.login;
    if (!tokens) {
      throw new Error("Missing tokens in response.");
    }

    auth.setSession(null);
    auth.setTokens(
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
      { remember: formState.remember }
    );

    const redirectTo =
      typeof route.query.next === "string" && route.query.next.length > 0
        ? route.query.next
        : "/dashboard";

    await navigateTo(redirectTo, { replace: true });
  } catch (error) {
    console.error("[login]", error);
    auth.clear();
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to sign in. Check your credentials and try again.";
  }
};
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-semibold text-slate-900">Sign in to Admin</h1>
      <p class="text-sm text-slate-600">
        Use your work email and password to access the dashboard.
      </p>
    </div>
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="email">Email address</Label>
        <Input
          id="email"
          v-model="formState.email"
          name="email"
          type="email"
          autocomplete="email"
          required
        />
      </div>
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="formState.password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center gap-2 text-slate-600">
          <input
            v-model="formState.remember"
            class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            type="checkbox"
            name="remember"
          />
          Remember me
        </label>
        <NuxtLink
          class="font-medium text-slate-900 hover:text-slate-700"
          to="/forgot-password"
        >
          Forgot password?
        </NuxtLink>
      </div>
      <p
        v-if="errorMessage"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <Button class="w-full" type="submit" :disabled="loading">
        {{ loading ? "Signing in..." : "Sign in" }}
      </Button>
    </form>
    <p class="text-center text-sm text-slate-600">
      New here?
      <NuxtLink
        class="font-medium text-slate-900 hover:text-slate-700"
        to="/register"
      >
        Create an account
      </NuxtLink>
    </p>
  </div>
</template>
