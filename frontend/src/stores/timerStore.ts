import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCurrentSession, startTimer, stopTimer, updateCurrentSession, type TimerSession } from '../api/timer';

export const useTimerStore = defineStore('timer', () => {
  const session = ref<TimerSession | null>(null);
  const isRunning = computed(() => !!session.value);
  const startTime = computed(() => session.value ? new Date(session.value.start_time) : null);
  const currentCategoryKey = computed(() => session.value?.category_key);

  // Elapsed time logic could be here or in the component. 
  // For simplicity, we'll just manage the session state here.

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
    } catch (error) {
      console.error("Failed to start timer", error);
      throw error;
    }
  }

  async function stop() {
    try {
      const record = await stopTimer();
      session.value = null;
      return record;
    } catch (error) {
      console.error("Failed to stop timer", error);
      throw error;
    }
  }

  async function updateCategory(categoryKey: string) {
    try {
      session.value = await updateCurrentSession(categoryKey);
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
