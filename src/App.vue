<template>
  <router-view />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const score = ref(0);
const lastRoll = ref<number[]>([]);

function rollDice() {
  // simple example: roll six dice, add sum to score
  lastRoll.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
  score.value += lastRoll.value.reduce((s, v) => s + v, 0);
}

function reset() {
  score.value = 0;
  lastRoll.value = [];
}
</script>

<style>
/* global app styles (optional) */
body { margin: 0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
#app { font-family: system-ui, Arial, sans-serif; padding: 1rem; max-width: 720px; margin: 0 auto; }
.game { margin-top: 1rem; }
.controls button { margin-right: 0.5rem; }
</style>