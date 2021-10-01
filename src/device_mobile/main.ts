import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import languages from "../languages";
import { createI18n } from "vue-i18n";
import { DEFAULT_LANG } from "@/constants";
import { useLocalStorage } from "@vueuse/core";
import "viewerjs/dist/viewer.css";
import VueViewer from "v-viewer";
const mobileApp = createApp(App);
mobileApp.use(VueViewer);
// 注意 是响应式的
const storageLocale = useLocalStorage("locale", DEFAULT_LANG);
export const i18n = createI18n({
  messages: languages,
  locale: storageLocale.value,
  fallbackLocale: DEFAULT_LANG,
});
mobileApp.use(i18n);

import {
  Button,
  Form,
  Field,
  CellGroup,
  Cell,
  Icon,
  Tag,
  Checkbox,
  CheckboxGroup,
  Popup,
  Cascader,
  Empty,
  ActionSheet,
  DropdownMenu,
  DropdownItem,
  Loading,
} from "vant";
mobileApp
  .use(Button)
  .use(Form)
  .use(Field)
  .use(CellGroup)
  .use(Cell)
  .use(Icon)
  .use(Tag)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(Popup)
  .use(Cascader)
  .use(Empty)
  .use(ActionSheet)
  .use(DropdownMenu)
  .use(DropdownItem)
  .use(Loading);

mobileApp.use(createPinia()).use(router).mount("#app");

export default mobileApp;
