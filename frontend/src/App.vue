<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Timer</RouterLink>
      <RouterLink to="/stats">Stats</RouterLink>
      <RouterLink to="/categories">Categories</RouterLink>
    </nav>
  </header>

  <main>
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
</style>
