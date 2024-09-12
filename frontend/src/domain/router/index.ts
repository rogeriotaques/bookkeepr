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
    children: [
      {
        path: '',
        redirect: '/settings/groups',
      },
      {
        path: 'groups',
        component: () => import('@/pages/SettingsGroupsPage.vue'),
      },
      {
        path: 'wallets',
        component: () => import('@/pages/SettingsWalletsPage.vue'),
      },
      {
        path: 'advanced',
        component: () => import('@/pages/SettingsAdvancedPage.vue'),
      },
    ],
  },
];

const router = new createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;
