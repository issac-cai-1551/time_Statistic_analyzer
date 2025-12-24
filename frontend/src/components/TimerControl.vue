<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useTimerStore } from '../stores/timerStore';
import CategorySelect from './CategorySelect.vue';

const timerStore = useTimerStore();
const elapsedTime = ref('00:00:00');
let intervalId: number | null = null;

const selectedCategory = ref<string>('');

// Sync local category with store
watch(() => timerStore.currentCategoryKey, (newKey) => {
  if (newKey) selectedCategory.value = newKey;
  else selectedCategory.value = '';
});

const updateElapsedTime = () => {
  if (!timerStore.startTime) {
    elapsedTime.value = '00:00:00';
    return;
  }
  const now = new Date();
  const diff = Math.floor((now.getTime() - timerStore.startTime.getTime()) / 1000);
  
  const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const seconds = (diff % 60).toString().padStart(2, '0');
  
  elapsedTime.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(async () => {
  await timerStore.fetchCurrentSession();
  if (timerStore.isRunning) {
    intervalId = setInterval(updateElapsedTime, 1000);
    updateElapsedTime();
  }
});

watch(() => timerStore.isRunning, (isRunning) => {
  if (isRunning) {
    if (!intervalId) intervalId = setInterval(updateElapsedTime, 1000);
    updateElapsedTime();
  } else {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    elapsedTime.value = '00:00:00';
    selectedCategory.value = ''; // Reset selection on stop
  }
});

const handleStart = async () => {
  await timerStore.start(selectedCategory.value || undefined);
};

const handleStop = async () => {
  await timerStore.stop();
};

const handleCategoryChange = async (newKey: string) => {
  selectedCategory.value = newKey;
  if (timerStore.isRunning) {
    await timerStore.updateCategory(newKey);
  }
};
</script>

<template>
  <div class="timer-control">
    <div class="time-display">{{ elapsedTime }}</div>
    
    <div class="controls">
      <CategorySelect 
        :modelValue="selectedCategory" 
        @update:modelValue="handleCategoryChange"
      />
      
      <button v-if="!timerStore.isRunning" @click="handleStart" class="btn start">Start</button>
      <button v-else @click="handleStop" class="btn stop">Stop</button>
    </div>
  </div>
</template>

<style scoped>
.timer-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #36628b;
}

.time-display {
  font-size: 3rem;
  font-family: monospace;
  font-weight: bold;
  background-color: #36628b;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  color: white;
}

.start {
  background-color: #4caf50;
}

.stop {
  background-color: #f44336;
}
</style>
