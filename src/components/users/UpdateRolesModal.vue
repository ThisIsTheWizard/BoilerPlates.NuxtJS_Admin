<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { Loader2 } from "lucide-vue-next";

import DialogModal from "@/components/ui/DialogModal.vue";
import Button from "@/components/ui/Button.vue";
import {
  ASSIGN_ROLE_MUTATION,
  REVOKE_ROLE_MUTATION,
  type RolesQueryResult,
} from "@/services/roles";
import type { UsersQueryResult } from "@/services/users";

type UsersRow = UsersQueryResult["getUsers"]["data"][number];
type RoleRow = RolesQueryResult["getRoles"]["data"][number];

const props = defineProps<{
  open: boolean;
  user: UsersRow;
  allRoles: RoleRow[];
  loadingRoles: boolean;
  refetchUsers: () => Promise<unknown>;
}>();

const emit = defineEmits<{
  close: [];
  success: [message: string];
  error: [message: string];
}>();

const selectedRoleIds = ref<Set<string>>(new Set());
const pendingRoleId = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const hasChanges = ref(false);

const { mutate: assignRole, loading: assigning } = useMutation(
  ASSIGN_ROLE_MUTATION,
);
const { mutate: revokeRole, loading: revoking } = useMutation(
  REVOKE_ROLE_MUTATION,
);

const busy = computed(
  () => assigning.value || revoking.value || pendingRoleId.value !== null,
);

const normalizeRoleId = (roleId: string | number) => String(roleId);

const currentRoleIds = computed(() =>
  (props.user.roles ?? []).map((role) => normalizeRoleId(role.id)),
);

const formatName = (user: UsersRow) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name.length > 0 ? name : user.email;
};

const roleLabelFor = (roleId: string | number) => {
  const normalized = normalizeRoleId(roleId);
  const match = props.allRoles.find(
    (role) => normalizeRoleId(role.id) === normalized,
  );
  return match?.name ?? normalized;
};

const syncSelection = () => {
  selectedRoleIds.value = new Set(currentRoleIds.value);
  errorMessage.value = null;
};

watch(
  () => ({
    open: props.open,
    userId: props.user?.id ?? null,
    roleKey: currentRoleIds.value.slice().sort().join("|"),
  }),
  (state, prevState) => {
    if (!state.open) return;
    const changed =
      !prevState ||
      state.open !== prevState.open ||
      state.userId !== prevState.userId ||
      state.roleKey !== prevState.roleKey;
    if (changed) {
      syncSelection();
    }
  },
  { immediate: true },
);

const toggleRole = async (roleId: string) => {
  if (busy.value) return;

  const normalized = normalizeRoleId(roleId);
  const nextChecked = !selectedRoleIds.value.has(normalized);
  const previousSelection = new Set(selectedRoleIds.value);
  errorMessage.value = null;

  const next = new Set(selectedRoleIds.value);
  if (nextChecked) {
    next.add(normalized);
  } else {
    next.delete(normalized);
  }
  selectedRoleIds.value = next;
  pendingRoleId.value = normalized;

  try {
    if (nextChecked) {
      await assignRole({
        input: { role_id: roleId, user_id: props.user.id },
      });
      emit(
        "success",
        `Assigned ${roleLabelFor(roleId)} to ${formatName(props.user)}.`,
      );
    } else {
      await revokeRole({
        input: { role_id: roleId, user_id: props.user.id },
      });
      emit(
        "success",
        `Removed ${roleLabelFor(roleId)} from ${formatName(props.user)}.`,
      );
    }
    hasChanges.value = true;
  } catch (error) {
    console.error("[toggleUserRole]", error);
    selectedRoleIds.value = previousSelection;
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to update roles for this user.";
    errorMessage.value = message;
    emit("error", message);
  } finally {
    pendingRoleId.value = null;
  }
};

const handleClose = async () => {
  if (busy.value) return;
  if (hasChanges.value) {
    try {
      await props.refetchUsers();
    } catch (error) {
      console.error("[refetchUsersAfterRoles]", error);
    }
  }
  emit("close");
};

</script>

<template>
  <DialogModal
    :open="open"
    :close-on-backdrop="false"
    description="Select the roles this member should have. Changes take effect immediately."
    @close="handleClose"
  >
    <template #title>
      <span>Update roles for </span>
      <span
        class="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-0.5 text-sm font-semibold text-slate-900"
      >
        {{ formatName(user) }}
      </span>
    </template>

    <div class="space-y-4">
      <p
        v-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <fieldset
        class="grid gap-3"
        :disabled="busy || loadingRoles"
      >
        <p v-if="allRoles.length === 0" class="text-sm text-slate-500">
          No roles available. Create roles first in the Roles section.
        </p>
        <label
          v-else
          v-for="role in allRoles"
          :key="role.id"
          class="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900/40"
            :checked="selectedRoleIds.has(normalizeRoleId(role.id))"
            :disabled="pendingRoleId !== null"
            @change="toggleRole(role.id)"
          />
          <span class="capitalize">{{ role.name }}</span>
          <Loader2
            v-if="pendingRoleId === normalizeRoleId(role.id)"
            class="h-4 w-4 animate-spin text-slate-400"
          />
        </label>
      </fieldset>
      <p v-if="loadingRoles" class="text-xs text-slate-500">
        Loading roles...
      </p>
      <div class="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          :disabled="busy"
          @click="handleClose"
        >
          Close
        </Button>
      </div>
    </div>
  </DialogModal>
</template>
