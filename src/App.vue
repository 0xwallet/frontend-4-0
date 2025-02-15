<template>
  <a-config-provider :locale="locale">
    <!-- 增加开发环境的路由组件显示 -->
    <div
      v-if="isEnvDevelopment"
      class="
        fixed
        top-0
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
    </div>
    <!-- 全局登录弹窗 -->
    <XModalLogin
      :visible="isShowLoginModal"
      @update:visible="onUpdateVisible"
    />
    <router-view />
  </a-config-provider>
</template>

<script lang="ts">
import zh_CN from "ant-design-vue/es/locale/zh_CN";
import en_US from "ant-design-vue/es/locale/en_US";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import { useBaseStore, useUserStore } from "./store";
import { notification } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { XModalLogin } from "@/components";

export default defineComponent({
  components: {
    XModalLogin,
  },
  // TODO 全局更改语言配置
  setup() {
    const baseStore = useBaseStore();
    const { t } = useI18n();
    async function trySignInWithLocalStorageAndRedirect() {
      const { signInWithLocalStorage } = useUserStore();
      // const [res, err] = await signInWithLocalStorage();
      const result = await signInWithLocalStorage();
      if (result.err) {
        console.log("[从本地存储中登录失败] : ", result.err);
        return;
      }
      notification.success({
        message: t("pageLogin.loginSuccessTitle"),
        description: `${t("pageLogin.loginSuccessDesc")}: ${
          result.data.username
        }`,
      });
      console.log("[从本地存储中登录成功] : ", result.data);
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
// html font-size :16px
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
</style>