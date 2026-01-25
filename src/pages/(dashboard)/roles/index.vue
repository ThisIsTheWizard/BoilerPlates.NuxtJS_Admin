<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { Loader2, Shield, ShieldCheck } from "lucide-vue-next";

import Card from "@/components/ui/Card.vue";
import Button from "@/components/ui/Button.vue";
import RolePermissionsModal from "@/components/roles/RolePermissionsModal.vue";
import {
  formatActionLabel,
  formatModuleLabel,
  formatNumber,
} from "@/lib/utils";
import { GET_ROLES_QUERY, type RolesQueryResult } from "@/services/roles";
import {
  GET_PERMISSIONS_QUERY,
  type PermissionsQueryResult,
} from "@/services/permissions";

definePageMeta({
  auth: "auth",
  layout: "private",
});
useHead({
  title: "Roles & Access",
});

type RoleRow = RolesQueryResult["getRoles"]["data"][number];
type PermissionRow = PermissionsQueryResult["getPermissions"]["data"][number];

const {
  result: rolesResult,
  loading: rolesLoading,
  error: rolesError,
  refetch: refetchRoles,
} = useQuery<RolesQueryResult>(
  GET_ROLES_QUERY,
  () => ({
    options: { limit: 50, offset: 0 },
  }),
  () => ({
    fetchPolicy: "cache-and-network",
    ssr: false,
  })
);

const {
  result: permissionsResult,
  loading: permissionsLoading,
  error: permissionsError,
} = useQuery<PermissionsQueryResult>(
  GET_PERMISSIONS_QUERY,
  () => ({
    options: {
      limit: 200,
      offset: 0,
      order: [
        ["module", "ASC"],
        ["action", "ASC"],
      ] as [string, string][],
    },
  }),
  () => ({
    fetchPolicy: "cache-and-network",
    ssr: false,
  })
);

const roles = computed<RoleRow[]>(
  () => rolesResult.value?.getRoles?.data ?? []
);
const permissions = computed<PermissionRow[]>(
  () => permissionsResult.value?.getPermissions?.data ?? []
);

const permissionModuleOrder = computed(() => {
  const seen = new Set<string>();
  const order: string[] = [];
  permissions.value.forEach((permission) => {
    const moduleName = permission.module ?? "global";
    if (!seen.has(moduleName)) {
      seen.add(moduleName);
      order.push(moduleName);
    }
  });
  return order;
});

const activeRoleId = ref<string | null>(null);

const activeRole = computed<RoleRow | null>(() => {
  if (!activeRoleId.value) return null;
  return roles.value.find((role) => role.id === activeRoleId.value) ?? null;
});

const moduleDescriptionsForRole = (role: RoleRow) => {
  const grouped = new Map<string, PermissionRow[]>();
  role.permissions?.forEach((permission) => {
    const moduleKey = permission.module ?? "global";
    const existing = grouped.get(moduleKey) ?? [];
    existing.push(permission);
    grouped.set(moduleKey, existing);
  });

  return Array.from(grouped.entries()).map(([moduleKey, perms]) => {
    const actions = perms
      .map((permission) => formatActionLabel(permission.action).toLowerCase())
      .join(", ");
    return {
      module: moduleKey,
      description: `${formatModuleLabel(moduleKey)}: Can ${actions}`,
    };
  });
};

const previewModulesForRole = (role: RoleRow) => {
  const descriptions = moduleDescriptionsForRole(role);
  const orderMap = new Map<string, number>();
  permissionModuleOrder.value.forEach((moduleName, index) => {
    orderMap.set(moduleName, index);
  });

  return descriptions.slice().sort((a, b) => {
    const aIndex = orderMap.get(a.module) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.get(b.module) ?? Number.MAX_SAFE_INTEGER;
    if (aIndex === bIndex) {
      return a.module.localeCompare(b.module);
    }
    return aIndex - bIndex;
  });
};

const handleOpenPermissions = (role: RoleRow) => {
  activeRoleId.value = role.id;
};

const handleClosePermissions = () => {
  activeRoleId.value = null;
};
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <h1 class="flex items-center gap-3 text-2xl font-semibold text-slate-900">
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow"
        >
          <ShieldCheck class="h-5 w-5" />
        </span>
        Roles &amp; access
      </h1>
      <p class="text-sm text-slate-600">
        Grant capabilities to each team role and keep permissions aligned with
        your organization.
      </p>
    </header>

    <Card
      v-if="rolesError"
      class="border-red-200 bg-red-100/70 text-sm text-red-700"
    >
      {{ rolesError.message }}
    </Card>

    <Card
      v-if="permissionsError"
      class="border-red-200 bg-red-100/70 text-sm text-red-700"
    >
      {{ permissionsError.message }}
    </Card>

    <section class="grid gap-6 sm:grid-cols-2">
      <Card
        v-if="rolesLoading && roles.length === 0"
        class="flex items-center gap-3 text-sm text-slate-500"
      >
        <Loader2 class="h-4 w-4 animate-spin" />
        Loading roles from GraphQL API...
      </Card>
      <Card v-else-if="roles.length === 0" class="text-sm text-slate-500">
        No roles found. Seed your backend or create roles to begin managing
        access.
      </Card>
      <template v-else>
        <Card
          v-for="role in roles"
          :key="role.id"
          class="flex h-full min-h-[22rem] flex-col justify-between space-y-6"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-slate-700 shadow-sm"
              >
                <Shield class="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">
                  Role
                </p>
                <h2 class="text-lg font-semibold capitalize text-slate-900">
                  {{ role.name }}
                </h2>
              </div>
            </div>
            <div
              class="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {{
                formatNumber(role.users?.length ?? 0, {
                  maximumFractionDigits: 0,
                })
              }}
              member{{ role.users && role.users.length === 1 ? "" : "s" }}
            </div>
          </div>

          <div class="space-y-3">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Modules
            </p>
            <p
              v-if="(role.permissions?.length ?? 0) === 0"
              class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-xs text-slate-500"
            >
              No modules assigned yet. Add one below.
            </p>
            <div v-else class="space-y-2">
              <ul class="flex flex-wrap gap-2">
                <li
                  v-for="module in previewModulesForRole(role)"
                  :key="module.module"
                >
                  <span
                    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm"
                  >
                    {{ module.description }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div class="rounded-2xl border border-white/60 bg-white/70 p-4">
            <div class="flex flex-col gap-3">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Manage access
                </p>
                <p class="text-xs text-slate-500">
                  Adjust module-level permissions for this role.
                </p>
              </div>
              <Button
                size="sm"
                :disabled="permissionsLoading"
                @click="handleOpenPermissions(role)"
              >
                Configure permissions
              </Button>
            </div>
          </div>
        </Card>
      </template>
    </section>

    <RolePermissionsModal
      v-if="activeRole"
      :open="Boolean(activeRole)"
      :role="activeRole"
      :permissions="permissions"
      :busy="permissionsLoading"
      :refetch-roles="refetchRoles"
      @close="handleClosePermissions"
    />
  </div>
</template>
