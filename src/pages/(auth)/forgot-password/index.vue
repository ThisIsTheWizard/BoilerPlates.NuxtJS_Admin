<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";

import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { REQUEST_PASSWORD_RESET_MUTATION } from "@/services/auth";

definePageMeta({
  auth: "guest",
});
useHead({
  title: "Forgot Password",
});

type ForgotPasswordResponse = {
  forgotPassword: {
    success: boolean;
    message?: string | null;
  };
};

const email = ref("");
const feedback = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const { mutate: requestPasswordReset, loading } = useMutation<
  ForgotPasswordResponse,
  { input: { email: string } }
>(REQUEST_PASSWORD_RESET_MUTATION);

const handleSubmit = async () => {
  feedback.value = null;
  errorMessage.value = null;

  try {
    const result = await requestPasswordReset({
      input: { email: email.value },
    });

    const data = result?.data;
    if (data?.forgotPassword?.success) {
      feedback.value =
        data.forgotPassword.message ??
        "If an account exists with that email, instructions have been sent.";
      email.value = "";
    } else {
      errorMessage.value =
        data?.forgotPassword?.message ??
        "We were unable to trigger a password reset. Please try again.";
    }
  } catch (error) {
    console.error("[forgotPassword]", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to process your request. Please try again later.";
  }
};
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-semibold text-slate-900">Reset your password</h1>
      <p class="text-sm text-slate-600">
        Enter the email address associated with your account and we'll send
        reset instructions.
      </p>
    </div>
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label for="email">Work email</Label>
        <Input
          id="email"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          required
        />
      </div>
      <p
        v-if="errorMessage"
        class="rounded-xl border border-red-200 bg-red-100/80 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <p
        v-if="feedback"
        class="rounded-xl border border-emerald-200 bg-emerald-100/80 px-4 py-3 text-sm text-emerald-700"
      >
        {{ feedback }}
      </p>
      <Button class="w-full" type="submit" :disabled="loading">
        {{ loading ? "Sending instructions..." : "Send reset link" }}
      </Button>
    </form>
    <p class="text-center text-sm text-slate-600">
      Remembered your credentials?
      <NuxtLink
        class="font-medium text-slate-900 hover:text-slate-700"
        to="/login"
      >
        Back to sign in
      </NuxtLink>
    </p>
  </div>
</template>
