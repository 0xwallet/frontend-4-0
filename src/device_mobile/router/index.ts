import LayoutIndex from "../Layouts/index.vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { useTitle } from "@vueuse/core";
import { i18n } from "../main";
import { PRODUCT_NAME } from "@/constants";
import { useUserStore } from "@/store";

import Login from "../pages/Login/index.vue";
import Account from "../pages/Account/index.vue";
import MetanetSharedFile from "../pages/Metanet/SharedFile.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      meta: {
        needAuth: false,
        title: "common.signIn",
      },
      component: Login,
    },
    {
      path: "/account",
      name: "Account",
      meta: {
        needAuth: true,
        title: "common.account",
      },
      component: Account,
    },
    {
      // 登录状态的分享链接跳转到这里
      path: "/metanet/sharedFile",
      name: "MetanetSharedFile",
      meta: {
        needAuth: false,
        title: "metanet.sharedFile",
      },
      component: MetanetSharedFile,
    },
    {
      path: "/pdfview",
      name: "PdfView",
      meta: {
        needAuth: false,
        title: "common.pdfView",
      },
      component: () =>
        import(/* webpackChunkName: "pdfview" */ "../pages/PdfView/index.vue"),
    },
    {
      path: "/:catchAll(.*)",
      redirect: "/account",
    },
    //  {
    //   path: "/",
    //   component: LayoutIndex,
    //   redirect: "/account", // TODO change it
    //   children: [
    //     {
    //       path: "account",
    //       name: "Account",
    //       meta: {
    //         needAuth: true,
    //         title: "common.account",
    //       },
    //       component: Account,
    //     },
    //  }
  ],
});
// 守卫-登录权限
router.beforeEach((to, from) => {
  // console.log("to.name", to.name);
  if (to.name !== "Login" && to.meta.needAuth && !useUserStore().isLoggedIn) {
    // if (to.name !== "Login" && to.meta.needAuth && Math.random() > 0.5) {
    // TODO 路由跳转提示
    // message.error(i18n.global.t("pageLogin.pleaseSignInFirst"));
    return {
      path: "/login",
      replace: true,
      query: {
        redirect: to.path,
      },
    };
  }
});
// 守卫-浏览器标题
router.beforeEach((to, from) => {
  const textPath = `${to.meta.title}`;
  useTitle(`${i18n.global.t(textPath)} - ${PRODUCT_NAME}`);
});

export default router;
