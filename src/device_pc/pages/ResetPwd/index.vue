<template>
  <div class="h-full bg-gray-100">
    <div
      class="pt-12"
      :style="{
        margin: '0 auto',
        width: 'fit-content',
      }"
    >
      <!-- width: '450px', -->
      <div class="mb-10 flex items-center justify-center">
        <div
          class="inline-block w-20 h-20 flex items-center justify-center"
          :style="{
            filter: 'drop-shadow(0px 0px 8px #231F20)',
          }"
        >
          <XSvgIcon
            icon="logoWhiteBorder"
            :size="22.1"
            :style="{
              transform: 'scale(3)',
            }"
          />
        </div>
      </div>
      <div
        class="rounded bg-white px-6 mb-10"
        :style="{
          'border-top': '2px solid #1890FF',
          'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.03)',
        }"
      >
        <div
          class="font-16 ant-color-blue-6 font-semibold py-4 mb-6"
          :style="{
            'border-bottom': '1px solid #f9f9f9',
          }"
        >
          {{ $t("pageLogin.forgetFormTitle") }}
        </div>
        <div>
          <a-row :gutter="24">
            <a-col
              class="mb-6"
              :style="{
                'min-width': '320px',
              }"
              :lg="{ span: 12 }"
              :md="24"
              :xs="24"
              :sm="24"
            >
              <div class="font-12 font-bold mb-2">
                {{ $t("pageLogin.registerButton") }} <span class=""></span>
                {{ $t("pageLogin.emailLabel") }}
              </div>
              <div>
                <a-input
                  v-model:value="form.email"
                  size="large"
                  class="rounded"
                ></a-input>
              </div>
            </a-col>
            <a-col
              class="mb-6"
              :style="{
                'min-width': '320px',
              }"
              :lg="{ span: 12 }"
              :md="24"
              :xs="24"
              :sm="24"
            >
              <div class="font-12 font-bold mb-2">
                {{ $t("pageLogin.verification") }}
              </div>
              <div>
                <a-input v-model:value="form.code" size="large" class="rounded">
                  <template #addonAfter>
                    <a-button
                      class="w-full font-12 font-semibold"
                      :style="{
                        height: '40px',
                        'border-radius': '0px 4px 4px 0',
                        'box-shadow': '0 0px 4px #1890FF',
                      }"
                      type="primary"
                      @click="onSendEmailCode"
                    >
                      {{
                        isLockSendEamil
                          ? countdownSendEamil
                          : $t("pageLogin.send")
                      }}
                    </a-button>
                  </template>
                </a-input>
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col
              class="mb-6"
              :style="{
                'min-width': '320px',
              }"
              :lg="{ span: 12 }"
              :md="24"
              :xs="24"
              :sm="24"
            >
              <div class="font-12 font-bold mb-2">
                {{ $t("pageLogin.passwordLabel") }}
              </div>
              <div class="relative">
                <a-input-password
                  @change="onChangePassword"
                  v-model:value="form.password"
                  size="large"
                  class="rounded"
                ></a-input-password>
                <div
                  v-if="form.password.length > 0"
                  class="absolute pt-1"
                  :style="{
                    color:
                      passwordStrength === 2
                        ? '#00DD00'
                        : passwordStrength === 1
                        ? '#F3F01A'
                        : '#DD0000',
                  }"
                >
                  {{ $t("pageLogin.passwordStrength") }}:{{
                    passwordStrength === 2
                      ? $t("pageLogin.strong")
                      : passwordStrength === 1
                      ? $t("pageLogin.medium")
                      : $t("pageLogin.weak")
                  }}
                </div>
              </div>
            </a-col>
            <a-col
              class="mb-6"
              :style="{
                'min-width': '320px',
              }"
              :lg="{ span: 12 }"
              :md="24"
              :xs="24"
              :sm="24"
            >
              <div class="font-12 font-bold mb-2">
                {{ $t("pageLogin.passwordLabel2") }}
              </div>
              <div>
                <a-input-password
                  v-model:value="form.repeatPassword"
                  size="large"
                  class="rounded"
                ></a-input-password>
              </div>
            </a-col>
          </a-row>
          <div class="pb-12 mt-2">
            <a-button
              block
              type="primary"
              size="large"
              class="font-12 font-semibold"
              :style="{
                'border-radius': '4px',
                'box-shadow': '0 2px 6px #1890FF',
              }"
              :loading="isLoadingSubmit"
              @click="onSubmit"
              >{{ $t("common.resetText") }}</a-button
            >
          </div>
        </div>
      </div>
      <div>
        <div class="text-center text-gray-500 mb-16">
          <a
            href="javascript:;"
            class="ant-color-blue-6"
            @click="onRouteToLogin"
            >{{ $t("pageLogin.backLoginButton") }}</a
          >
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
            <a
              href="https://www.owaf.org"
              target="_blank"
              class="ant-color-blue-6"
              >OWAF</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  apiResetPwd,
  apiSendSignUpEmailCaptcha,
  apiSignUp,
} from "@/apollo/api";
import { REG_OBJ } from "@/constants";
import { useDelay } from "@/utils";
import { message, notification } from "ant-design-vue";
import {
  computed,
  defineComponent,
  onUnmounted,
  reactive,
  ref,
  toRaw,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { XSvgIcon } from "../../components";

const strongReg = new RegExp(
  "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
);
const mediumReg = new RegExp(
  "((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))"
);
/** 密码强度检测 */
const pwsStrengthChecker = (pws: string): 2 | 1 | 0 => {
  if (strongReg.test(pws)) {
    return 2; //"Strong";
  } else if (mediumReg.test(pws)) {
    return 1; //"Medium";
  } else {
    return 0; //"Weak";
  }
};

export default defineComponent({
  components: {
    XSvgIcon,
  },
  setup() {
    const { t } = useI18n();
    const [route, router] = [useRoute(), useRouter()];
    function useRegisterForm() {
      const form = reactive({
        email: "",
        code: "",
        password: "",
        repeatPassword: "",
      });
      const passwordStrength = ref(0);
      const onChangePassword = () => {
        passwordStrength.value = pwsStrengthChecker(form.password);
        // console.log("onChange", passwordStrength.value);
      };
      /** 锁住发送验证码按钮 */
      const isLockSendEamil = ref(false);
      const countdownSendEamil = ref(0);
      let counter: number;
      const isLoadingSubmit = ref(false);
      const onSendEmailCode = async () => {
        const { email } = toRaw(form);
        console.log("email", email);
        if (!email.length || !REG_OBJ.email.test(email)) {
          message.warning(t("pageLogin.emailPlaceholder"));
          return;
        }
        if (isLockSendEamil.value) {
          return;
        }
        const resultSendCaptcha = await apiSendSignUpEmailCaptcha({
          email,
          type: "RESET_PASSWORD",
        });
        if (resultSendCaptcha.err) return;
        // 验证码发送成功 提示语 按钮60秒禁用 ?
        message.success(t("pageLogin.verificationSend"));
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
        onUnmounted(() => counter && clearInterval(counter));
      };
      const onSubmit = async () => {
        const { email, code, password, repeatPassword } = toRaw(form);
        if (
          !email.length ||
          !code.length ||
          !password.length ||
          !repeatPassword.length
        ) {
          message.warning(t("pageLogin.plsCompleteForm"));
          return;
        }
        if (password !== repeatPassword) {
          message.warning(t("pageLogin.diffPwd"));
          return;
        }
        isLoadingSubmit.value = true;
        const resultResetPwd = await apiResetPwd({
          email,
          newPassword: password,
          code,
          nknPublicKey: "",
        });
        isLoadingSubmit.value = false;
        if (resultResetPwd.err) {
          console.log(resultResetPwd.err);
          message.warning(resultResetPwd.err.message);
          return;
        }
        notification.success({
          message: t("pageLogin.resetSuccess"),
        });
        useDelay().then(() => router.replace({ name: "Login" }));
      };
      const onRouteToLogin = () => {
        const queryRedirect = route.query.redirect as string;
        if (queryRedirect) {
          router.push({
            name: "Login",
            query: {
              redirect: queryRedirect,
            },
          });
        } else {
          router.push({ name: "Login" });
        }
      };
      return {
        form,
        passwordStrength,
        onChangePassword,
        isLockSendEamil,
        countdownSendEamil,
        isLoadingSubmit,
        onSendEmailCode,
        onSubmit,
        onRouteToLogin,
      };
    }
    return {
      ...useRegisterForm(),
    };
  },
});
</script>

<style lang="less" scoped>
.ant-checkbox-inner {
  border-radius: 4px;
}
:deep(.ant-input-group-addon) {
  padding: 0 !important;
  border: none;
}
</style>