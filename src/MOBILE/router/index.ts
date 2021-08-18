import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
// layout
import LayoutIndex from "../Layouts/index.vue";
// pages
import Login from "../pages/Login/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    meta: {
      needAuth: false,
      title: "signIn",
    },
    component: Login,
  },
  {
    path: "/",
    component: LayoutIndex,
    children: [],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
