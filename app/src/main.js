import { createApp } from 'vue';

import './bookkeepr.scss';

import router from './domain/router';
import App from './App.vue';

createApp(App).use(router).mount('#app');
