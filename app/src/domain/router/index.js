import { createRouter, createWebHashHistory } from 'vue-router';

import NewEntry from '@/components/NewEntry.vue';

const routes = [
  {
    path: '/',
    component: NewEntry,
  },
];

const router = new createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
