import { createRouter, createWebHashHistory } from 'vue-router';

import DashboardPage from '@/pages/DashboardPage.vue';
import TransactionEntryPage from '@/pages/TransactionEntryPage.vue';
import PlanningPage from '@/pages/PlanningPage.vue';
import SettingsPage from '@/pages/SettingsPage.vue';
export const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: TransactionEntryPage,
  },
  // Entry and History are one page now. Keep the old paths alive for bookmarked
  // hash URLs.
  {
    path: '/entry',
    redirect: '/transactions',
  },
  {
    path: '/history',
    redirect: '/transactions',
  },
  {
    path: '/planning',
    name: 'Planning',
    component: PlanningPage,
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/pages/ReportPage.vue'),
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
