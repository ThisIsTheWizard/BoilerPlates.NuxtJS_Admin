<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

const USER_STATUS_OPTIONS = ["active", "inactive"] as const;

const props = defineProps<{
  open: boolean;
  user: UsersRow;
  refetchUsers: () => Promise<unknown>;
}>();

const emit = defineEmits<{
  close: [];
  success: [message: string];
  error: [message: string];
}>();

const selectedStatus = ref<typeof USER_STATUS_OPTIONS[number]>("inactive");
const errorMessage = ref<string | null>(null);

const { mutate: updateUser, loading } = useMutation<UpdateUserResult>(
  UPDATE_USER_MUTATION,
);

const syncFromUser = () => {
  const rawStatus = props.user?.status ?? "inactive";
  selectedStatus.value = USER_STATUS_OPTIONS.includes(
    rawStatus as (typeof USER_STATUS_OPTIONS)[number],
  )
    ? (rawStatus as (typeof USER_STATUS_OPTIONS)[number])
    : "inactive";
  errorMessage.value = null;
};

watch(
  () => props.open,
  (next) => {
    if (next) {
      syncFromUser();
    }
  },
  { immediate: true },
);

watch(
  () => props.user,
  () => {
    if (props.open) {
      syncFromUser();
    }
  },
);

const disableSave = computed(() => {
  return loading.value || selectedStatus.value === props.user?.status;
});

const formatName = (user: UsersRow) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name.length > 0 ? name : user.email;
};

const handleSubmit = async () => {
  errorMessage.value = null;

  try {
    await updateUser({
      input: {
        entity_id: props.user.id,
        data: {
          status: selectedStatus.value,
        },
      },
    });

    await props.refetchUsers();
    const statusLabel =
      selectedStatus.value.charAt(0).toUpperCase() +
      selectedStatus.value.slice(1);
    emit("success", `${formatName(props.user)} is now ${statusLabel}.`);
    emit("close");
  } catch (error) {
    console.error("[updateUserStatus]", error);
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to update the user status.";
    errorMessage.value = message;
    emit("error", message);
  }
};
</script>

<template>
  <DialogModal
    :open="open"
    @close="emit('close')"
    :title="[
      'Update status for',
      ' ',
      '' /* placeholder to keep array join consistent */,
    ]"
    description="Switch between active and inactive to control access immediately."
  >
    <template #title>
      <span>Update status for </span>
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
          for="update-status-select"
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Select status
        </label>
        <select
          id="update-status-select"
          v-model="selectedStatus"
          class="mt-1 w-full rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-900/40 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          <option
            v-for="option in USER_STATUS_OPTIONS"
            :key="option"
            :value="option"
            class="capitalize"
          >
            {{ option }}
          </option>
        </select>
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
          {{ loading ? "Updating..." : "Update status" }}
        </Button>
      </div>
    </form>
  </DialogModal>
</template>
