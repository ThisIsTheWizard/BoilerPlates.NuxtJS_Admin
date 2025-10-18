<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { Loader2, RefreshCw } from "lucide-vue-next";

import Card from "@/components/ui/Card.vue";
import Button from "@/components/ui/Button.vue";
import InviteUserModal from "@/components/users/InviteUserModal.vue";
import UpdatePasswordModal from "@/components/users/UpdatePasswordModal.vue";
import UpdateRolesModal from "@/components/users/UpdateRolesModal.vue";
import UpdateStatusModal from "@/components/users/UpdateStatusModal.vue";
import UpdateUserModal from "@/components/users/UpdateUserModal.vue";
import UserActionsMenu from "@/components/users/UserActionsMenu.vue";
import { cn, formatDate } from "@/lib/utils";
import { GET_ROLES_QUERY, type RolesQueryResult } from "@/services/roles";
import {
  GET_USERS_QUERY,
  USERS_DEFAULT_OPTIONS,
  type UsersQueryResult,
} from "@/services/users";

definePageMeta({
  auth: "auth",
  layout: "private",
});
useHead({
  title: "Users",
});

type UsersRow = UsersQueryResult["getUsers"]["data"][number];

type BannerState = {
  type: "success" | "error";
  message: string;
} | null;

type ModalState =
  | { type: "invite-user" }
  | { type: "update-user"; user: UsersRow }
  | { type: "update-roles"; user: UsersRow }
  | { type: "update-status"; user: UsersRow }
  | { type: "update-password"; user: UsersRow }
  | null;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  invited: "bg-blue-50 text-blue-700 border-blue-100",
  unverified: "bg-amber-50 text-amber-700 border-amber-100",
};

const {
  result: usersResult,
  loading: usersLoading,
  error: usersError,
  refetch: refetchUsers,
} = useQuery<UsersQueryResult>(
  GET_USERS_QUERY,
  () => ({
    options: USERS_DEFAULT_OPTIONS,
  }),
  () => ({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    ssr: false,
  })
);

