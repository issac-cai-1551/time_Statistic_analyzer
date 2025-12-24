import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const isMiniMode = ref(false);

  function setMiniMode(value: boolean) {
    isMiniMode.value = value;
  }

  return {
    isMiniMode,
    setMiniMode
  };
});
