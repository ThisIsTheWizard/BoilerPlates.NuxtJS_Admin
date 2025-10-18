<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { Loader2 } from "lucide-vue-next";

import DialogModal from "@/components/ui/DialogModal.vue";
import Button from "@/components/ui/Button.vue";
import {
  ASSIGN_PERMISSION_MUTATION,
  REVOKE_PERMISSION_MUTATION,
  type PermissionsQueryResult,
} from "@/services/permissions";
import type { RolesQueryResult } from "@/services/roles";
import { formatActionLabel, formatModuleLabel } from "@/lib/utils";

type PermissionRow = PermissionsQueryResult["getPermissions"]["data"][number];
type RoleRow = RolesQueryResult["getRoles"]["data"][number];

const props = defineProps<{
  open: boolean;
  permission: PermissionRow;
  assignedRoles: RoleRow[];
  allRoles: RoleRow[];
  refetchRoles: () => Promise<unknown>;
  refetchPermissions: () => Promise<unknown>;
}>();

const emit = defineEmits<{
  close: [];
  changed: [message: string];
}>();

const selectedRoleIds = ref<Set<string>>(new Set());
const pendingRoleId = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const hasChanges = ref(false);

const { mutate: assignPermissionToRole, loading: assigning } = useMutation(
  ASSIGN_PERMISSION_MUTATION,
);
const { mutate: revokePermissionFromRole, loading: revoking } = useMutation(
  REVOKE_PERMISSION_MUTATION,
);

const busyState = computed(
  () => assigning.value || revoking.value || pendingRoleId.value !== null,
);

const assignedRoleKey = computed(() =>
  props.assignedRoles
    .map((role) => role.id)
    .sort()
    .join("|"),
);

const syncSelection = (nextSelection?: Set<string>) => {
  const derived =
    nextSelection ?? new Set(props.assignedRoles.map((role) => role.id));

  let changed = derived.size !== selectedRoleIds.value.size;
  if (!changed) {
    for (const id of derived) {
      if (!selectedRoleIds.value.has(id)) {
        changed = true;
        break;
      }
    }
  }

  if (changed) {
    selectedRoleIds.value = derived;
  }

  pendingRoleId.value = null;
  errorMessage.value = null;
  hasChanges.value = false;
};

watch(
  () => ({
    open: props.open,
    permissionId: props.permission?.id ?? null,
    assignedKey: assignedRoleKey.value,
  }),
  (state, prevState) => {
    if (!state.open) return;
    const changed =
      !prevState ||
      state.open !== prevState.open ||
      state.permissionId !== prevState.permissionId ||
      state.assignedKey !== prevState.assignedKey;
    if (!changed) return;
    syncSelection();
  },
  { immediate: true },
);

const handleToggleRole = async (roleId: string) => {
  const nextChecked = !selectedRoleIds.value.has(roleId);
  const beforeChange = new Set(selectedRoleIds.value);
  errorMessage.value = null;

  const next = new Set(selectedRoleIds.value);
  if (nextChecked) {
    next.add(roleId);
  } else {
    next.delete(roleId);
  }
  selectedRoleIds.value = next;
  pendingRoleId.value = roleId;

  try {
    let feedbackMessage: string;
    const role = props.allRoles.find((candidate) => candidate.id === roleId);
    const roleLabel = role ? formatModuleLabel(role.name) : roleId;
    if (nextChecked) {
      await assignPermissionToRole({
        input: {
          permission_id: props.permission.id,
          role_id: roleId,
        },
      });
      feedbackMessage = `Assigned ${formatModuleLabel(
        props.permission.module,
      )} · ${formatActionLabel(props.permission.action)} to ${roleLabel}.`;
    } else {
      await revokePermissionFromRole({
        input: {
          role_id: roleId,
          permission_id: props.permission.id,
        },
      });
      feedbackMessage = `Removed ${formatModuleLabel(
        props.permission.module,
      )} · ${formatActionLabel(
        props.permission.action,
      )} from ${roleLabel}.`;
    }

    hasChanges.value = true;
    emit("changed", feedbackMessage);
  } catch (error) {
    console.error("[togglePermissionRole]", error);
    selectedRoleIds.value = beforeChange;
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to update roles for this permission.";
    errorMessage.value = message;
  } finally {
    pendingRoleId.value = null;
  }
};

const handleClose = async () => {
  if (busyState.value) return;

  if (hasChanges.value) {
    try {
      await Promise.all([props.refetchRoles(), props.refetchPermissions()]);
    } catch (error) {
      console.error("[closePermissionRolesModal]", error);
    }
  }

  emit("close");
};
</script>

<template>
  <DialogModal
    :open="open"
    :close-on-backdrop="false"
    max-width-class="max-w-2xl"
    @close="handleClose"
  >
    <template #title>
      <span>Manage roles for </span>
      <span
        class="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-sm font-semibold text-slate-900"
      >
        {{ formatModuleLabel(permission.module) }} ·
        {{ formatActionLabel(permission.action) }}
      </span>
    </template>
    <div class="space-y-4">
      <p class="text-sm text-slate-600">
        Assign or revoke roles that can use this permission.
      </p>
      <p
        v-if="errorMessage"
        class="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>
      <fieldset
        class="max-h-80 overflow-y-auto rounded-2xl border border-white/60 bg-white/80 p-3"
        :disabled="busyState"
      >
        <p
          v-if="allRoles.length === 0"
          class="px-2 py-4 text-xs text-slate-500"
        >
          No roles available.
        </p>
        <p
          v-else-if="allRoles.length > 0 && selectedRoleIds.size === 0 && assignedRoles.length === 0"
          class="px-2 py-4 text-xs text-slate-500"
        >
          There are no roles assigned yet. Select one below.
        </p>
        <div v-else class="grid gap-3">
          <label
            v-for="role in allRoles"
            :key="role.id"
            class="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900/20"
              :checked="selectedRoleIds.has(role.id)"
              :disabled="busyState && pendingRoleId !== role.id"
              @change="handleToggleRole(role.id)"
            />
            <span class="capitalize">{{ role.name }}</span>
            <Loader2
              v-if="pendingRoleId === role.id"
              class="h-4 w-4 animate-spin text-slate-400"
            />
          </label>
        </div>
      </fieldset>
      <div class="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          :disabled="busyState"
          @click="handleClose"
        >
          Close
        </Button>
      </div>
    </div>
  </DialogModal>
</template>
