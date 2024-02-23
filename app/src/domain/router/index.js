import { createRouter, createWebHashHistory } from 'vue-router';

import NewEntryPage from '@/pages/NewEntryPage.vue';

const routes = [
  {
    path: '/',
    component: NewEntryPage,
  },
];

const router = new createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
