import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';

import './styles/bookkeepr.scss';
import './styles/popper.scss';

import router from './domain/router';
import App from './App.vue';

const app = createApp(App);

app.use(VueQueryPlugin);
app.use(router);

app.mount('#app');