const {
  result: rolesResult,
  loading: rolesLoading,
  error: rolesError,
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

const users = computed<UsersRow[]>(
  () => usersResult.value?.getUsers?.data ?? []
);
const usersMeta = computed(
  () => usersResult.value?.getUsers?.meta_data ?? null
);
const allRoles = computed(() => rolesResult.value?.getRoles?.data ?? []);

const banner = ref<BannerState>(null);
const modalState = ref<ModalState>(null);

const selectedUser = computed<UsersRow | null>(() => {
  const state = modalState.value;
  if (!state || state.type === "invite-user") return null;
  return state.user;
});

const closeModal = () => {
  modalState.value = null;
};

const setBanner = (type: "success" | "error", message: string) => {
  banner.value = { type, message };
};

const clearBanner = () => {
  banner.value = null;
};

const handleRefresh = async () => {
  clearBanner();
  try {
    await refetchUsers();
  } catch (error) {
    console.error("[refreshUsers]", error);
    const message =
      error instanceof Error ? error.message : "Unable to refresh users.";
    setBanner("error", message);
  }
};

const formatName = (user: UsersRow) => {
  const name = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name.length > 0 ? name : user.email;
};
</script>

<template>
  <div
    class="flex flex-1 min-h-[calc(100vh-7rem-2rem)] flex-col gap-6 sm:min-h-[calc(100vh-7rem-3rem)] lg:min-h-[calc(100vh-7rem-4rem)]"
  >
    <header
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">Users</h1>
        <p class="text-sm text-slate-600">
          Invite, suspend, or update user roles across the workspace.
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="md"
          :disabled="usersLoading"
          @click="handleRefresh"
        >
          <Loader2 v-if="usersLoading" class="mr-2 h-4 w-4 animate-spin" />
          <RefreshCw v-else class="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button @click="modalState = { type: 'invite-user' }">
          Invite user
        </Button>
      </div>
    </header>

    <div
      v-if="banner"
      :class="
        cn(
          'flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm',
          banner.type === 'success'
            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
            : 'border-red-200 bg-red-100/80 text-red-700'
        )
      "
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

    <Card
      v-if="rolesError"
      class="border-red-200 bg-red-100/70 text-sm text-red-700"
    >
      {{ rolesError.message }}
    </Card>

    <Card class="flex flex-1 min-h-0 flex-col gap-4">
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div class="text-slate-600">
          <span class="font-semibold text-slate-900">
            {{ usersMeta?.filtered_rows ?? users.length }}
          </span>
          {{ usersMeta?.filtered_rows === 1 ? " user" : " users" }} shown
        </div>
        <div class="text-xs uppercase tracking-wide text-slate-400">
          {{ usersLoading ? "Syncing directory..." : "Directory synced" }}
        </div>
      </div>

      <div
        class="relative flex-1 rounded-2xl border border-white/50 bg-white/40 backdrop-blur min-h-0"
      >
        <div
          v-if="usersLoading && !users.length"
          class="flex h-full items-center gap-2 p-6 text-sm text-slate-500"
        >
          <Loader2 class="h-4 w-4 animate-spin" />
          Loading users from GraphQL API...
        </div>
        <div
          v-else-if="usersError"
          class="flex h-full items-center p-6 text-sm text-red-600"
        >
          {{ usersError.message || "Unable to load users." }}
        </div>
        <div
          v-else-if="users.length === 0"
          class="flex h-full items-center p-6 text-sm text-slate-500"
        >
          No users found. Connect the admin backend or invite your first
          teammate.
        </div>
        <div v-else class="min-h-0 overflow-x-auto overflow-y-visible">
          <table class="min-w-full divide-y divide-white/40 text-sm">
            <thead
              class="bg-white/40 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 backdrop-blur"
            >
              <tr>
                <th class="px-4 py-3">Member</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Roles</th>
                <th class="px-4 py-3 text-right">Joined</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/40 bg-white/60 backdrop-blur">
              <tr
                v-for="(user, index) in users"
                :key="user.id"
                class="align-top hover:bg-white/90"
              >
                <td class="px-4 py-4 font-medium text-slate-900">
                  {{ formatName(user) }}
                </td>
                <td class="px-4 py-4 text-slate-600">
                  {{ user.email }}
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="
                      cn(
                        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize',
                        STATUS_STYLES[user.status] ??
                          'bg-slate-100 text-slate-600 border-slate-200'
                      )
                    "
                  >
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-4 py-4 text-slate-600">
                  <span
                    v-if="!(user.roles && user.roles.length)"
                    class="text-xs text-slate-500"
                  >
                    No roles
                  </span>
                  <div v-else class="flex flex-wrap gap-2">
                    <span
                      v-for="role in user.roles"
                      :key="role.id"
                      class="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold capitalize text-slate-700 shadow-sm"
                    >
                      {{ role.name }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4 text-right text-slate-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td
                  class="relative overflow-visible px-4 py-4 text-center align-middle"
                >
                  <UserActionsMenu
                    :preferred-placement="
                      index >= Math.max(0, users.length - 2) ? 'up' : 'down'
                    "
                    @update="modalState = { type: 'update-user', user }"
                    @update-roles="modalState = { type: 'update-roles', user }"
                    @change-status="
                      modalState = { type: 'update-status', user }
                    "
                    @change-password="
                      modalState = { type: 'update-password', user }
                    "
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>

    <InviteUserModal
      :open="modalState?.type === 'invite-user'"
      :refetch-users="refetchUsers"
      @close="closeModal"
      @success="setBanner('success', $event)"
      @error="setBanner('error', $event)"
    />

    <UpdateStatusModal
      v-if="modalState?.type === 'update-status' && selectedUser"
      :open="modalState?.type === 'update-status'"
      :user="selectedUser"
      :refetch-users="refetchUsers"
      @close="closeModal"
      @success="setBanner('success', $event)"
      @error="setBanner('error', $event)"
    />

    <UpdatePasswordModal
      v-if="modalState?.type === 'update-password' && selectedUser"
      :open="modalState?.type === 'update-password'"
      :user="selectedUser"
      @close="closeModal"
      @success="setBanner('success', $event)"
      @error="setBanner('error', $event)"
    />

    <UpdateUserModal
      v-if="modalState?.type === 'update-user' && selectedUser"
      :open="modalState?.type === 'update-user'"
      :user="selectedUser"
      :refetch-users="refetchUsers"
      @close="closeModal"
      @success="setBanner('success', $event)"
      @error="setBanner('error', $event)"
    />

    <UpdateRolesModal
      v-if="modalState?.type === 'update-roles' && selectedUser"
      :open="modalState?.type === 'update-roles'"
      :user="selectedUser"
      :all-roles="allRoles"
      :loading-roles="rolesLoading"
      :refetch-users="refetchUsers"
      @close="closeModal"
      @success="setBanner('success', $event)"
      @error="setBanner('error', $event)"
    />
  </div>
</template>
