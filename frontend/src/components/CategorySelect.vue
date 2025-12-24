<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCategories, type Category } from '../api/category';

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const categories = ref<Category[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    categories.value = await getCategories(true);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <select :value="modelValue" @change="handleChange" :disabled="disabled || loading" class="category-select">
    <option value="">Uncategorized</option>
    <option v-for="cat in categories" :key="cat.key" :value="cat.key">
      {{ cat.name }}
    </option>
  </select>
</template>

<style scoped>
.category-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
</style>
