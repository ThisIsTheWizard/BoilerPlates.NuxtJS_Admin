<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { MoreVertical } from "lucide-vue-next";

import Button from "@/components/ui/Button.vue";

const props = defineProps<{
  preferredPlacement?: "up" | "down";
}>();

const emit = defineEmits<{
  update: [];
  updateRoles: [];
  changeStatus: [];
  changePassword: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const open = ref(false);
const placement = ref<"up" | "down">(props.preferredPlacement ?? "down");
const menuCoords = ref<{ top: number; right: number } | null>(null);
const menuId = `user-actions-menu-${Math.random().toString(36).slice(2, 9)}`;

const isOpen = computed(() => open.value);

const evaluatePlacement = () => {
  if (!open.value) return;
  if (!containerRef.value || !menuRef.value) return;

  const triggerRect = containerRef.value.getBoundingClientRect();
  const menuRect = menuRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const padding = 12;

  let nextPlacement = props.preferredPlacement ?? "down";

  if (spaceBelow < menuRect.height && spaceAbove >= menuRect.height) {
    nextPlacement = "up";
  } else if (spaceBelow >= menuRect.height) {
    nextPlacement = "down";
  } else if (spaceAbove > spaceBelow) {
    nextPlacement = "up";
  } else {
    nextPlacement = "down";
  }

  const top =
    nextPlacement === "up"
      ? Math.max(padding, triggerRect.top - menuRect.height - padding)
      : Math.min(
          window.innerHeight - menuRect.height - padding,
          triggerRect.bottom + padding,
        );

  const right = Math.max(
    padding,
    window.innerWidth - triggerRect.right - padding,
  );

  placement.value = nextPlacement;
  menuCoords.value = { top, right };
};

const closeMenu = () => {
  open.value = false;
};

const handleOutsideClick = (event: MouseEvent) => {
  if (!open.value) return;
  const target = event.target as Node;
  if (
    containerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return;
  }
  closeMenu();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!open.value) return;
  if (event.key === "Escape") {
    closeMenu();
  }
};

const setupListeners = () => {
  document.addEventListener("mousedown", handleOutsideClick);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", evaluatePlacement);
  window.addEventListener("scroll", evaluatePlacement, true);
};

const removeListeners = () => {
  document.removeEventListener("mousedown", handleOutsideClick);
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", evaluatePlacement);
  window.removeEventListener("scroll", evaluatePlacement, true);
};

watch(open, async (next, prev) => {
  if (next === prev) return;
  if (next) {
    await nextTick();
    evaluatePlacement();
    setupListeners();
  } else {
    menuCoords.value = null;
    placement.value = props.preferredPlacement ?? "down";
    removeListeners();
  }
});

watch(
  () => props.preferredPlacement,
  (next) => {
    if (!open.value) {
      placement.value = next ?? "down";
    }
  },
);

onMounted(() => {
  if (open.value) {
    setupListeners();
  }
});

onUnmounted(() => {
  removeListeners();
});

const toggleMenu = async () => {
  open.value = !open.value;
};

const handleAction = (
  eventName: "update" | "updateRoles" | "changeStatus" | "changePassword",
) => {
  closeMenu();
  switch (eventName) {
    case "update":
      emit("update");
      break;
    case "updateRoles":
      emit("updateRoles");
      break;
    case "changeStatus":
      emit("changeStatus");
      break;
    case "changePassword":
      emit("changePassword");
      break;
  }
};
</script>

<template>
  <div
    ref="containerRef"
    class="relative inline-flex items-center justify-end overflow-visible"
  >
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      :aria-controls="menuId"
      @click="toggleMenu"
    >
      <MoreVertical class="h-4 w-4" aria-hidden="true" />
      <span class="sr-only">Open actions</span>
    </Button>
    <Teleport to="body">
      <Transition
        enter-active-class="duration-100 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          :id="menuId"
          ref="menuRef"
          role="menu"
          :data-placement="placement"
          class="z-50 w-44 rounded-2xl border border-white/40 bg-white/95 p-1.5 text-left shadow-xl backdrop-blur"
          :style="{
            position: 'fixed',
            top: menuCoords?.top ? `${menuCoords.top}px` : undefined,
            right: menuCoords?.right ? `${menuCoords.right}px` : undefined,
            visibility: menuCoords ? 'visible' : 'hidden',
          }"
        >
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80"
            @click="handleAction('update')"
          >
            Update user
          </button>
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80"
            @click="handleAction('updateRoles')"
          >
            Update roles
          </button>
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80"
            @click="handleAction('changeStatus')"
          >
            Update status
          </button>
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100/80"
            @click="handleAction('changePassword')"
          >
            Update password
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
