<script setup lang="ts">
import TimerControl from '../components/TimerControl.vue';
</script>

<template>
  <div class="timer-view">
    <h1>Timer</h1>
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
</style>
