<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue';
import { ipcRenderer } from 'electron';
import { useCategoryStore } from './stores/categoryStore';
import { useTimerStore } from './stores/timerStore';

const categoryStore = useCategoryStore();
const timerStore = useTimerStore();

onMounted(() => {
  ipcRenderer.on('category-update', () => {
    categoryStore.fetchCategories(true);
  });
  
  ipcRenderer.on('timer-update', () => {
    timerStore.fetchCurrentSession();
  });
});

onUnmounted(() => {
  ipcRenderer.removeAllListeners('category-update');
  ipcRenderer.removeAllListeners('timer-update');
});
</script>

<template>
  <!-- Only show header if NOT in float view. 
       Actually, float view is a separate window loading /#/float.
       But if we use the same App.vue, we need to hide header for /float route.
  -->
  <header v-if="$route.name !== 'float'">
    <nav>
      <RouterLink to="/">Timer</RouterLink>
      <RouterLink to="/stats">Stats</RouterLink>
      <RouterLink to="/categories">Categories</RouterLink>
    </nav>
  </header>

  <main :class="{ 'float-mode': $route.name === 'float' }">
    <RouterView />
  </main>
</template>

<style scoped>
header {
  background-color: #333;
  padding: 1rem;
}

nav {
  display: flex;
  gap: 20px;
  justify-content: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

nav a.router-link-active {
  color: #4caf50;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

main.float-mode {
  padding: 0;
  max-width: none;
  height: 100vh;
  width: 100vw;
  background: transparent; /* Important for transparent window */
  overflow: hidden;
}
</style>
