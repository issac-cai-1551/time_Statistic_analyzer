<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { TimeRecord } from '../api/timer';

const props = defineProps<{
  records: TimeRecord[];
  title?: string;
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartContainer.value) return;
  
  chartInstance = echarts.init(chartContainer.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;
  
  // Sort records by start time
  const sortedRecords = [...props.records].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const data = sortedRecords.map(r => {
    const start = new Date(r.start_time);
    const end = new Date(r.end_time);
    return {
      name: r.category_name,
      value: [
        r.category_name,
        start,
        end,
        r.duration_seconds
      ],
      itemStyle: {
        color: r.category_color || '#ccc'
      }
    };
  });

  const categories = Array.from(new Set(sortedRecords.map(r => r.category_name)));

  const option = {
    title: {
      text: props.title || 'Timeline',
      left: 'center'
    },
    tooltip: {
      formatter: function (params: any) {
        const start = params.value[1].toLocaleTimeString();
        const end = params.value[2].toLocaleTimeString();
        const duration = Math.round(params.value[3] / 60);
        return `${params.name}<br/>${start} - ${end}<br/>${duration} mins`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: function (value: number) {
          return new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
      }
    },
    yAxis: {
      type: 'category',
      data: categories
    },
    series: [
      {
        type: 'custom',
        renderItem: function (params: any, api: any) {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;
          
          const rectShape = echarts.graphic.clipRectByRect({
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height
          }, {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height
          });

          return rectShape && {
            type: 'rect',
            transition: ['shape'],
            shape: rectShape,
            style: api.style()
          };
        },
        itemStyle: {
          opacity: 0.8
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: data
      }
    ]
  };

  chartInstance.setOption(option);
};

watch(() => props.records, () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});

const handleResize = () => {
  chartInstance?.resize();
};
</script>

<template>
  <div class="scroll-wrapper">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<style scoped>
.scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #eee;
}

.chart-container {
  width: 100%;
  min-width: 800px; /* Ensure minimum width for better visibility */
  height: 400px;
}
</style>
