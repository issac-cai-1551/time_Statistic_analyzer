import { createRouter, createWebHashHistory } from 'vue-router';
import TimerView from '../views/TimerView.vue';
import TodayStatsView from '../views/TodayStatsView.vue';
import CategoryManageView from '../views/CategoryManageView.vue';
import FloatView from '../views/FloatView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'timer',
      component: TimerView
    },
    {
      path: '/stats',
      name: 'stats',
      component: TodayStatsView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoryManageView
    },
    {
      path: '/float',
      name: 'float',
      component: FloatView
    }
  ]
});

export default router;
