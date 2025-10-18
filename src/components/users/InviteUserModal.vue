<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { Loader2 } from "lucide-vue-next";

import DialogModal from "@/components/ui/DialogModal.vue";
import Button from "@/components/ui/Button.vue";
import {
  CREATE_USER_MUTATION,
  type CreateUserResult,
} from "@/services/users";

const props = defineProps<{
  open: boolean;
  refetchUsers: () => Promise<unknown>;
}>();

const emit = defineEmits<{
  close: [];
  success: [message: string];
  error: [message: string];
}>();

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
});

const errorMessage = ref<string | null>(null);

const { mutate: createUser, loading } = useMutation<CreateUserResult>(
  CREATE_USER_MUTATION,
);

const resetState = () => {
  form.firstName = "";
  form.lastName = "";
  form.email = "";
  errorMessage.value = null;
};

watch(
  () => props.open,
  (next) => {
    if (!next) {
      resetState();
    }
  },
);

const disableInvite = computed(() => {
  return (
    loading.value ||
    form.firstName.trim().length === 0 ||
    form.lastName.trim().length === 0 ||
    form.email.trim().length === 0
  );
});

const handleSubmit = async () => {
  errorMessage.value = null;

  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim();

  try {
    await createUser({
      input: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
    });

    await props.refetchUsers();

    const displayName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || email;
    emit("success", `Invitation sent to ${displayName}.`);
    emit("close");
  } catch (error) {
    console.error("[createUser]", error);
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to invite the user.";
    errorMessage.value = message;
    emit("error", message);
  }
};
</script>

<template>
  <DialogModal
    :open="open"
    title="Invite a new user"
    description="Send an invitation to add a teammate to the workspace."
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <p
        v-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <div>
        <label
          for="invite-first-name"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          First name
        </label>
        <input
          id="invite-first-name"
          v-model="form.firstName"
          type="text"
          required
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="Morgan"
        />
      </div>
      <div>
        <label
          for="invite-last-name"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Last name
        </label>
        <input
          id="invite-last-name"
          v-model="form.lastName"
          type="text"
          required
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="Lee"
        />
      </div>
      <div>
        <label
          for="invite-email"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Work email
        </label>
        <input
          id="invite-email"
          v-model="form.email"
          type="email"
          required
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="morgan@example.com"
        />
      </div>
      <div class="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          :disabled="loading"
          @click="emit('close')"
        >
          Cancel
        </Button>
        <Button type="submit" :disabled="disableInvite">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? "Sending invite..." : "Send invite" }}
        </Button>
      </div>
    </form>
  </DialogModal>
</template>
