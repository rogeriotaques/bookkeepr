import { createApp } from 'vue';
import Popper from 'vue3-popper';

import './styles/bookkeepr.scss';
import './styles/popper.scss';

import router from './domain/router';
import App from './App.vue';

const app = createApp(App);

app.use(router);
app.component('Popper', Popper);

app.mount('#app');
