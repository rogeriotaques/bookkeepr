import { createApp, h, Suspense } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import Toast from 'vue-toastification';
import VMoney from 'v-money';

import '@/styles/bookkeepr.scss';
import '@/styles/popper.scss';
import 'vue-toastification/dist/index.css';

import { TOAST_BASE_SETTINGS } from '@/domain/constants';
import router from '@/domain/router';
import App from '@/App.vue';

const Wrapper = {
  render() {
    return h(Suspense, null, { default: () => h(App) });
  },
};

const app = createApp(Wrapper);

app.use(VMoney);
app.use(Toast, TOAST_BASE_SETTINGS);
app.use(VueQueryPlugin);
app.use(router);

app.mount('#app');
