<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getCategories, createCategory, deleteCategory, updateCategory, type Category } from '../api/category';
import { ipcRenderer } from 'electron';

const categories = ref<Category[]>([]);
const newCategory = ref({ key: '', name: '', color: '#000000' });
const showInactive = ref(true);

// Edit state
const editingId = ref<number | null>(null);
const editForm = ref({ name: '', color: '#000000' });

const filteredCategories = computed(() => {
  if (showInactive.value) return categories.value;
  return categories.value.filter(c => c.is_active);
});

const fetchCategories = async () => {
  const result = await getCategories(false); // Get all, including inactive
  categories.value = result.sort((a, b) => {
    if (a.is_active === b.is_active) return 0;
    return a.is_active ? -1 : 1;
  });
};

const handleCreate = async () => {
  if (!newCategory.value.key || !newCategory.value.name) return;
  try {
    await createCategory(newCategory.value);
    newCategory.value = { key: '', name: '', color: '#000000' };
    await fetchCategories();
    ipcRenderer.send('category-change');
  } catch (e) {
    alert('Failed to create category (Key might be duplicate)');
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to deactivate this category?')) return;
  await deleteCategory(id);
  await fetchCategories();
  ipcRenderer.send('category-change');
};

const startEdit = (cat: Category) => {
  editingId.value = cat.id;
  editForm.value = { name: cat.name, color: cat.color || '#000000' };
};

const cancelEdit = () => {
  editingId.value = null;
};

const handleUpdate = async (id: number) => {
  try {
    await updateCategory(id, editForm.value);
    editingId.value = null;
    await fetchCategories();
    ipcRenderer.send('category-change');
  } catch (e) {
    alert('Failed to update category');
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="category-view">
    <h1>Manage Categories</h1>
    
    <div class="filter-controls">
      <label>
        <input type="checkbox" v-model="showInactive"> Show Inactive Categories
      </label>
    </div>

    <div class="create-form">
      <input v-model="newCategory.key" placeholder="Key (e.g. work)" />
      <input v-model="newCategory.name" placeholder="Name (e.g. Work)" />
      <input type="color" v-model="newCategory.color" />
      <button @click="handleCreate">Add Category</button>
    </div>
    
    <ul class="category-list">
      <li v-for="cat in filteredCategories" :key="cat.id" :class="{ inactive: !cat.is_active }">
        <!-- Edit Mode -->
        <template v-if="editingId === cat.id">
          <input type="color" v-model="editForm.color" />
          <input v-model="editForm.name" placeholder="Name" />
          <span class="info">({{ cat.key }})</span>
          <div class="actions">
            <button @click="handleUpdate(cat.id)">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </div>
        </template>
        
        <!-- View Mode -->
        <template v-else>
          <span class="color-dot" :style="{ backgroundColor: cat.color }"></span>
          <span class="info">{{ cat.name }} ({{ cat.key }})</span>
          <span v-if="!cat.is_active" class="status">(Inactive)</span>
          <div class="actions">
            <button v-if="cat.is_active" @click="startEdit(cat)">Edit</button>
            <button v-if="cat.is_active" @click="handleDelete(cat.id)">Deactivate</button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.category-view {
  padding: 20px;
}
.filter-controls {
  margin-bottom: 15px;
}
.create-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.category-list {
  list-style: none;
  padding: 0;
}
.category-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}
.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.inactive {
  opacity: 0.6;
}
.actions {
  margin-left: auto;
  display: flex;
  gap: 5px;
}
</style>
