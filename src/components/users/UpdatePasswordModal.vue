<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { Loader2 } from "lucide-vue-next";

import DialogModal from "@/components/ui/DialogModal.vue";
import Button from "@/components/ui/Button.vue";
import {
  SET_USER_PASSWORD_MUTATION,
  type SetUserPasswordResult,
  type UsersQueryResult,
} from "@/services/users";

type UsersRow = UsersQueryResult["getUsers"]["data"][number];

const props = defineProps<{
  open: boolean;
  user: UsersRow;
}>();

const emit = defineEmits<{
  close: [];
  success: [message: string];
  error: [message: string];
}>();

const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref<string | null>(null);

const { mutate: setPassword, loading } = useMutation<SetUserPasswordResult>(
  SET_USER_PASSWORD_MUTATION,
);

watch(
  () => props.open,
  (next) => {
    if (next) {
      password.value = "";
      confirmPassword.value = "";
      errorMessage.value = null;
    }
  },
);

const formatName = (user: UsersRow) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name.length > 0 ? name : user.email;
};

const disableSave = computed(() => {
  return (
    loading.value ||
    password.value.length < 8 ||
    password.value !== confirmPassword.value
  );
});

const handleSubmit = async () => {
  errorMessage.value = null;

  if (password.value !== confirmPassword.value) {
    const message = "Passwords do not match.";
    errorMessage.value = message;
    emit("error", message);
    return;
  }

  try {
    const result = await setPassword({
      user_id: props.user.id,
      password: password.value,
    });

    const data = result?.data;
    if (!data?.setUserPasswordByAdmin?.success) {
      throw new Error(
        data?.setUserPasswordByAdmin?.message ??
          "Unable to update the password.",
      );
    }

    emit("success", `Password updated for ${formatName(props.user)}.`);
    emit("close");
  } catch (error) {
    console.error("[setUserPassword]", error);
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to update the password.";
    errorMessage.value = message;
    emit("error", message);
  }
};
</script>

<template>
  <DialogModal
    :open="open"
    description="Set a new password for this member. They can sign in with it immediately."
    @close="emit('close')"
  >
    <template #title>
      <span>Update password for </span>
      <span
        class="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-0.5 text-sm font-semibold text-slate-900"
      >
        {{ formatName(user) }}
      </span>
    </template>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <p
        v-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <div>
        <label
          for="update-password"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          New password
        </label>
        <input
          id="update-password"
          v-model="password"
          type="password"
          required
          minlength="8"
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label
          for="update-password-confirm"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Confirm password
        </label>
        <input
          id="update-password-confirm"
          v-model="confirmPassword"
          type="password"
          required
          minlength="8"
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="Re-enter the password"
        />
      </div>
      <p class="text-xs text-slate-500">
        Use a strong passphrase with a mix of letters, numbers, and symbols.
      </p>
      <div class="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          :disabled="loading"
          @click="emit('close')"
        >
          Cancel
        </Button>
        <Button type="submit" :disabled="disableSave">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? "Updating..." : "Update password" }}
        </Button>
      </div>
    </form>
  </DialogModal>
</template>
