<template>
  <div class="relative w-full h-full bg-gray-100">
    <router-view v-slot="{ Component }">
      <transition name="no-mode-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <MPopupLogin
      :visible="isShowLoginPopup"
      @update:visible="onUpdateVisible"
    />
  </div>
</template>

<script lang="ts">
import { useBaseStore, useUserStore } from "@/store";
import { addHead } from "@/utils";
import { Toast } from "vant";
import { computed, defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MPopupLogin } from "./components";

export default defineComponent({
  components: {
    MPopupLogin,
  },
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
    const baseStore = useBaseStore();
    const router = useRouter();
    const route = useRoute();
    /** 全局的登录弹窗 */
    function useLoginModal() {
      const isShowLoginPopup = computed(() => baseStore.isShowLoginModal);
      const onUpdateVisible = (v: boolean) =>
        baseStore.changeIsShowLoginModal(v);
      return {
        isShowLoginPopup,
        onUpdateVisible,
      };
    }

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
    return {
      ...useLoginModal(),
    };
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
.absolute-center-x {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.absolute-center-y {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.absolute-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.ant-blue {
  color: #1890ff;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.text-overflow-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.text-overflow-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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