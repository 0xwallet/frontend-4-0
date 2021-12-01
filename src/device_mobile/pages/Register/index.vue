<template>
  <div class="pt-6 bg-gray-100 h-full">
    <!-- logo -->
    <div
      class="mb-6 h-20 flex items-center justify-center"
      :style="{
        filter: 'drop-shadow(0px 0px 8px #231F20)',
      }"
    >
      <MSvgIcon
        icon="logoWhiteBorder"
        :size="22.1"
        :style="{
          transform: 'scale(3)',
        }"
      />
    </div>
    <!-- form -->
    <main class="px-3">
      <div
        class="bg-white px-3 rounded"
        :style="{
          'border-top': '2px solid #1890FF',
          'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.03)',
        }"
      >
        <div
          class="font-16 ant-blue font-semibold py-4 mb-2"
          :style="{
            'border-bottom': '1px solid #f9f9f9',
          }"
        >
          {{ $t("pageLogin.registerButton") }}
        </div>
        <!-- 表单区 start -->
        <div class="mb-2 font-12 font-bold">
          {{ $t("pageLogin.emailLabel") }}
        </div>
        <div class="mb-4">
          <van-field v-model="formRegister.email" />
        </div>
        <div class="mb-2 font-12 font-bold">
          {{ $t("pageLogin.verification") }}
        </div>
        <div class="mb-4">
          <van-field v-model="formRegister.email">
            <template #button>
              <!-- <van-button size="small" type="primary">发送</van-button> -->
              <div
                class="sendBtn font-12 font-semibold text-white"
                @click="onSendEmailCode"
              >
                {{
                  isLockSendEamil ? countdownSendEamil : $t("pageLogin.send")
                }}
              </div>
            </template>
          </van-field>
        </div>
        <div class="mb-2 font-12 font-bold">
          {{ $t("pageLogin.passwordLabel") }}
        </div>
        <div class="mb-4">
          <van-field type="password" v-model="formRegister.password" />
        </div>
        <div class="mb-2 font-12 font-bold">
          {{ $t("pageLogin.passwordLabel2") }}
        </div>
        <div class="mb-4">
          <van-field type="password" v-model="formRegister.repeatPassword" />
        </div>
        <!-- 表单区 enc -->
        <div class="font-14 mb-8 mt-4 text-gray-500 flex items-center">
          <van-checkbox
            icon-size="16px"
            v-model="isAgree"
            class="mr-1 inline-block"
          >
          </van-checkbox>
          <span class="mr-1 cursor-default" @click="onToggleAgree">{{
            $t("pageLogin.signUpAgree")
          }}</span>
          <a href="javascript:;" class="ant-blue">{{
            $t("pageLogin.termsOfService")
          }}</a>
        </div>
        <div class="pb-6">
          <van-button
            block
            class="font-12 font-semibold"
            :style="{
              'border-radius': '4px',
              'box-shadow': '0 2px 6px #1890FF',
            }"
            type="primary"
            @click="onSubmit"
            >{{ $t("pageLogin.registerButton") }}</van-button
          >
        </div>
      </div>
    </main>
    <div class="mt-6 bg-gray-100">
      <div class="font-14 text-center text-gray-500 mb-12">
        {{ $t("pageLogin.alreadyHaveAccount") }}
        <router-link to="/login" class="ant-blue">{{
          $t("pageLogin.signInNow")
        }}</router-link>
        <span
          class="pb-1 relative"
          :style="{
            bottom: '2px',
          }"
          >👉</span
        >
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
import { apiSendSignUpEmailCaptcha, apiSignUp } from "@/apollo/api";
import { REG_OBJ } from "@/constants";
import { useDelay } from "@/utils";
import { Toast } from "vant";
import {
  computed,
  defineComponent,
  onUnmounted,
  reactive,
  ref,
  toRaw,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { MSvgIcon } from "../../components";

export default defineComponent({
  components: {
    MSvgIcon,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const isAgree = ref(false);
    const onToggleAgree = () => {
      isAgree.value = !isAgree.value;
    };
    const formRegister = reactive({
      email: "",
      code: "",
      password: "",
      repeatPassword: "",
    });
    const isFormUnfinished = computed(() => {
      return (
        !formRegister.email ||
        !formRegister.code ||
        !formRegister.password ||
        !formRegister.repeatPassword
      );
    });
    const isLoadingSubmit = ref(false);
    const isLockSendEamil = ref(false);
    const countdownSendEamil = ref(0);
    let counter: number;
    const onSendEmailCode = async () => {
      const { email } = toRaw(formRegister);
      if (!email.length || !REG_OBJ.email.test(email)) {
        Toast(t("pageLogin.emailPlaceholder"));
        return;
      }
      if (isLockSendEamil.value) {
        return;
      }

      const resultSendCaptcha = await apiSendSignUpEmailCaptcha({
        email,
        type: "ACTIVE_EMAIL",
      });
      if (resultSendCaptcha.err) return;
      // 验证码发送成功 提示语 按钮60秒禁用 ?
      Toast(t("pageLogin.verificationSend"));
      // 禁用发送验证码按钮和计数
      isLockSendEamil.value = true;
      countdownSendEamil.value = 60;
      counter = window.setInterval(() => {
        if (countdownSendEamil.value > 1) {
          countdownSendEamil.value--;
        } else {
          // 倒数完毕,清空计时器,重置锁定
          clearInterval(counter);
          isLockSendEamil.value = false;
        }
      }, 1000);
      // 防止内存泄漏
    };
    onUnmounted(() => counter && clearInterval(counter));
    const isPasswordVisible = ref(false);
    const isRepeatPasswordVisible = ref(false);
    const onSwitchIsPasswordVisible = () => {
      isPasswordVisible.value = !isPasswordVisible.value;
    };
    const onSwitchIsRepeatPasswordVisible = () => {
      isRepeatPasswordVisible.value = !isRepeatPasswordVisible.value;
    };
    const onSubmit = async () => {
      console.log("onSubmit");
      if (!isAgree.value) {
        Toast("请先勾选同意服务条款");
        return;
      }
      const { email, code, password, repeatPassword } = toRaw(formRegister);
      if (!email.length || !REG_OBJ.email.test(email)) {
        Toast(t("pageLogin.emailPlaceholder"));
        return;
      }
      if (
        !email.length ||
        !code.length ||
        !password.length ||
        !repeatPassword.length
      ) {
        Toast(t("pageLogin.plsCompleteForm"));
        return;
      }
      if (password.length < 6) {
        Toast("请输入六位数以上的密码");
        return;
      }
      if (password !== repeatPassword) {
        Toast(t("pageLogin.diffPwd"));
        return;
      }
      isLoadingSubmit.value = true;
      const resultSignUp = await apiSignUp({
        email,
        password,
        code,
        username: email.split("@")[0],
        nknPublicKey: "",
      });
      isLoadingSubmit.value = false;
      if (resultSignUp.err) {
        console.log(resultSignUp.err);
        Toast(resultSignUp.err.message);
        return;
      }
      Toast(t("pageLogin.registerSuccess"));
      useDelay().then(() => router.replace({ name: "Login" }));
    };
    return {
      isAgree,
      onToggleAgree,
      formRegister,
      isLoadingSubmit,
      isFormUnfinished,
      isLockSendEamil,
      countdownSendEamil,
      onSendEmailCode,
      isPasswordVisible,
      isRepeatPasswordVisible,
      onSwitchIsPasswordVisible,
      onSwitchIsRepeatPasswordVisible,
      onSubmit,
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
  overflow: unset; // 为了让sendBtn的阴影显示出来
}
:deep(.van-checkbox__icon .van-icon) {
  border-radius: 2px;
}

.sendBtn {
  position: absolute;
  top: -7px;
  bottom: -7px;
  right: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  background: #1890ff;
  border-radius: 0px 4px 4px 0;
  box-shadow: 0 0px 4px #1890ff;
}
</style>