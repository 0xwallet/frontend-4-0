<template>
  <div class="bg-white h-full">
    <div class="mb-10 px-6 pt-6">
      <!-- logo -->
      <div
        class="mb-6 w-20 h-20 flex items-center justify-center"
        :style="{
          filter: 'drop-shadow(0px 0px 8px #231F20)',
        }"
      >
        <div
          v-html="svgStr"
          :style="{
            transform: 'scale(3)',
          }"
        ></div>
      </div>
      <div
        :style="{
          'font-size': currentLocale === 'zh_CN' ? '24px' : '18px',
        }"
        class="mb-2"
      >
        {{ $t("pageLogin.welcomeUsage") }}
        <span class="font-bold">{{ $t("pageLogin.productVer") }}</span>
        <!-- 为 <span class="font-bold">Web 3.0</span> 而生的
          <span class="font-bold">比特币钱包</span>
          解决方案 -->
      </div>
      <div
        class="text-gray-400 mb-4 font-14"
        :style="{
          'line-height': '2',
        }"
      >
        {{ $t("pageLogin.signInDesc") }}
      </div>
      <div class="mb-2 font-12 font-bold">
        {{ $t("pageLogin.emailLabel") }}
      </div>
      <div class="mb-4">
        <van-field v-model="formLogin.email" />
      </div>
      <div class="mb-2 font-12 font-bold">
        {{ $t("pageLogin.passwordLabel") }}
      </div>
      <div class="mb-4">
        <van-field type="password" v-model="formLogin.password" />
      </div>
      <div class="mb-4">
        <van-checkbox
          shape="square"
          icon-size="16px"
          v-model="isRememberMe"
          class="font-14"
          :style="{
            'border-radius': '2px',
          }"
        >
          <span> {{ $t("pageLogin.rememberMe") }} </span>
        </van-checkbox>
      </div>
      <div class="flex items-center mb-10">
        <router-link to="/resetpassword" class="w-20 font-14 ant-blue">
          {{ $t("pageLogin.forgetPassword") }}
        </router-link>
        <div
          class="flex-1 flex items-center justify-center text-gray-400"
          :style="{
            'font-size': '24px',
          }"
        >
          <a href="javascript:;" class="px-2">
            <img src="~@/assets/images/nkn_gray.png" class="w-6 h-6" alt="" />
          </a>
          <a href="javascript:;" class="px-2">
            <!-- <DeploymentUnitOutlined /> -->
            <img src="~@/assets/images/nkn_gray.png" class="w-6 h-6" alt="" />
          </a>
          <a href="javascript:;" class="px-2">
            <img src="~@/assets/images/nkn_gray.png" class="w-6 h-6" alt="" />
          </a>
        </div>
        <van-button
          type="primary"
          :loading="isLoadingSubmit"
          @click="onSubmit"
          class="w-20 font-12 font-bold px-6"
          :style="{
            'border-radius': '4px',
            'box-shadow': '0 2px 6px #1890FF',
          }"
          >{{ $t("pageLogin.loginButton") }}</van-button
        >
      </div>
      <div class="font-14 text-center text-gray-500 mb-12 relative">
        {{ $t("pageLogin.notAccountyet") }}
        <router-link to="/register" class="ant-blue">{{
          $t("pageLogin.signUpNow")
        }}</router-link>
        <span
          class="pb-1 relative"
          :style="{
            bottom: '2px',
          }"
          >👉</span
        >
        <div
          class="absolute"
          :style="{
            top: '1px',
            right: '2px',
          }"
        >
          <MLocaleSwither class="cursor-pointer font-20 text-gray-500" />
        </div>
      </div>
      <div>
        <div class="mb-2 text-center font-12 text-gray-400">
          Copyright © 2021 {{ $t("pageLogin.productName") }}
        </div>
        <div class="text-center font-12 text-gray-400">
          Powered by
          <a href="https://www.owaf.org" target="_blank" class="ant-blue"
            >OWAF</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { apiEmailLogin } from "@/apollo/api";
import { useUserStore } from "@/store";
import { useSvgWhiteLogo } from "@/utils";
import { Toast } from "vant";
import { computed, defineComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { MLocaleSwither } from "../../components";

export default defineComponent({
  components: {
    MLocaleSwither,
  },
  setup() {
    const { t, locale: currentLocale } = useI18n();
    /** logo和名称tips */
    function useLogoSvgAndName() {
      return {
        svgStr: useSvgWhiteLogo(),
      };
    }
    const route = useRoute();
    const router = useRouter();
    const formLogin = reactive({
      email: "",
      password: "",
    });
    const isFormUnfinished = computed(() => {
      return !formLogin.email || !formLogin.password;
    });
    const isRememberMe = ref(false);
    const isLoadingSubmit = ref(false);
    const onSubmit = async () => {
      console.log("onSubmit", formLogin);
      isLoadingSubmit.value = true;
      const res = await apiEmailLogin({ ...formLogin });
      isLoadingSubmit.value = false;
      if (res.err) {
        Toast("登录失败");
        return;
      }
      console.log(res);
      const { token } = res.data.signin;
      const { id, username } = res.data.signin.user;
      const { signInFullPath } = useUserStore();
      const resultSignInFullPath = await signInFullPath({
        id,
        token,
        username,
        email: formLogin.email,
      });
      console.log(resultSignInFullPath);
      Toast("登录成功");
      const redirectFullPath = route.query.redirect as string;
      if (redirectFullPath) {
        router.push(redirectFullPath);
      } else {
        router.push("/account");
      }
    };
    const isPasswordVisible = ref(false);
    const onSwitchIsPasswordVisible = () =>
      (isPasswordVisible.value = !isPasswordVisible.value);
    return {
      currentLocale,
      ...useLogoSvgAndName(),
      formLogin,
      isFormUnfinished,
      isRememberMe,
      isLoadingSubmit,
      onSubmit,
      isPasswordVisible,
      onSwitchIsPasswordVisible,
    };
  },
});
</script>

<style lang="less" scoped>
.van-cell {
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 6px 12px;
}
:deep(.van-checkbox__icon .van-icon) {
  border-radius: 2px;
}
</style>