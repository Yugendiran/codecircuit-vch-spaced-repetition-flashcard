<template>
  <div
    class="relative w-full h-5 rounded-full bg-neutral-800/80 overflow-hidden backdrop-blur-sm border border-neutral-700/30"
  >
    <!-- Main progress fill -->
    <div
      class="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 transition-all duration-300 ease-out"
      :style="{ width: `${value}%` }"
    >
      <!-- Pulse effect at the leading edge -->
      <div class="absolute right-0 top-0 h-full w-3 bg-white/30 blur-sm"></div>
    </div>

    <!-- Animated shimmer effect -->
    <div v-if="value < 100" class="absolute top-0 left-0 h-full w-full">
      <div class="h-full w-24 bg-white/10 skew-x-30 animate-shimmer"></div>
    </div>

    <!-- Glow dots -->
    <div
      v-for="i in 5"
      :key="i"
      class="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-purple-300/80 blur-[1px]"
      :style="{
        left: `${i * 20}%`,
        opacity: value >= i * 20 ? '1' : '0.2',
        transform:
          value >= i * 20
            ? 'translateY(-50%) scale(1.5)'
            : 'translateY(-50%) scale(1)',
      }"
    ></div>

    <!-- Value percentage -->
    <div class="absolute inset-0 flex items-center justify-end pr-2">
      <span
        v-if="value >= 10"
        class="text-white text-xs font-medium relative z-10"
        >{{ Math.round(value) }}%</span
      >
    </div>

    <!-- Pulsing background when complete -->
    <div
      v-if="value >= 100"
      class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 animate-pulse-fast"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style scoped>
.skew-x-30 {
  transform: skewX(30deg);
}

@keyframes shimmer {
  0% {
    transform: translateX(-150%) skewX(30deg);
  }
  100% {
    transform: translateX(450%) skewX(30deg);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

@keyframes pulse-fast {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-fast {
  animation: pulse-fast 1.5s infinite ease-in-out;
}
</style>
