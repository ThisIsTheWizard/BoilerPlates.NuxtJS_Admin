<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 p-10">
    <div
      class="flex h-full w-full items-center justify-center rounded-3xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur"
    >
      <Loader2 class="h-16 w-16 animate-spin text-slate-500" />
    </div>
  </div>
</template>
