<script setup lang="ts">
import TimerControl from '../components/TimerControl.vue';
import { useUIStore } from '../stores/uiStore';

const uiStore = useUIStore();
</script>

<template>
  <div class="timer-view" :class="{ 'mini-mode': uiStore.isMiniMode }">
    <h1 v-if="!uiStore.isMiniMode">Timer</h1>
    <TimerControl />
  </div>
</template>

<style scoped>
.timer-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.timer-view.mini-mode {
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
