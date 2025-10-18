<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";

import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { REGISTER_MUTATION, type GraphQLUser } from "@/services/auth";

definePageMeta({
  auth: "guest",
});
useHead({
  title: "Create Account",
});

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const formState = reactive<RegisterFormState>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const { mutate: registerMutation, loading } = useMutation<
  { register: GraphQLUser },
  {
    input: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    };
  }
>(REGISTER_MUTATION);

const resetForm = () => {
  formState.firstName = "";
  formState.lastName = "";
  formState.email = "";
  formState.password = "";
};

const handleSubmit = async () => {
  errorMessage.value = null;
  successMessage.value = null;

  try {
    const result = await registerMutation({
      input: {
        email: formState.email,
        password: formState.password,
        first_name: formState.firstName,
        last_name: formState.lastName,
      },
    });

    const data = result?.data;
    if (!data?.register) {
      throw new Error("Account creation failed. Please try again.");
    }

    successMessage.value =
      "Account created successfully. You can now sign in with your credentials.";
    resetForm();
  } catch (error) {
    console.error("[register]", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Unable to create your account. Please try again.";
  }
};
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-semibold text-slate-900">Create account</h1>
      <p class="text-sm text-slate-600">
        Set up your admin profile to access the dashboard.
      </p>
    </div>
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="firstName">First name</Label>
          <Input
            id="firstName"
            v-model="formState.firstName"
            name="firstName"
            autocomplete="given-name"
          />
        </div>
        <div class="space-y-2">
          <Label for="lastName">Last name</Label>
          <Input
            id="lastName"
            v-model="formState.lastName"
            name="lastName"
            autocomplete="family-name"
          />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="email">Work email</Label>
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
          autocomplete="new-password"
          required
          minlength="8"
        />
      </div>
      <p
        v-if="errorMessage"
        class="rounded-xl border border-red-200 bg-red-100/80 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <p
        v-if="successMessage"
        class="rounded-xl border border-emerald-200 bg-emerald-100/80 px-4 py-3 text-sm text-emerald-700"
      >
        {{ successMessage }}
      </p>
      <Button class="w-full" type="submit" :disabled="loading">
        {{ loading ? "Creating account..." : "Create account" }}
      </Button>
    </form>
    <p class="text-center text-sm text-slate-600">
      Already have access?
      <NuxtLink
        class="font-medium text-slate-900 hover:text-slate-700"
        to="/login"
      >
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
