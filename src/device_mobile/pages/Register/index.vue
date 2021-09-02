<template>
  <div class="w-full h-full bg-white">
    <MHeader :title="$t('common.register')" class="van-hairline--bottom" />
    <van-form class="pt-4 mb-6 bg-white" @submit="onSubmit">
      <div class="px-2 mb-6 font-16">
        <van-field
          size="large"
          :style="{
            'font-size': '16px',
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          v-model="formRegister.email"
          name="邮箱"
          placeholder="邮箱"
        >
          <!-- :rules="[{ required: true, message: '请填写邮箱' }]" -->
          <template #left-icon>
            <van-icon class="mr-2 font-16" name="envelop-o" />
          </template>
        </van-field>
        <van-field
          size="large"
          :style="{
            'font-size': '16px',
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          v-model="formRegister.code"
          name="验证码"
          placeholder="验证码"
        >
          <template #left-icon>
            <div class="h-full flex items-center justify-center">
              <van-icon class="mr-2 font-16" name="font-o" />
            </div>
          </template>
          <template #button>
            <van-button
              round
              class="rounded-full"
              size="small"
              :style="{
                position: 'absolute',
                right: '0px',
                top: '-1px',
              }"
              type="primary"
              :disabled="!formRegister.email || isLockSendEamil"
              @click="onSendEmailCode"
            >
              {{ isLockSendEamil ? countdownSendEamil : "发送验证码" }}
            </van-button>
          </template>
        </van-field>
        <van-field
          size="large"
          :style="{
            'font-size': '16px',
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          left-icon="smile-o"
          v-model="formRegister.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          name="密码"
          placeholder="密码(六位数以上)"
        >
          <!-- :rules="[{ required: true, message: '请填写密码' }]" -->
          <template #left-icon>
            <van-icon
              @click="onSwitchIsPasswordVisible"
              v-show="isPasswordVisible"
              class="mr-2"
              name="eye-o"
            />
            <van-icon
              @click="onSwitchIsPasswordVisible"
              v-show="!isPasswordVisible"
              class="mr-2 font-16"
              name="closed-eye"
            />
          </template>
        </van-field>
        <van-field
          size="large"
          :style="{
            'font-size': '16px',
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          left-icon="smile-o"
          v-model="formRegister.repeatPassword"
          :type="isRepeatPasswordVisible ? 'text' : 'password'"
          name="确认密码"
          placeholder="确认密码"
        >
          <!-- :rules="[{ required: true, message: '请填写密码' }]" -->
          <template #left-icon>
            <van-icon
              @click="onSwitchIsRepeatPasswordVisible"
              v-show="isRepeatPasswordVisible"
              class="mr-2"
              name="eye-o"
            />
            <van-icon
              @click="onSwitchIsRepeatPasswordVisible"
              v-show="!isRepeatPasswordVisible"
              class="mr-2 font-16"
              name="closed-eye"
            />
          </template>
        </van-field>
        <div
          :style="{
            height: '1px',
          }"
        ></div>
      </div>
      <div class="px-6 mb-6">
        <van-checkbox v-model="isAgree" class="font-14">
          <span class="text-gray mr-1">
            {{ $t("pageLogin.signUpAgree") }}
          </span>
          <a href="javascript:;" class="ant-blue">{{
            $t("pageLogin.termsOfService")
          }}</a>
        </van-checkbox>
      </div>
      <div class="px-6">
        <van-button
          class="font-16 h-12"
          round
          block
          type="primary"
          native-type="submit"
          :loading="isLoadingSubmit"
          :disabled="isFormUnfinished"
        >
          {{ $t("pageLogin.registerButton") }}
        </van-button>
      </div>
    </van-form>
    <div class="text-center text-gray font-14 mb-16">
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
import { MHeader } from "../../components";

export default defineComponent({
  components: {
    MHeader,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const isAgree = ref(false);
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

<style scoped>
</style>