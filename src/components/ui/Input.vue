<script setup lang="ts">
import type { InputTypeHTMLAttribute } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    type?: InputTypeHTMLAttribute;
  }>(),
  {
    modelValue: null,
    type: "text",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  input: [event: Event];
  change: [event: Event];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
  emit("input", event);
};

const handleChange = (event: Event) => {
  emit("change", event);
};

const baseClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50";
</script>

<template>
  <input
    :type="props.type"
    :value="props.modelValue ?? ''"
    :class="baseClass"
    v-bind="$attrs"
    @input="handleInput"
    @change="handleChange"
  />
</template>
