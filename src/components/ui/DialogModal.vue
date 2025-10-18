<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  open: boolean;
  title: string | unknown;
  description?: string;
  maxWidthClass?: string;
  closeOnBackdrop?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isOpen = computed(() => props.open);
const instanceId = Math.random().toString(36).slice(2, 9);
const titleId = `dialog-title-${instanceId}`;
const descriptionId = `dialog-description-${instanceId}`;

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

onMounted(() => {
  if (isOpen.value) {
    document.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

watch(
  () => props.open,
  (next, prev) => {
    if (next && !prev) {
      document.addEventListener("keydown", handleKeydown);
    } else if (!next && prev) {
      document.removeEventListener("keydown", handleKeydown);
    }
  },
);

const handleBackdropClick = () => {
  if (props.closeOnBackdrop === false) return;
  emit("close");
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4 py-6 backdrop-blur-sm"
        @mousedown.self="handleBackdropClick"
      >
        <Transition
          appear
          enter-active-class="duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="isOpen"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="description ? descriptionId : undefined"
            class="w-full rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur"
            :class="maxWidthClass ?? 'max-w-lg'"
            @mousedown.stop
          >
            <div class="space-y-4">
              <div class="space-y-1">
                <div :id="titleId" class="text-lg font-semibold text-slate-900">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </div>
                <p
                  v-if="description"
                  :id="descriptionId"
                  class="text-sm text-slate-600"
                >
                  {{ description }}
                </p>
              </div>
              <div>
                <slot />
              </div>
            </div>
            <div
              v-if="$slots.footer"
              class="mt-6 flex items-center justify-end gap-2"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
