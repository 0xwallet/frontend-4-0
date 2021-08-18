import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { Button } from "vant";
const mobileApp = createApp(App);

mobileApp.use(Button);

mobileApp.use(createPinia()).use(router).mount("#app");

export default mobileApp;
