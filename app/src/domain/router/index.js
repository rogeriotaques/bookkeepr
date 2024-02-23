import { createRouter, createWebHashHistory } from 'vue-router';

import NewEntryPage from '@/pages/NewEntryPage.vue';
import ReportPage from '@/pages/ReportPage.vue';
import SettingsPage from '@/pages/SettingsPage.vue';

const routes = [
  {
    path: '/',
    component: NewEntryPage,
  },
  {
    path: '/report',
    component: ReportPage,
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
];

const router = new createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
