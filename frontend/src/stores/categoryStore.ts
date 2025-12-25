import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCategories, type Category } from '../api/category';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);

  async function fetchCategories(force = false) {
    if (!force && categories.value.length > 0) return; // Simple cache
    loading.value = true;
    try {
      categories.value = await getCategories(true);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      loading.value = false;
    }
  }

  const getCategoryByKey = computed(() => (key: string) => {
    return categories.value.find(c => c.key === key);
  });

  return {
    categories,
    loading,
    fetchCategories,
    getCategoryByKey
  };
});
