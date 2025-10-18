<script setup lang="ts">
import { computed } from "vue";

import { cn } from "@/lib/utils";

type StatusSlice = {
  status: string;
  count: number;
};

const STATUS_COLORS: Record<string, string> = {
  active: "from-emerald-400/80 via-emerald-300/80 to-emerald-500/80",
  inactive: "from-slate-400/80 via-slate-300/80 to-slate-500/80",
  invited: "from-blue-400/80 via-blue-300/80 to-blue-500/80",
  unverified: "from-amber-400/80 via-amber-300/80 to-amber-500/80",
};

const props = defineProps<{
  data: StatusSlice[];
  total: number;
}>();

const safeTotal = computed(() => {
  if (props.total > 0) return props.total;
  return props.data.reduce((acc, slice) => acc + slice.count, 0);
});

const segments = computed(() =>
  props.data.map((item) => {
    const total = safeTotal.value;
    const width = total === 0 ? 0 : Math.max((item.count / total) * 100, 0);
    return {
      ...item,
      width,
      roundedWidth: total === 0 ? 0 : Math.round((item.count / total) * 100),
    };
  }),
);
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex h-4 overflow-hidden rounded-full border border-white/40 bg-white/40 shadow-inner backdrop-blur"
    >
      <div
        v-for="item in segments"
        :key="item.status"
        :class="
          cn(
            'h-full bg-gradient-to-r',
            STATUS_COLORS[item.status] ?? 'from-slate-300/80 to-slate-400/80',
          )
        "
        :style="{ width: `${item.width}%` }"
        role="presentation"
        :aria-label="`${item.status} ${Math.round(item.width)}%`"
      />
    </div>
    <ul class="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
      <li
        v-for="item in segments"
        :key="`${item.status}-legend`"
        class="flex items-center justify-between"
      >
        <span class="flex items-center gap-2 capitalize">
          <span
            :class="
              cn(
                'inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r',
                STATUS_COLORS[item.status] ??
                  'from-slate-300/80 to-slate-400/80',
              )
            "
          />
          {{ item.status }}
        </span>
        <span class="font-semibold text-slate-700">
          {{ item.count }}
          <span class="font-normal text-slate-500">
            ({{ item.roundedWidth }}%)
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
