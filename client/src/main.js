import { createApp, h } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import router from "./router";
import paper from "paper";
import FloatingVue from 'floating-vue'
import {LoadingPlugin} from "vue-loading-overlay";
import Vue3TouchEvents from "vue3-touch-events";
import VueSocketIO from "vue-3-socket.io-ext";
import Unlazy from '@unlazy/vue';

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import 'vue-toast-notification/dist/theme-bootstrap.css';
import 'vue-loading-overlay/dist/css/index.css';
import 'floating-vue/dist/style.css';


const socketio = new VueSocketIO({
  debug: true,
  connection: window.location.origin,
});

const app = createApp({
  render: () => h(App),
});

app.use(createPinia());
app.use(FloatingVue);
app.use(router);
app.use(socketio);
app.use(Unlazy);
app.use(LoadingPlugin);

app.mount("#app");
