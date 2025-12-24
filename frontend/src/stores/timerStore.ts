import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCurrentSession, startTimer, stopTimer, updateCurrentSession, type TimerSession } from '../api/timer';
import { ipcRenderer } from 'electron';

export const useTimerStore = defineStore('timer', () => {
  const session = ref<TimerSession | null>(null);
  const isRunning = computed(() => !!session.value);
  const startTime = computed(() => session.value ? new Date(session.value.start_time) : null);
  const currentCategoryKey = computed(() => session.value?.category_key);

  // Listen for updates from other windows
  ipcRenderer.on('timer-update', () => {
    fetchCurrentSession();
  });

  async function fetchCurrentSession() {
    try {
      session.value = await getCurrentSession();
    } catch (error) {
      console.error("Failed to fetch session", error);
      session.value = null;
    }
  }

  async function start(categoryKey?: string) {
    try {
      session.value = await startTimer(categoryKey);
      ipcRenderer.send('timer-change');
    } catch (error) {
      console.error("Failed to start timer", error);
      throw error;
    }
  }

  async function stop() {
    try {
      const record = await stopTimer();
      session.value = null;
      ipcRenderer.send('timer-change');
      return record;
    } catch (error) {
      console.error("Failed to stop timer", error);
      throw error;
    }
  }

  async function updateCategory(categoryKey: string) {
    try {
      session.value = await updateCurrentSession(categoryKey);
      ipcRenderer.send('timer-change');
    } catch (error) {
      console.error("Failed to update session category", error);
      throw error;
    }
  }

  return {
    session,
    isRunning,
    startTime,
    currentCategoryKey,
    fetchCurrentSession,
    start,
    stop,
    updateCategory
  };
});
