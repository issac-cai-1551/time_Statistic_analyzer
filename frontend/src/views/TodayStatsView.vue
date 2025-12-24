<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getDailyStats, getRangeStats, type DailyStats, type RangeStats } from '../api/stats';
import StatsChart from '../components/StatsChart.vue';
import TimelineChart from '../components/TimelineChart.vue';

type StatsMode = 'daily' | 'range';
type ChartType = 'pie' | 'timeline';

const mode = ref<StatsMode>('daily');
const chartType = ref<ChartType>('pie');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const startDate = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 7 days ago
const endDate = ref(new Date().toISOString().split('T')[0]);

const stats = ref<DailyStats | RangeStats | null>(null);
const loading = ref(false);

// Check if stats has records (DailyStats)
const dailyRecords = computed(() => {
  if (mode.value === 'daily' && stats.value && 'records' in stats.value) {
    return (stats.value as DailyStats).records;
  }
  return [];
});

const fetchStats = async () => {
  loading.value = true;
  stats.value = null;
  try {
    if (mode.value === 'daily') {
      stats.value = await getDailyStats(selectedDate.value);
    } else {
      stats.value = await getRangeStats(startDate.value, endDate.value);
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const chartTitle = computed(() => {
  if (mode.value === 'daily') return `Breakdown for ${selectedDate.value}`;
  return `Breakdown from ${startDate.value} to ${endDate.value}`;
});

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="stats-view">
    <h1>Statistics</h1>
    
    <div class="controls">
      <div class="mode-selector">
        <label>
          <input type="radio" v-model="mode" value="daily" @change="fetchStats" /> Daily
        </label>
        <label>
          <input type="radio" v-model="mode" value="range" @change="fetchStats" /> Range
        </label>
      </div>

      <div class="date-inputs">
        <template v-if="mode === 'daily'">
          <input type="date" v-model="selectedDate" @change="fetchStats" />
        </template>
        <template v-else>
          <input type="date" v-model="startDate" @change="fetchStats" />
          <span>to</span>
          <input type="date" v-model="endDate" @change="fetchStats" />
        </template>
        <button @click="fetchStats">Refresh</button>
      </div>
    </div>
    
    <div v-if="loading">Loading...</div>
    
    <div v-else-if="stats" class="stats-content">
      <div class="summary">
        <p>Total Time: {{ stats.total_hours }} hours ({{ stats.total_minutes }} mins)</p>
      </div>

      <div class="chart-controls" v-if="mode === 'daily'">
        <button :class="{ active: chartType === 'pie' }" @click="chartType = 'pie'">Pie Chart</button>
        <button :class="{ active: chartType === 'timeline' }" @click="chartType = 'timeline'">Timeline</button>
      </div>
      
      <StatsChart v-if="chartType === 'pie' || mode === 'range'" :data="stats.breakdown" :title="chartTitle" />
      
      <div v-if="mode === 'daily' && chartType === 'timeline' && dailyRecords.length > 0" class="timeline-section">
        <TimelineChart :records="dailyRecords" />
      </div>
      <div v-else-if="mode === 'daily' && chartType === 'timeline' && dailyRecords.length === 0">
        <p>No records found for this day.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view {
  padding: 20px;
}
.chart-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}
.chart-controls button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 4px;
}
.chart-controls button.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}
.controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #8e4949;
  border-radius: 8px;
}
.mode-selector {
  margin-bottom: 10px;
  display: flex;
  gap: 15px;
}
.date-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}
.summary {
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: bold;
}
.timeline-section {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
</style>
