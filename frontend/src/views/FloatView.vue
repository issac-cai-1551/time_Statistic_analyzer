<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useTimerStore } from '../stores/timerStore';
import { useCategoryStore } from '../stores/categoryStore';
import { ipcRenderer } from 'electron';

const timerStore = useTimerStore();
const categoryStore = useCategoryStore();

const elapsedTime = computed(() => {
  if (!timerStore.startTime) return '00:00:00';
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(timerStore.startTime).getTime()) / 1000);
  const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const seconds = (diff % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
});

const currentCategory = computed(() => {
  return categoryStore.getCategoryByKey(timerStore.currentCategoryKey || '');
});

const bgColor = computed(() => {
  // If category is explicitly 'uncategorized', use default style
  if (currentCategory.value?.key === 'uncategorized') {
    return '#36628b';
  }
  return currentCategory.value?.color || '#36628b';
});

let intervalId: number | null = null;

const updateTime = () => {
  // Trigger reactivity
  timerStore.fetchCurrentSession(); 
  // Actually fetchCurrentSession is async and might be too heavy for 1s interval if it hits DB.
  // But timerStore.startTime is state. We just need to force re-calc of elapsedTime.
  // elapsedTime is a computed property depending on timerStore.startTime.
  // We need a local ticker to force update if startTime doesn't change but "now" does.
  // Actually, computed properties don't auto-update on "new Date()" unless a dependency changes.
  // So we need a ref that updates every second.
};

import { ref } from 'vue';
const now = ref(new Date());

onMounted(async () => {
  // Ensure transparent background for the window
  document.documentElement.style.backgroundColor = 'transparent';
  document.body.style.backgroundColor = 'transparent';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.minWidth = '0';
  document.body.style.minHeight = '0';
  document.body.style.display = 'block'; // Reset flex centering from global style

  await Promise.all([
    timerStore.fetchCurrentSession(),
    categoryStore.fetchCategories()
  ]);

  intervalId = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const displayTime = computed(() => {
  if (!timerStore.startTime) return '00:00:00';
  // Use `now.value` to trigger reactivity
  const diff = Math.floor((now.value.getTime() - new Date(timerStore.startTime).getTime()) / 1000);
  const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const seconds = (diff % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
});

const restoreWindow = () => {
  ipcRenderer.invoke('switch-to-main');
};

const toggleTimer = async () => {
  if (timerStore.isRunning) {
    await timerStore.stop();
  } else {
    // Start with current category or default?
    // If we are in float mode, maybe we just want to stop/resume.
    // If stopped, we might not have a category selected in this view.
    // Let's assume we resume or start uncategorized if none.
    await timerStore.start(timerStore.currentCategoryKey || undefined);
  }
};
</script>

<template>
  <div class="float-container">
    <div class="float-ball" :style="{ backgroundColor: bgColor }">
      <div class="content">
        <div class="category-name">{{ currentCategory?.name || 'Timer' }}</div>
        <div class="time">{{ displayTime }}</div>
        <div class="controls">
          <button class="icon-btn" @click.stop="toggleTimer" :title="timerStore.isRunning ? 'Stop' : 'Start'">
            {{ timerStore.isRunning ? '■' : '▶' }}
          </button>
          <button class="icon-btn" @click.stop="restoreWindow" title="Expand">
            ⤢
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.float-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.float-ball {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  border: 2px solid rgba(255,255,255,0.2);
  box-sizing: border-box;
  -webkit-app-region: drag; /* Make the ball draggable */
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.category-name {
  font-size: 0.8rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.controls {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.icon-btn {
  -webkit-app-region: no-drag; /* Allow clicking */
  background: rgba(0,0,0,0.2);
  border: none;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(0,0,0,0.4);
}
</style>
