<template>
  <div class="relative w-full h-full bg-gray-100">
    <router-view v-slot="{ Component }">
      <transition name="no-mode-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts">
import { useUserStore } from "@/store";
import { addHead } from "@/utils";
import { Toast } from "vant";
import { computed, defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    // document
    //   .getElementsByName("viewport")[0]
    //   .setAttribute(
    //     "content",
    //     "width=device-width, initial-scale=1.0, viewport-fit=cover"
    //   );
    // // 设置手机浏览器的nabbar 的颜色
    // // <!-- Chrome, Firefox OS and Opera -->
    // addHead("meta", { name: "theme-color", content: "#404A66" });
    // addHead("meta", {
    //   name: "apple-mobile-web-app-status-bar-style",
    //   content: "black-translucent",
    // });
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    async function trySignInWithLocalStorageAndRedirect() {
      const { signInWithLocalStorage } = userStore;
      // const [res, err] = await signInWithLocalStorage();
      const result = await signInWithLocalStorage();
      if (result.err) {
        console.log("[从本地存储中登录失败] : ", result.err.message);
        return;
      }
      // pdf 预览页不需要登录提示
      // Toast(`登录成功，欢迎回来 : ${result.data.username}`);
      console.log("route", route);
      if (route.name === "Login") {
        // TODO 这里暂时跳转到账户页
        router.replace({ name: "Account" });
      }
      console.log("[从本地存储中登录成功] : ", result.data);
    }
    trySignInWithLocalStorageAndRedirect();
    return {};
  },
});
</script>

<style lang="less">
@import url("~@fontsource/dm-mono/500.css");
// font-family: "DM Mono";
.font-dmmono {
  font-family: "DM Mono";
}

@import url("~@fontsource/lato/400.css");
.font-lato {
  font-family: "Lato";
}

@import url("~tailwindcss/tailwind.css");

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: "lato";
}
html {
  // font-size: 14px;
  // 这里16 方便rem的计算方式跟pc版一样
  font-size: 16px;
}
body {
  font-size: 14px;
}
.text-gray {
  color: #949494;
}
// body {
//   padding: env(safe-area-inset-top) env(safe-area-inset-right)
//     env(safe-area-inset-bottom) env(safe-area-inset-left);
// }
.font-20 {
  font-size: 1.25rem;
}
.font-18 {
  font-size: 1.125rem;
}
.font-16 {
  font-size: 1rem;
}
.font-15 {
  font-size: 0.9375rem;
}
.font-14 {
  font-size: 0.875rem;
}
.font-12 {
  font-size: 0.75rem; //12px
}
.ant-blue {
  color: #1890ff;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.borderTest {
  // 测试用边框
  border: 1px solid red;
}
</style>

<style lang="less">
// vue 动画
.no-mode-fade-enter-active,
.no-mode-fade-leave-active {
  transition: opacity 0.2s;
}

.no-mode-fade-enter-from,
.no-mode-fade-leave-to {
  opacity: 0;
}
</style>