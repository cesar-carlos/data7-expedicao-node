import { createPinia } from 'pinia';
import { Notify, Dialog, Quasar } from 'quasar';
import quasarLang from 'quasar/lang/pt-BR';
import { createApp } from 'vue';

import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

import App from './app/App.vue';
import { router } from './app/router';
import { Spacing } from './app/spacing';
import './app/app.sass';

Spacing.install();

createApp(App)
  .use(createPinia())
  .use(router)
  .use(Quasar, {
    lang: quasarLang,
    plugins: { Dialog, Notify },
    config: {
      dark: false,
    },
  })
  .mount('#app');
