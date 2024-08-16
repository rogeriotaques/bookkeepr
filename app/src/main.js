import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import Toast from 'vue-toastification';

import '@/styles/bookkeepr.scss';
import '@/styles/popper.scss';
import 'vue-toastification/dist/index.css';

import { TOAST_BASE_SETTINGS } from '@/domain/constants';
import router from '@/domain/router';
import App from '@/App.vue';

const app = createApp(App);

app.use(Toast, TOAST_BASE_SETTINGS);
app.use(VueQueryPlugin);
app.use(router);

app.mount('#app');
