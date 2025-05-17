<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-vue-next";
import { useSidebar } from "./utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const { setOpenMobile, isMobile } = useSidebar();

function openMobileSidebar() {
  setOpenMobile(true);
}
</script>

<template>
  <Button
    v-if="isMobile"
    data-sidebar="mobile-trigger"
    data-slot="mobile-sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('fixed top-4 left-4 z-50 md:hidden', props.class)"
    @click="openMobileSidebar"
  >
    <Menu />
    <span class="sr-only">Open Sidebar</span>
  </Button>
</template>
