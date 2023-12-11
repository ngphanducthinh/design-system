import { createApp } from 'vue';
import App from './App.vue';

// CSS
import '@/assets/styles/main.scss';
// Icons
import '7pmlabs-icons/style.css';
// Localizations
import i18n from '@/locales';

// Vue App
const app = createApp(App);
app.use(i18n);
app.mount('#app');
