<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@vue/apollo-composable";

import MiniAreaChart from "@/components/dashboard/MiniAreaChart.vue";
import StatusDistribution from "@/components/dashboard/StatusDistribution.vue";
import Card from "@/components/ui/Card.vue";
import {
  GET_PERMISSIONS_QUERY,
  type PermissionsQueryResult,
} from "@/services/permissions";
import { GET_ROLES_QUERY, type RolesQueryResult } from "@/services/roles";
import {
  GET_USERS_QUERY,
  USERS_DEFAULT_OPTIONS,
  type UsersQueryResult,
} from "@/services/users";
import { formatDate, toEpochMilliseconds } from "@/lib/utils";

definePageMeta({
  auth: "auth",
  layout: "private",
});
useHead({
  title: "Dashboard",
});

const DASHBOARD_USERS_OPTIONS = {
  ...USERS_DEFAULT_OPTIONS,
  limit: 50,
  order: [["created_at", "DESC"]] as [string, string][],
};

const {
  result: usersResult,
  loading: usersLoading,
  error: usersError,
} = useQuery<UsersQueryResult>(
  GET_USERS_QUERY,
  () => ({ options: DASHBOARD_USERS_OPTIONS }),
  () => ({
    fetchPolicy: "cache-and-network",
    ssr: false,
  })
);

const {
  result: rolesResult,
  loading: rolesLoading,
  error: rolesError,
} = useQuery<RolesQueryResult>(
  GET_ROLES_QUERY,
  () => ({ options: { limit: 50, offset: 0 } }),
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

const userRows = computed(() => usersResult.value?.getUsers?.data ?? []);

const totalUsers = computed(
  () =>
    usersResult.value?.getUsers?.meta_data?.total_rows ?? userRows.value.length
);

const activeUsers = computed(
  () => userRows.value.filter((user) => user.status === "active").length
);

const invitedUsers = computed(
  () => userRows.value.filter((user) => user.status === "invited").length
);

const unverifiedUsers = computed(
  () => userRows.value.filter((user) => user.status === "unverified").length
);

const inactiveUsers = computed(
  () => userRows.value.filter((user) => user.status === "inactive").length
);

const roles = computed(() => rolesResult.value?.getRoles?.data ?? []);

const rolesCount = computed(
  () => rolesResult.value?.getRoles?.meta_data?.total_rows ?? roles.value.length
);

const globalPermissions = computed(
  () => permissionsResult.value?.getPermissions?.data ?? []
);

const permissionsCount = computed(
  () =>
    permissionsResult.value?.getPermissions?.meta_data?.total_rows ??
    globalPermissions.value.length
);

const roleAssignments = computed(() =>
  roles.value.reduce((acc, role) => acc + (role.users?.length ?? 0), 0)
);

const averageRolesPerUser = computed(() => {
  if (!totalUsers.value) return "0.0";
  return (roleAssignments.value / totalUsers.value).toFixed(1);
});

const statusSlices = computed(() => [
  { status: "active", count: activeUsers.value },
  { status: "invited", count: invitedUsers.value },
  { status: "unverified", count: unverifiedUsers.value },
  { status: "inactive", count: inactiveUsers.value },
]);

const userTrend = computed(() => buildMonthlyTrend(userRows.value));

const recentUsers = computed(() => userRows.value.slice(0, 5));

const metricTiles = computed(() => [
  {
    label: "Total users",
    value: formatNumber(totalUsers.value),
    hint: usersLoading.value
      ? "Syncing directory..."
      : `${formatNumber(activeUsers.value)} active · ${formatNumber(
          invitedUsers.value
        )} invited`,
  },
  {
    label: "Active roles",
    value: formatNumber(rolesCount.value),
    hint: rolesLoading.value
      ? "Loading roles..."
      : `${formatNumber(roleAssignments.value)} assignments`,
  },
  {
    label: "Permissions",
    value: formatNumber(permissionsCount.value),
    hint: permissionsLoading.value
      ? "Loading permissions..."
      : "Manage access across modules",
  },
  {
    label: "Roles per user",
    value: averageRolesPerUser.value,
    hint: "Average assignments across directory",
  },
]);

const roleCoverageStats = computed(() => [
  {
    label: "Assignments",
    value: formatNumber(roleAssignments.value),
  },
  {
    label: "Roles in use",
    value: formatNumber(
      roles.value.filter((role) => (role.users?.length ?? 0) > 0).length
    ),
  },
  {
    label: "Permissions span",
    value: `${formatNumber(
      roles.value.reduce(
        (acc, role) => acc + (role.permissions?.length ?? 0),
        0
      )
    )} total`,
  },
]);

const hasAnyError = computed(
  () => usersError.value ?? rolesError.value ?? permissionsError.value ?? null
);

function buildMonthlyTrend(
  users: UsersQueryResult["getUsers"]["data"],
  months = 6
) {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const markers: { key: string; label: string }[] = [];
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  });

  for (let index = months - 1; index >= 0; index -= 1) {
    const marker = new Date(Date.UTC(nowYear, nowMonth - index, 1));
    const key = `${marker.getUTCFullYear()}-${marker.getUTCMonth()}`;
    const label = monthFormatter.format(marker);
    markers.push({ key, label });
  }

  const counts = markers.reduce<Record<string, number>>((acc, marker) => {
    acc[marker.key] = 0;
    return acc;
  }, {});

  users.forEach((user) => {
    const epoch = toEpochMilliseconds(user.created_at);
    if (epoch === null) return;
    const timestamp = new Date(epoch);
    if (Number.isNaN(timestamp.getTime())) return;
    const key = `${timestamp.getUTCFullYear()}-${timestamp.getUTCMonth()}`;
    if (key in counts) {
      counts[key] += 1;
    }
  });

  return markers.map((marker) => ({
    label: marker.label,
    value: counts[marker.key] ?? 0,
  }));
}

