<script setup lang="ts">
import { computed, getCurrentInstance, ref } from "vue";

type MiniAreaPoint = {
  label: string;
  value: number;
};

const props = defineProps<{
  data: MiniAreaPoint[];
}>();

const hoverIndex = ref<number | null>(null);
const instance = getCurrentInstance();
const gradientId = `mini-area-${instance?.uid ?? Math.random().toString(36).slice(2)}`;

const safeData = computed<MiniAreaPoint[]>(() => {
  if (props.data.length > 0) {
    return props.data;
  }
  return [
    { label: "N/A", value: 0 },
    { label: "N/A", value: 0 },
  ];
});

const maxValue = computed(() =>
  Math.max(
    1,
    ...safeData.value.map((point) =>
      Number.isFinite(point.value) ? point.value : 0,
    ),
  ),
);

const pointCoords = computed(() =>
  safeData.value.map((point, index) => {
    const length = safeData.value.length;
    const x = length === 1 ? 100 : (index / (length - 1)) * 100;
    const normalizedY =
      maxValue.value === 0
        ? 100
        : 100 - (Math.max(point.value, 0) / maxValue.value) * 80;
    const y = Math.min(95, Math.max(5, normalizedY));
    return { x, y };
  }),
);

const svgPoints = computed(() =>
  pointCoords.value.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`),
);

const areaPoints = computed(
  () => ["0,100", ...svgPoints.value, "100,100"].join(" "),
);

const hoveredPoint = computed(() =>
  hoverIndex.value === null ? null : safeData.value[hoverIndex.value] ?? null,
);

const hoveredCoords = computed(() =>
  hoverIndex.value === null ? null : pointCoords.value[hoverIndex.value] ?? null,
);

const setHover = (index: number | null) => {
  hoverIndex.value = index;
};

const resetHover = () => {
  hoverIndex.value = null;
};

</script>

<template>
  <div
    class="relative flex h-48 w-full flex-col gap-3 pb-3"
    v-bind="$attrs"
    @mouseleave="resetHover"
  >
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="h-full w-full overflow-visible rounded-3xl border border-white/40 bg-white/40 shadow-inner backdrop-blur"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(15,23,42,0.5)" />
          <stop offset="100%" stop-color="rgba(15,23,42,0)" />
        </linearGradient>
      </defs>
      <polygon :points="areaPoints" :fill="`url(#${gradientId})`" opacity="0.9" />
      <polyline
        :points="svgPoints.join(' ')"
        fill="none"
        stroke="rgba(15,23,42,0.75)"
        stroke-width="1.6"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle
        v-for="(point, index) in safeData"
        :key="`${point.label}-${index}`"
        :cx="pointCoords[index]?.x ?? 0"
        :cy="pointCoords[index]?.y ?? 0"
        :r="hoverIndex === index ? 2.6 : 1.8"
        fill="rgba(15,23,42,0.9)"
        :tabindex="0"
        @mouseenter="setHover(index)"
        @mouseleave="resetHover"
        @focus="setHover(index)"
        @blur="resetHover"
      />
    </svg>
    <div v-if="hoveredPoint && hoveredCoords" class="pointer-events-none absolute inset-0">
      <div
        class="absolute flex flex-col items-center"
        :style="{
          left: `${hoveredCoords.x}%`,
          top: `${hoveredCoords.y}%`,
          transform: 'translate(-50%, calc(-100% - 8px))',
        }"
      >
        <div
          class="rounded-md bg-slate-900/90 px-2 py-1 text-[10px] font-semibold text-white shadow-lg"
        >
          {{ hoveredPoint.label }}: {{ hoveredPoint.value }}
        </div>
        <span class="mt-1 inline-block h-2 w-0.5 rounded-full bg-slate-900/60" />
      </div>
    </div>
    <div
      class="flex justify-between gap-2 text-xs font-medium uppercase tracking-wide text-slate-500"
    >
      <span v-for="point in safeData" :key="`${point.label}-label`" class="flex-1 text-center">
        {{ point.label }}
      </span>
    </div>
  </div>
</template>
