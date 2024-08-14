import { createApp } from 'vue';

import './styles/bookkeepr.scss';
import './styles/popper.scss';

import router from './domain/router';
import App from './App.vue';

createApp(App).use(router).mount('#app');