function formatName(user: UsersQueryResult["getUsers"]["data"][number]) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name.length > 0 ? name : "—";
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="tile in metricTiles" :key="tile.label" class="space-y-2">
        <p class="text-sm font-medium uppercase tracking-wide text-slate-500">
          {{ tile.label }}
        </p>
        <p class="text-3xl font-semibold text-slate-900">
          {{ tile.value }}
        </p>
        <p class="text-xs text-slate-600">
          {{ tile.hint }}
        </p>
      </Card>
    </section>

    <Card
      v-if="hasAnyError"
      class="border-red-200 bg-red-100/70 text-sm text-red-700"
    >
      <p>
        {{
          hasAnyError?.message ??
          "Unable to load dashboard metrics from the GraphQL API."
        }}
      </p>
    </Card>

    <section class="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Card class="space-y-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">
              Monthly signups
            </h2>
            <p class="text-sm text-slate-600">
              Rolling six-month trend based on account creation dates.
            </p>
          </div>
          <span
            class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >
            {{ formatNumber(totalUsers) }} total
          </span>
        </div>
        <MiniAreaChart :data="userTrend" />
      </Card>

      <Card class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Status snapshot</h2>
          <p class="text-sm text-slate-600">
            Track lifecycle states across your user base.
          </p>
        </div>
        <StatusDistribution :data="statusSlices" :total="totalUsers" />
      </Card>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <Card class="space-y-5">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Recent signups</h2>
          <p class="text-sm text-slate-600">
            The latest members joining your workspace.
          </p>
        </div>
        <ul class="divide-y divide-white/50">
          <li
            v-if="recentUsers.length === 0"
            class="py-4 text-sm text-slate-500"
          >
            No recent signups. Invite teammates to get started.
          </li>
          <li
            v-for="user in recentUsers"
            :key="user.id"
            class="flex items-center justify-between py-3 text-sm text-slate-700"
          >
            <div>
              <p class="font-semibold text-slate-900">
                {{ formatName(user) }}
              </p>
              <p class="text-xs text-slate-500">
                {{ user.email }}
              </p>
            </div>
            <div class="text-right text-xs text-slate-500">
              <p class="capitalize">{{ user.status }}</p>
              <p>{{ formatDate(user.created_at) }}</p>
            </div>
          </li>
        </ul>
      </Card>

      <Card class="space-y-5">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Role coverage</h2>
          <p class="text-sm text-slate-600">
            Understand how roles are distributed across users.
          </p>
        </div>
        <ul class="space-y-3 text-sm text-slate-700">
          <li
            v-for="stat in roleCoverageStats"
            :key="stat.label"
            class="flex items-center justify-between rounded-2xl border border-white/50 bg-white/60 px-4 py-3 backdrop-blur"
          >
            <span class="font-medium text-slate-600">{{ stat.label }}</span>
            <span class="font-semibold text-slate-900">{{ stat.value }}</span>
          </li>
        </ul>
      </Card>
    </section>
  </div>
</template>
