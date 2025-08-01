<template>
  <span
    :class="{
      'text-red': change < 0,
      'text-green': change > 0,
    }"
  >
    {{ (change * 100).toFixed(0) }}%
    <v-icon v-if="change > 0" icon="mdi-arrow-top-right"></v-icon>
    <v-icon v-else-if="change < 0" icon="mdi-arrow-bottom-right"></v-icon>
  </span>
</template>

<script setup lang="ts">
const { change } = defineProps<{ change: number }>();
</script>
