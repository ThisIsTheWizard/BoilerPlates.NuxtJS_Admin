<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { Filter, Loader2, Shield } from "lucide-vue-next";

import Card from "@/components/ui/Card.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import PermissionRolesModal from "@/components/permissions/PermissionRolesModal.vue";
import {
  formatActionLabel,
  formatDate,
  formatModuleLabel,
  formatNumber,
} from "@/lib/utils";
import {
  GET_PERMISSIONS_QUERY,
  type PermissionsQueryResult,
} from "@/services/permissions";
import { GET_ROLES_QUERY, type RolesQueryResult } from "@/services/roles";

definePageMeta({
  auth: "auth",
  layout: "private",
});
useHead({
  title: "Permissions Catalogue",
});

type PermissionRow = PermissionsQueryResult["getPermissions"]["data"][number];
type RoleRow = RolesQueryResult["getRoles"]["data"][number];

type BannerState = {
  type: "success" | "error";
  message: string;
} | null;

const {
  result: permissionsResult,
  loading: permissionsLoading,
  error: permissionsError,
  refetch: refetchPermissions,
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

const permissions = computed<PermissionRow[]>(
  () => permissionsResult.value?.getPermissions?.data ?? []
);

const roles = computed<RoleRow[]>(
  () => rolesResult.value?.getRoles?.data ?? []
);

const modules = computed(() =>
  Array.from(
    new Set(
      permissions.value
        .map((permission) => permission.module)
        .filter((module): module is string => Boolean(module))
    )
  )
    .map((module) => ({
      raw: module,
      label: formatModuleLabel(module),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);

const permissionRoleMap = computed(() => {
  const map = new Map<string, RoleRow[]>();
  roles.value.forEach((role) => {
    role.permissions?.forEach((permission) => {
      const collection = map.get(permission.id) ?? [];
      collection.push(role);
      map.set(permission.id, collection);
    });
  });
  return map;
});

const search = ref("");
const moduleFilter = ref("all");
const banner = ref<BannerState>(null);
const activePermissionId = ref<string | null>(null);

const filteredPermissions = computed(() => {
  const query = search.value.trim().toLowerCase();
  return permissions.value.filter((permission) => {
    const matchesModule =
      moduleFilter.value === "all" || permission.module === moduleFilter.value;
    const searchable = `${permission.module ?? ""}.${
      permission.action ?? ""
    }`.toLowerCase();
    const matchesSearch = query.length === 0 || searchable.includes(query);
    return matchesModule && matchesSearch;
  });
});

const activePermission = computed<PermissionRow | null>(() => {
  if (!activePermissionId.value) return null;
  return (
    permissions.value.find(
      (permission) => permission.id === activePermissionId.value
    ) ?? null
  );
});

const assignedRolesForActive = computed<RoleRow[]>(() => {
  if (!activePermission.value) return [];
  return permissionRoleMap.value.get(activePermission.value.id) ?? [];
});

const handleBanner = (type: "success" | "error", message: string) => {
  banner.value = { type, message };
};

const clearBanner = () => {
  banner.value = null;
};

const handleCloseModal = () => {
  activePermissionId.value = null;
};

const rolesForPermission = (permissionId: string) =>
  permissionRoleMap.value.get(permissionId) ?? [];

const formatRoleLabel = (roleName?: string | null) => {
  if (!roleName) return "—";
  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
};
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <h1 class="flex items-center gap-3 text-2xl font-semibold text-slate-900">
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow"
        >
          <Shield class="h-5 w-5" />
        </span>
        Permissions catalogue
      </h1>
      <p class="text-sm text-slate-600">
        Review every permission exposed by your GraphQL layer and see which
        roles rely on it.
      </p>
    </header>

    <div
      v-if="banner"
      :class="[
        'flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm',
        banner.type === 'success'
          ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
          : 'border-red-200 bg-red-100/80 text-red-700',
      ]"
    >
      <p>{{ banner.message }}</p>
      <button
        type="button"
        class="text-xs font-semibold uppercase tracking-wide"
        @click="clearBanner"
      >
        Dismiss
      </button>
    </div>

    <Card class="space-y-6">
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 class="text-lg font-semibold text-slate-900">
            Permission inventory
          </h2>
          <p class="text-sm text-slate-600">
            {{
              permissionsLoading
                ? "Loading permissions..."
                : `${formatNumber(filteredPermissions.length, {
                    maximumFractionDigits: 0,
                  })} of ${formatNumber(permissions.length, {
                    maximumFractionDigits: 0,
                  })} permissions shown.`
            }}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            class="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-sm"
          >
            <Filter class="h-4 w-4 text-slate-400" />
            <select
              v-model="moduleFilter"
              class="bg-transparent text-sm text-slate-700 focus:outline-none"
              :disabled="permissionsLoading"
            >
              <option value="all">All modules</option>
              <option
                v-for="module in modules"
                :key="module.raw"
                :value="module.raw"
              >
                {{ module.label }}
              </option>
            </select>
          </div>
          <Input
            v-model="search"
            placeholder="Search by module or action..."
            class="w-full min-w-[220px] border-white/60 bg-white/80 text-sm text-slate-700 shadow-sm focus:border-slate-900/40 focus:ring-slate-900/20"
          />
        </div>
      </div>

      <div class="space-y-3 text-sm text-red-700">
        <div
          v-if="permissionsError"
          class="rounded-2xl border border-red-200 bg-red-100/80 px-4 py-3"
        >
          {{ permissionsError.message }}
        </div>
        <div
          v-if="rolesError"
          class="rounded-2xl border border-red-200 bg-red-100/80 px-4 py-3"
        >
          {{ rolesError.message }}
        </div>
      </div>

      <div
        class="overflow-hidden rounded-2xl border border-white/50 bg-white/40 backdrop-blur"
      >
        <table class="min-w-full divide-y divide-white/40 text-sm">
          <thead
            class="bg-white/40 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur"
          >
            <tr>
              <th class="px-4 py-3">Module</th>
              <th class="px-4 py-3">Action</th>
              <th class="px-4 py-3">Roles with access</th>
              <th class="px-4 py-3">Created</th>
              <th class="px-4 py-3 text-right">Manage</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/40 bg-white/60 backdrop-blur">
            <tr
              v-if="permissionsLoading && filteredPermissions.length === 0"
              class="align-middle text-slate-500"
            >
              <td colspan="5" class="px-4 py-6">
                <div class="flex items-center gap-2 text-sm">
                  <Loader2 class="h-4 w-4 animate-spin" />
                  Loading permissions from GraphQL API...
                </div>
              </td>
            </tr>
            <tr
              v-else-if="filteredPermissions.length === 0"
              class="align-middle text-slate-500"
            >
              <td colspan="5" class="px-4 py-6">
                No permissions match your current filters.
              </td>
            </tr>
            <tr
              v-for="permission in filteredPermissions"
              :key="permission.id"
              class="align-top hover:bg-white/90"
            >
              <td class="px-4 py-4 text-slate-600 capitalize">
                {{ formatModuleLabel(permission.module) }}
              </td>
              <td class="px-4 py-4 text-slate-600 capitalize">
                {{ formatActionLabel(permission.action) }}
              </td>
              <td class="px-4 py-4 text-slate-600">
                <span
                  v-if="rolesForPermission(permission.id).length === 0"
                  class="text-xs text-slate-500"
                >
                  No roles assigned
                </span>
                <ul v-else class="flex flex-wrap gap-2">
                  <li
                    v-for="role in rolesForPermission(permission.id)"
                    :key="role.id"
                  >
                    <span
                      class="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-700 shadow-sm"
                    >
                      {{ formatRoleLabel(role.name) }}
                    </span>
                  </li>
                </ul>
              </td>
              <td class="px-4 py-4 text-slate-500">
                {{ formatDate(permission.created_at) }}
              </td>
              <td class="px-4 py-4 text-right">
                <Button
                  size="sm"
                  class="px-4 sm:px-5"
                  :disabled="rolesLoading"
                  @click="activePermissionId = permission.id"
                >
                  Manage roles
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <PermissionRolesModal
      v-if="activePermission"
      :open="Boolean(activePermission)"
      :permission="activePermission"
      :assigned-roles="assignedRolesForActive"
      :all-roles="roles"
      :refetch-roles="refetchRoles"
      :refetch-permissions="refetchPermissions"
      @close="handleCloseModal"
      @changed="handleBanner('success', $event)"
    />
  </div>
</template>
