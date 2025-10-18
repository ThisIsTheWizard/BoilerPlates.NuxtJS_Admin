<script setup lang="ts">

import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const props = defineProps<{
  onNavigate?: () => void;
}>();

const route = useRoute();

const handleNavigate = () => {
  props.onNavigate?.();
};

const isActive = (path: string) => {
  if (!path) return false;
  if (route.path === path) return true;
  return path !== "/" && route.path.startsWith(path);
};
</script>

<template>
  <nav class="space-y-1">
    <NuxtLink
      v-for="item in NAV_ITEMS"
      :key="item.title"
      :to="item.to"
      @click="handleNavigate"
      :class="
        cn(
          'group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive(item.to)
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      "
    >
      <span
        :class="
          cn(
            'flex items-center gap-3',
            isActive(item.to)
              ? 'text-white'
              : 'text-slate-600 group-hover:text-slate-900',
          )
        "
      >
        <component
          :is="item.icon"
          :class="
            cn(
              'h-4 w-4 transition',
              isActive(item.to)
                ? 'text-white'
                : 'text-slate-400 group-hover:text-slate-900',
            )
          "
        />
        {{ item.title }}
      </span>
      <span
        v-if="item.badge"
        :class="
          cn(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
            isActive(item.to)
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 text-slate-700 group-hover:bg-slate-900 group-hover:text-white',
          )
        "
      >
        {{ item.badge }}
      </span>
    </NuxtLink>
  </nav>
</template>
