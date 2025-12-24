import { createRouter, createWebHistory } from 'vue-router';
import TimerView from '../views/TimerView.vue';
import TodayStatsView from '../views/TodayStatsView.vue';
import CategoryManageView from '../views/CategoryManageView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    }
  ]
});

export default router;
