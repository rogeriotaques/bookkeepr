import { createRouter, createWebHashHistory } from 'vue-router';

import DashboardPage from '@/pages/DashboardPage.vue';
import TransactionEntryPage from '@/pages/TransactionEntryPage.vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';
import PlanningPage from '@/pages/PlanningPage.vue';
import SettingsPage from '@/pages/SettingsPage.vue';

export const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/entry',
    name: 'Entry',
    component: TransactionEntryPage,
  },
  {
    path: '/history',
    name: 'History',
    component: TransactionHistoryPage,
  },
  {
    path: '/planning',
    name: 'Planning',
    component: PlanningPage,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    children: [
      {
        path: '',
        redirect: '/settings/groups',
      },
      {
        path: 'groups',
        name: 'SettingsGroups',
        component: () => import('@/pages/SettingsGroupsPage.vue'),
      },
      {
        path: 'wallets',
        name: 'SettingsWallets',
        component: () => import('@/pages/SettingsWalletsPage.vue'),
      },
      {
        path: 'advanced',
        name: 'SettingsAdvanced',
        component: () => import('@/pages/SettingsAdvancedPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  },
});

export default router;
