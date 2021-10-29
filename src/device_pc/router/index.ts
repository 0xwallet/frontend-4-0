import { useTitle } from "@vueuse/core";
import { i18n } from "../main";
import { message } from "ant-design-vue";
import { PRODUCT_NAME } from "../../constants/index";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "../../store";
// vue 文件
import Login from "../pages/Login/index.vue";
import Register from "../pages/Register/index.vue";
import ResetPwd from "../pages/ResetPwd/index.vue";
import Dashboard from "../pages/Dashboard/index.vue";
import Account from "../pages/Account/index.vue";
import Security from "../pages/Security/index.vue";
//
import LayoutIndex from "../layouts/index.vue";
import Layout from "../layouts/Common.vue";
import MetanetFile from "../pages/Metanet/File.vue";
import MetanetShare from "../pages/Metanet/Share.vue";
import MetanetSharedFile from "../pages/Metanet/SharedFile.vue";
import MetanetPublish from "../pages/Metanet/Publish.vue";
import MetanetCollect from "../pages/Metanet/Collect.vue";
import MetanetRecycle from "../pages/Metanet/Recycle.vue";
import TransportUploading from "../pages/Transport/Uploading.vue";
import TransportUploadHistory from "../pages/Transport/UploadHistory.vue";
import TransportPeerTransfer from "../pages/Transport/PeerTransfer.vue";
import ErrPage403 from "../pages/Error/403.vue";
import ErrPage404 from "../pages/Error/404.vue";
import ErrPage500 from "../pages/Error/500.vue";
import PdfView from "../pages/PdfView/index.vue";

const routes: RouteRecordRaw[] = [
  {
    //登录
    path: "/login",
    name: "Login",
    meta: {
      needAuth: false,
      title: "common.signIn",
    },
    component: Login,
  },
  {
    //注册
    path: "/register",
    name: "Register",
    meta: {
      needAuth: false,
      title: "common.register",
    },
    component: Register,
  },
  {
    //忘记密码
    path: "/resetpassword",
    name: "ResetPwd",
    meta: {
      needAuth: false,
      title: "pageLogin.forgetFormTitle",
    },
    component: ResetPwd,
  },
  {
    path: "/",
    component: LayoutIndex,
    redirect: "/metanet/file?id=1&path=~", // TODO change it
    // redirect: "/general/metanet", // TODO change it
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        meta: {
          needAuth: true,
          title: "common.dashboard",
        },
        component: Dashboard,
      },
      {
        path: "account",
        name: "Account",
        meta: {
          needAuth: true,
          title: "common.account",
        },
        component: Account,
      },
      {
        path: "security",
        name: "Security",
        meta: {
          needAuth: true,
          title: "common.security",
        },
        component: Security,
      },
      {
        path: "metanet/file",
        name: "MetanetFile",
        meta: {
          needAuth: true,
          title: "metanet.file",
        },
        component: MetanetFile,
      },
      // {
      //   path: "metanet/transport",
      //   name: "MetanetTransport",
      //   meta: {
      //     needAuth: true,
      //     title: "metanet.transport",
      //   },
      //   component: MetanetTransport,
      // },
      {
        path: "metanet/share",
        name: "MetanetShare",
        meta: {
          needAuth: true,
          title: "metanet.shareButton",
        },
        component: MetanetShare,
      },
      // {
      //   // 登录状态的分享链接跳转到这里
      //   path: "metanet/sharedFile",
      //   name: "MetanetSharedFile",
      //   meta: {
      //     needAuth: false,
      //     title: "metanet.sharedFile",
      //   },
      //   component: MetanetSharedFile,
      // },
      {
        path: "metanet/publish",
        name: "MetanetPublish",
        meta: {
          needAuth: true,
          title: "metanet.publish",
        },
        component: MetanetPublish,
      },
      {
        path: "metanet/collect",
        name: "MetanetCollect",
        meta: {
          needAuth: true,
          title: "metanet.collectionButton",
        },
        component: MetanetCollect,
      },
      {
        path: "metanet/recycle",
        name: "MetanetRecycle",
        meta: {
          needAuth: true,
          title: "metanet.recycle",
        },
        component: MetanetRecycle,
      },
      {
        path: "transport/uploading",
        name: "TransportUploading",
        meta: {
          needAuth: true,
          title: "transport.uploading",
        },
        component: TransportUploading,
      },
      {
        path: "transport/uploadHistory",
        name: "TransportUploadHistory",
        meta: {
          needAuth: true,
          title: "transport.uploadHistory",
        },
        component: TransportUploadHistory,
      },
      {
        path: "transport/peerTransfer",
        name: "TransportPeerTransfer",
        meta: {
          needAuth: false,
          title: "transport.peerTransfer",
        },
        component: TransportPeerTransfer,
      },
      // error pages --start
      {
        // 403 未授权
        path: "/error/403",
        name: "Error403",
        meta: {
          needAuth: false,
          title: "errPage.403_title",
        },
        component: ErrPage403,
      },
      {
        // 404 not found
        path: "/error/404",
        name: "Error404",
        meta: {
          needAuth: false,
          title: "errPage.404_title",
        },
        component: ErrPage404,
      },
      {
        // 500
        path: "/error/500",
        name: "Error500",
        meta: {
          needAuth: false,
          title: "errPage.500_title",
        },
        component: ErrPage500,
      },
      // error pages --end
    ],
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
    // path: "*",
    path: "/:catchAll(.*)",
    // redirect: "/metanet/file?id=1&path=~",
    redirect: "/error/404",
  },
  // {
  //   path: "/about",
  //   name: "About",
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../pages/About.vue"),
  // },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 守卫-登录权限
router.beforeEach((to, from) => {
  // console.log("to.name", to.name);
  if (to.name !== "Login" && to.meta.needAuth && !useUserStore().isLoggedIn) {
    // TODO 路由跳转提示
    // message.error(i18n.global.t("pageLogin.pleaseSignInFirst"));
    return {
      path: "/login",
      replace: true,
      query: {
        redirect: to.fullPath,
      },
    };
  }
  if (useUserStore().isLoggedIn) {
    (window as any).globalLoaderController.show();
  }
  if (to.name === "Login" && useUserStore().isLoggedIn) {
    return {
      path: "/",
      replace: true,
    };
  }
});
// 守卫-浏览器标题
router.beforeEach((to, from) => {
  // TODO 点击切换语言的时候 标题没有马上变化
  const textPath = `${to.meta.title}`;
  useTitle(`${i18n.global.t(textPath)} - ${PRODUCT_NAME}`);
});

export default router;
