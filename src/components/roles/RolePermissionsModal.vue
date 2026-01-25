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

type RoleRow = RolesQueryResult["getRoles"]["data"][number];
type PermissionRow = PermissionsQueryResult["getPermissions"]["data"][number];

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

const props = defineProps<{
  open: boolean;
  role: RoleRow;
  permissions: PermissionRow[];
  refetchRoles: () => Promise<unknown> | undefined;
  busy?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const selectedPermissionIds = ref<Set<string>>(new Set());
const pendingPermissionId = ref<string | null>(null);
const feedback = ref<FeedbackState>(null);
const hasChanges = ref(false);

const { mutate: assignPermission, loading: assigning } = useMutation(
  ASSIGN_PERMISSION_MUTATION,
);
const { mutate: revokePermission, loading: revoking } = useMutation(
  REVOKE_PERMISSION_MUTATION,
);

const assignedPermissionKey = computed(() =>
  (props.role.permissions ?? [])
    .map((permission) => permission.id)
    .sort()
    .join("|"),
);

const groupedPermissions = computed(() => {
  const modules = new Map<string, PermissionRow[]>();
  props.permissions.forEach((permission) => {
    const moduleKey = permission.module ?? "global";
    const modulePermissions = modules.get(moduleKey) ?? [];
    modulePermissions.push(permission);
    modules.set(moduleKey, modulePermissions);
  });

  return Array.from(modules.entries())
    .map(([moduleName, modulePermissions]) => ({
      module: moduleName,
      permissions: modulePermissions
        .slice()
        .sort((a, b) => (a.action ?? "").localeCompare(b.action ?? "")),
    }))
    .sort((a, b) => a.module.localeCompare(b.module));
});

const isBusy = computed(
  () =>
    Boolean(props.busy) ||
    assigning.value ||
    revoking.value ||
    pendingPermissionId.value !== null,
);

const syncSelection = (nextSelection?: Set<string>) => {
  const derived =
    nextSelection ??
    new Set((props.role.permissions ?? []).map((permission) => permission.id));

  let changed = derived.size !== selectedPermissionIds.value.size;
  if (!changed) {
    for (const id of derived) {
      if (!selectedPermissionIds.value.has(id)) {
        changed = true;
        break;
      }
    }
  }

  if (changed) {
    selectedPermissionIds.value = derived;
  }

  feedback.value = null;
  pendingPermissionId.value = null;
  hasChanges.value = false;
};

watch(
  () => ({
    open: props.open,
    roleId: props.role?.id ?? null,
    key: assignedPermissionKey.value,
  }),
  (state, prevState) => {
    if (!state.open) return;
    const changed =
      state.open !== prevState?.open ||
      state.roleId !== prevState.roleId ||
      state.key !== prevState.key;
    if (!changed) return;
    syncSelection();
  },
  { immediate: true },
);

const togglePermission = async (permission: PermissionRow) => {
  if (isBusy.value) return;

  const permissionId = permission.id;
  const nextChecked = !selectedPermissionIds.value.has(permissionId);
  const beforeChange = new Set(selectedPermissionIds.value);

  const next = new Set(selectedPermissionIds.value);
  if (nextChecked) {
    next.add(permissionId);
  } else {
    next.delete(permissionId);
  }
  selectedPermissionIds.value = next;
  pendingPermissionId.value = permissionId;
  feedback.value = null;

  const actionLabel = formatActionLabel(permission.action).toLowerCase();
  const moduleLabel = formatModuleLabel(permission.module);

  try {
    if (nextChecked) {
      await assignPermission({
        input: { permission_id: permissionId, role_id: props.role.id },
      });
      feedback.value = {
        type: "success",
        message: `Granted ${actionLabel} for ${moduleLabel}.`,
      };
    } else {
      await revokePermission({
        input: { role_id: props.role.id, permission_id: permissionId },
      });
      feedback.value = {
        type: "success",
        message: `Revoked ${actionLabel} for ${moduleLabel}.`,
      };
    }
    hasChanges.value = true;
  } catch (error) {
    console.error("[togglePermission]", error);
    selectedPermissionIds.value = beforeChange;
    const message =
      error instanceof Error
        ? error.message.replace("GraphQL error: ", "")
        : "Unable to update permissions.";
    feedback.value = { type: "error", message };
  } finally {
    pendingPermissionId.value = null;
  }
};

const handleClose = async () => {
  if (isBusy.value) return;
  if (hasChanges.value) {
    try {
      await props.refetchRoles();
    } catch (error) {
      console.error("[refetchRoles]", error);
      const message =
        error instanceof Error
          ? error.message.replace("GraphQL error: ", "")
          : "Unable to refresh the role. View may be outdated.";
      feedback.value = { type: "error", message };
      hasChanges.value = false;
      return;
    }
  }
  emit("close");
};
</script>

<template>
  <DialogModal
    :open="open"
    :close-on-backdrop="false"
    max-width-class="max-w-3xl"
    @close="handleClose"
  >
    <template #title>
      <span>Manage permissions for </span>
      <span
        class="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-sm font-semibold text-slate-900"
      >
        {{ formatModuleLabel(role.name) }}
      </span>
    </template>
    <div class="flex flex-col gap-6">
      <div class="space-y-1">
        <p class="text-sm text-slate-600">
          Assign or revoke module actions to keep this role aligned with your
          security model.
        </p>
      </div>

      <p
        v-if="feedback"
        :class="[
          'rounded-2xl border px-3 py-2 text-sm',
          feedback.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700',
        ]"
      >
        {{ feedback.message }}
      </p>

      <div
        class="max-h-[32rem] overflow-y-auto rounded-2xl border border-white/60 bg-white/80 p-3"
      >
        <p
          v-if="groupedPermissions.length === 0"
          class="px-2 py-4 text-xs text-slate-500"
        >
          No permissions are available.
        </p>
        <div v-else class="space-y-3">
          <div
            v-for="group in groupedPermissions"
            :key="group.module"
            class="space-y-2"
          >
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {{ formatModuleLabel(group.module) }}
              </p>
              <span class="text-xs text-slate-400">
                {{ group.permissions.length }} permission{{
                  group.permissions.length === 1 ? "" : "s"
                }}
              </span>
            </div>
            <div class="flex flex-wrap justify-around gap-3">
              <label
                v-for="permission in group.permissions"
                :key="permission.id"
                class="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border border-slate-300 text-slate-900 focus:ring-slate-900/20"
                  :checked="selectedPermissionIds.has(permission.id)"
                  :disabled="isBusy"
                  @change="togglePermission(permission)"
                />
                <span>{{ formatActionLabel(permission.action) }}</span>
                <Loader2
                  v-if="pendingPermissionId === permission.id"
                  class="h-3 w-3 animate-spin text-slate-400"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          :disabled="isBusy"
          @click="handleClose"
        >
          Close
        </Button>
      </div>
    </div>
  </DialogModal>
</template>
