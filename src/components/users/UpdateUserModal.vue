<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { Loader2 } from "lucide-vue-next";

import DialogModal from "@/components/ui/DialogModal.vue";
import Button from "@/components/ui/Button.vue";
import {
  UPDATE_USER_MUTATION,
  type UpdateUserResult,
  type UsersQueryResult,
} from "@/services/users";

type UsersRow = UsersQueryResult["getUsers"]["data"][number];

const props = defineProps<{
  open: boolean;
  user: UsersRow;
  refetchUsers: () => Promise<unknown> | undefined;
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

const { mutate: updateUser, loading } =
  useMutation<UpdateUserResult>(UPDATE_USER_MUTATION);

const syncFromUser = () => {
  form.firstName = props.user?.first_name ?? "";
  form.lastName = props.user?.last_name ?? "";
  form.email = props.user?.email ?? "";
};

watch(
  () => props.user,
  () => {
    if (props.open) {
      syncFromUser();
    }
  },
  { immediate: true },
);

watch(
  () => props.open,
  (next) => {
    if (next) {
      syncFromUser();
    }
  },
);

const trimmedFirstName = computed(() => form.firstName.trim());
const trimmedLastName = computed(() => form.lastName.trim());
const trimmedEmail = computed(() => form.email.trim());

const unchanged = computed(() => {
  return (
    trimmedFirstName.value === (props.user?.first_name ?? "") &&
    trimmedLastName.value === (props.user?.last_name ?? "") &&
    trimmedEmail.value === (props.user?.email ?? "")
  );
});

const disableSave = computed(() => {
  return loading.value || trimmedEmail.value.length === 0 || unchanged.value;
});

const formatName = (user: UsersRow) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name.length > 0 ? name : user.email;
};

const handleSubmit = async () => {
  try {
    const firstName = trimmedFirstName.value;
    const lastName = trimmedLastName.value;
    const email = trimmedEmail.value;

    const result = await updateUser({
      input: {
        entity_id: props.user.id,
        data: {
          email,
          first_name: firstName.length > 0 ? firstName : undefined,
          last_name: lastName.length > 0 ? lastName : undefined,
        },
      },
    });

    const data = result?.data;
    await props.refetchUsers();

    const updatedUser = data?.updateUser;
    const nextName = [firstName, lastName].filter(Boolean).join(" ");
    const label =
      nextName.length > 0
        ? nextName
        : (updatedUser?.email ?? email ?? formatName(props.user));

    emit("success", `Updated ${label}.`);
    emit("close");
  } catch (error) {
    console.error("[updateUser]", error);
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to update the selected user.";
    emit("error", message);
  }
};
</script>

<template>
  <DialogModal
    :open="open"
    description="Edit account details and keep profile information accurate."
    @close="emit('close')"
  >
    <template #title>
      <span>Update </span>
      <span
        class="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-0.5 text-sm font-semibold text-slate-900"
      >
        {{ formatName(user) }}
      </span>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label
          for="update-user-first-name"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          First name
        </label>
        <input
          id="update-user-first-name"
          v-model="form.firstName"
          type="text"
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="Jane"
        />
      </div>
      <div>
        <label
          for="update-user-last-name"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Last name
        </label>
        <input
          id="update-user-last-name"
          v-model="form.lastName"
          type="text"
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="Doe"
        />
      </div>
      <div>
        <label
          for="update-user-email"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Email
        </label>
        <input
          id="update-user-email"
          v-model="form.email"
          type="email"
          required
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          placeholder="jane@example.com"
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
        <Button type="submit" :disabled="disableSave">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? "Saving..." : "Save changes" }}
        </Button>
      </div>
    </form>
  </DialogModal>
</template>
