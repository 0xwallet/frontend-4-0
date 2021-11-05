<template>
  <a-config-provider :locale="locale">
    <!-- 增加开发环境的路由组件显示 -->
    <!-- <div
      v-if="isEnvDevelopment"
      class="
        fixed
        bottom-0
        inset-x-0
        m-auto
        px-10
        w-max
        opacity-70
        bg-gray-700
        text-white
        z-999
      "
    >
      <div>当前路由: {{ curRouteObj.path }}</div>
      <div>路由组件: {{ curRouteObj.component }}</div>
    </div> -->
    <!-- 全局登录弹窗 -->
    <XModalLogin
      :visible="isShowLoginModal"
      @update:visible="onUpdateVisible"
    />
    <router-view />
    <XPhotoSwipe />
  </a-config-provider>
</template>

<script lang="ts">
import zh_CN from "ant-design-vue/es/locale/zh_CN";
import en_US from "ant-design-vue/es/locale/en_US";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { useBaseStore, useUserStore } from "@/store";
import { notification } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { XModalLogin, XPhotoSwipe } from "./components";

export default defineComponent({
  components: {
    XModalLogin,
    XPhotoSwipe,
  },
  // TODO 全局更改语言配置
  setup() {
    const baseStore = useBaseStore();
    const userStore = useUserStore();
    const route = useRoute();
    const { t } = useI18n();
    async function trySignInWithLocalStorageAndRedirect() {
      const { signInWithLocalStorage } = userStore;
      // const [res, err] = await signInWithLocalStorage();
      const result = await signInWithLocalStorage();
      if (result.err) {
        console.log("[从本地存储中登录失败] : ", result.err.message);
        return;
      }
      notification.success({
        message: t("pageLogin.loginSuccessTitle"),
        description: `${t("pageLogin.loginSuccessDesc")}: ${
          result.data.username
        }`,
      });
      // console.log("[从本地存储中登录成功] : ", result.data);
    }
    trySignInWithLocalStorageAndRedirect();
    /** 获取本地储存的语言配置 */
    function useStorageLocaleToConfigProvider() {
      const storegeLocale = useLocalStorage("locale", "zh_CN");
      type Lang = typeof zh_CN | typeof en_US;
      const localeMap: {
        [key: string]: Lang;
      } = {
        zh_CN: zh_CN,
        en_US: en_US,
      };
      const refLocale = ref<Lang>(zh_CN);
      watch(
        () => storegeLocale.value,
        (val) => {
          // console.log("watch-val", val);
          refLocale.value = localeMap[val];
        },
        {
          immediate: true,
        }
      );
      return { locale: refLocale };
    }
    /** 判断是否开发环境 */
    function useCurrentEnvironment() {
      const isEnvDevelopment = process.env.NODE_ENV === "development";
      if (!isEnvDevelopment) return { isEnvDevelopment };
      const route = useRoute();
      const curRouteObj = computed(() => {
        const matchedArr = [...route.matched];
        const mapPathComponent = Object.create(null);
        const firstMathed = matchedArr.filter((i) => !i.redirect)[0];
        mapPathComponent.path = firstMathed?.path ?? "";
        mapPathComponent.component =
          (firstMathed?.components.default as any)["__file"] ?? "";
        return mapPathComponent;
      });
      // console.log("curRouteObj", curRouteObj);
      return { isEnvDevelopment, curRouteObj };
    }
    /** 全局的登录弹窗 */
    function useLoginModal() {
      const isShowLoginModal = computed(() => baseStore.isShowLoginModal);
      const onUpdateVisible = (v: boolean) =>
        baseStore.changeIsShowLoginModal(v);
      return {
        isShowLoginModal,
        onUpdateVisible,
      };
    }

    return {
      ...useStorageLocaleToConfigProvider(),
      ...useCurrentEnvironment(),
      ...useLoginModal(),
    };
  },
});
</script>

<style lang="less">
// font
// dm Mono use for hash
// font-weight : 300 400 500
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
// fix tailwindcss-antd conflict bug
// tailwindcss 中用了vertical-align : middle 导致antd 库的很多图标文字不能居中
img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  vertical-align: baseline;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: "lato";
}
/* 不加 scope 属性,密码强度栏的默认配色 */
.po-password-strength-bar {
  background-color: rgba(0, 0, 0, 0.25);
}
// ant color
@import "~ant-design-vue/lib/style/color/colors.less";

.ant-color-blue-1 {
  // table 里的hover
  color: @blue-1;
}
.ant-color-blue-4 {
  color: @blue-4;
}
.ant-color-blue-5 {
  color: @blue-5;
}
.ant-color-blue-6 {
  color: @blue-6;
}
.ant-color-uploading {
  color: @gold-6;
}
.ant-color-success {
  color: @blue-6;
}
.ant-color-failed {
  color: @red-5;
}
.ant-color-danger {
  color: @red-4;
}
.ant-color-gray {
  color: rgba(0, 0, 0, 0.45);
}
.ant-btn-cyan {
  color: #fff;
  background-color: @cyan-6;
  border-color: @cyan-6; // blue-6
  &:hover,
  &:focus {
    color: #fff;
    background-color: @cyan-5; //blue-5
    border-color: @cyan-5;
  }
  &:active {
    color: #fff;
    background-color: @cyan-7; //blue-7
    border-color: @cyan-7;
  }
}
@default_radius: 12px;
.ant-modal-content {
  border-radius: @default_radius;
  overflow: hidden;
  .ant-btn {
    border-radius: 999px;
  }
}
// ant 弹窗里的关闭按钮
.ant-modal-close {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  transition: transform 0.3s ease-in-out;
  // background-color: #f2f2f2;
  // top: 6px;
  // right: 6px;
  top: 12px;
  right: 16px;
  // overflow: hidden;
  background-image: url("~@/assets/svg/modal_close.svg");
  &:hover {
    transform: rotate(90deg);
    opacity: 0.75;
  }
  .ant-modal-close-x {
    display: none;
  }
}
// ant tooltip的圆角
.ant-tooltip-inner {
  border-radius: @default_radius;
}
// ant notification的圆角
.ant-notification-notice {
  border-radius: @default_radius;
}
// html font-size :16px
.font-24 {
  font-size: 1.5rem;
}
.font-22 {
  font-size: 1.375rem;
}
.font-20 {
  font-size: 1.25rem;
}
.font-18 {
  font-size: 1.125rem;
}
.font-16 {
  font-size: 1rem;
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
.flex-center {
  display: flex;
  align-items: center;
  justify-items: center;
}
.flex-center-y {
  .flex-center();
  flex-direction: column;
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
  transition: opacity 0.5s;
}

.no-mode-fade-enter-from,
.no-mode-fade-leave-to {
  opacity: 0;
}
// markdown body 里的颜色继承父(.markdown-body)
// 而不是全局ant-design-color
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: inherit;
}
</style>