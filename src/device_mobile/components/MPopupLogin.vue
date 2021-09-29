<template>
  <van-popup
    :show="visible"
    @update:show="updateVisible"
    :style="{
      'border-radius': '4px',
    }"
  >
    <div class="w-screen pb-6 relative">
      <div
        class="
          text-center
          font-16
          h-11
          flex
          items-center
          justify-center
          bg-gray-100
          relative
        "
        :style="{
          margin: '0 0 12px 0',
          'border-bottom': '1px solid #e7e7e7',
        }"
      >
        {{ $t("pageLogin.welcomeUsage") }}
        {{ $t("pageLogin.productName") }}
        <div
          class="absolute cursor-pointer"
          @click="updateVisible(false)"
          :style="{
            right: '14px',
          }"
        >
          <van-icon name="cross" />
        </div>
      </div>
      <!-- LOGO -->
      <div
        class="h-20 flex items-center justify-center mb-3"
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
      <!-- 登录模式 -->
      <div
        class="flex items-center justify-center font-16 mb-5"
        :style="{
          color: '#505050',
        }"
      >
        <div
          class="w-24 cursor-pointer text-center"
          :class="{
            'ant-blue': loginType === 'password',
          }"
          @click="onChangeLoginType('password')"
        >
          密码登录
        </div>
        <div
          class="mx-2"
          :style="{
            width: '1px',
            height: '20px',
            'background-color': '#e7e7e7',
          }"
        ></div>
        <div
          class="w-24 cursor-pointer text-center"
          :class="{
            'ant-blue': loginType === 'nMobile',
          }"
          @click="onChangeLoginType('nMobile')"
        >
          nMobile
        </div>
        <div
          class="mx-2"
          :style="{
            width: '1px',
            height: '20px',
            'background-color': '#e7e7e7',
          }"
        ></div>
        <div
          class="w-24 cursor-pointer text-center"
          :class="{
            'ant-blue': loginType === 'webAuthn',
          }"
          @click="onChangeLoginType('webAuthn')"
        >
          webAuthn
        </div>
      </div>
      <section
        class="mx-auto font-14"
        :style="{
          width: '320px',
        }"
      >
        <!-- 表单区 -->
        <!-- 登录的form -->
        <div
          v-if="formType === 'signIn'"
          class="mb-5"
          :style="{
            border: '1px solid #e7e7e7',
            'border-radius': '8px',
          }"
        >
          <div
            class="flex h-11 items-center px-5"
            :style="{
              'border-bottom': '1px solid #e7e7e7',
            }"
          >
            <div class="w-14">
              {{ $t("pageLogin.emailLabel") }}
            </div>
            <input
              class="inputModalLogin w-36"
              type="text"
              placeholder="请输入邮箱"
              v-model="form.email"
            />
          </div>
          <div class="flex h-11 items-center px-5">
            <div class="w-14">
              {{ $t("pageLogin.passwordLabel") }}
            </div>
            <input
              class="inputModalLogin w-36"
              type="password"
              placeholder="请输入密码"
              v-model="form.password"
            />
            <div
              class="ml-auto cursor-pointer ant-blue"
              @click="onClickForgetPwd"
            >
              {{ $t("pageLogin.forgetPassword") }}
            </div>
          </div>
        </div>
        <!-- 注册的form -->
        <div
          v-else
          class="mb-5"
          :style="{
            border: '1px solid #e7e7e7',
            'border-radius': '8px',
          }"
        >
          <div
            class="flex h-11 items-center px-5"
            :style="{
              'border-bottom': '1px solid #e7e7e7',
            }"
          >
            <div class="w-14">
              {{ $t("pageLogin.emailLabel") }}
            </div>
            <input
              class="inputModalLogin w-36"
              type="text"
              placeholder="请输入邮箱"
              v-model="signUpForm.email"
            />
            <div
              class="ml-auto cursor-pointer ant-blue"
              @click="onSendEmailCode"
            >
              {{
                isLockSendEamil
                  ? countdownSendEamil
                  : $t("countdown.normalText")
              }}
            </div>
          </div>
          <div class="flex h-11 items-center px-5">
            <div class="w-14">
              {{ $t("account.verifyCode") }}
            </div>
            <input
              class="inputModalLogin w-36"
              type="text"
              placeholder="请输入验证码"
              v-model="signUpForm.code"
            />
          </div>
        </div>

        <div
          v-if="formType === 'signIn'"
          class="flex items-center justify-between mb-5"
        >
          <van-button
            class="rounded font-14"
            @click.prevent="onSwitchFormType('signUp')"
            :style="{
              width: '150px',
              'border-radius': '8px',
              height: '40px',
              'line-height': '40px',
            }"
          >
            {{ $t("pageLogin.registerButton") }}</van-button
          >
          <van-button
            type="primary"
            class="rounded font-14"
            :loading="submitLoading"
            @click.prevent="onSubmit"
            :style="{
              width: '150px',
              'border-radius': '8px',
              height: '40px',
              'line-height': '40px',
            }"
          >
            {{ $t("pageLogin.loginButton") }}</van-button
          >
        </div>
        <div v-else class="flex items-center justify-center mb-5 relative">
          <a
            class="absolute rounded-full cursor-pointer font-16 text-gray-400"
            :style="{
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
            }"
            href="javascript:;"
            @click="onSwitchFormType('signIn')"
          >
            <van-icon
              name="down"
              :style="{
                transform: 'rotate(90deg)',
              }"
            />
          </a>
          <van-button
            type="primary"
            class="rounded font-14"
            :loading="signUpSubmitLoading"
            @click.prevent="onSignUpSubmit"
            :style="{
              width: '150px',
              'border-radius': '8px',
              height: '40px',
              'line-height': '40px',
            }"
          >
            登录 / 注册
          </van-button>
        </div>
      </section>
      <div
        class="text-center mb-2 font-12"
        :style="{
          color: '#999',
        }"
      >
        其他登录方式
      </div>
      <div class="flex items-center justify-center mb-6">
        <van-button
          type="primary"
          class="text-white moneyBtn"
          :style="{
            height: '30px',
            'border-radius': '4px',
          }"
        >
          <div class="flex items-center">
            <img
              src="~@/assets/images/money_button.png"
              alt=""
              :style="{
                width: '22px',
                height: '22px',
              }"
            />
            <div
              class="mx-2 opacity-30"
              :style="{
                width: '1px',
                height: '14px',
                'background-color': '#fff',
              }"
            ></div>
            Sign in with Money Button
          </div>
        </van-button>
      </div>
      <div
        class="font-12 text-center"
        :style="{
          color: '#999',
        }"
      >
        <div>未注册过比特网盘的邮箱，我们将自动帮你注册账号</div>
        <div>
          登录或完成注册即代表你同意
          <a class="ant-blue" href="javascript:;">用户协议</a>
          和
          <a class="ant-blue" href="javascript:;">隐私政策</a>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script lang="ts">
import {
  apiEmailLogin,
  apiSendSignUpEmailCaptcha,
  apiSignUp,
} from "@/apollo/api";
import { REG_OBJ } from "@/constants";
import { useBaseStore, useUserStore } from "@/store";
import { getRandomNumAndStr, useSvgWhiteLogo } from "@/utils";
import { Dialog, Toast } from "vant";
import { defineComponent, onUnmounted, reactive, ref, toRaw, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import MSvgIcon from "./MSvgIcon.vue";

type LoginType = "password" | "nMobile" | "webAuthn";
type FormType = "signIn" | "signUp";

export default defineComponent({
  components: {
    MSvgIcon,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const userStore = useUserStore();
    const baseStore = useBaseStore();
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    /** logo和名称tips */
    function useLogoSvgAndName() {
      return {
        svgStr: useSvgWhiteLogo(),
      };
    }
    const [route, router] = [useRoute(), useRouter()];
    const loginType = ref<LoginType>("password");
    const onChangeLoginType = (s: LoginType) => (loginType.value = s);
    const formType = ref<FormType>("signIn");
    const form = reactive({
      email: "",
      password: "",
    });
    const resetForm = () => {
      form.email = "";
      form.password = "";
    };
    const signUpForm = reactive({
      email: "",
      code: "", // 验证码
    });
    const resetSignUpForm = () => {
      signUpForm.email = "";
      signUpForm.code = "";
    };
    const submitLoading = ref(false);
    const signUpSubmitLoading = ref(false);
    const isLockSendEamil = ref(false);
    const countdownSendEamil = ref(0);
    let counter: number;
    const onSendEmailCode = async () => {
      const { email } = toRaw(signUpForm);
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
    const onSubmit = async () => {
      if (!form.email || !form.password) {
        Toast("请完善表单");
        return;
      }
      console.log("校验通过,开始登录");
      submitLoading.value = true;
      const resultEmailLogin = await apiEmailLogin({
        email: form.email,
        password: form.password,
      });
      submitLoading.value = false;
      if (resultEmailLogin.err) {
        // Modal.error(err); // initApollo onError 会报错
        return;
      }
      console.log("apiEmailLogin", resultEmailLogin.data);
      const { token } = resultEmailLogin.data.signin;
      const { id, username } = resultEmailLogin.data.signin.user;
      const { signInFullPath } = useUserStore();
      const resultSignInFullPath = await signInFullPath({
        id,
        token,
        username,
        email: form.email,
      });
      if (resultSignInFullPath.err) return;
      Toast("登录成功");
      resetForm();
      resetSignUpForm();
      baseStore.changeIsShowLoginModal(false);
    };
    const onSignUpSubmit = async () => {
      const { email, code } = signUpForm;
      if (!email || !code) {
        Toast("请完善表单");
        return;
      }
      // TODO
      // 根据邮箱, 验证码 生成随机6位密码登录, 弹窗6位密码的提示
      // getRandomNumAndStr
      const password = getRandomNumAndStr(6);
      signUpSubmitLoading.value = true;
      const resultSignUp = await apiSignUp({
        email,
        password,
        code,
        username: email.split("@")[0],
        nknPublicKey: "",
      });
      if (resultSignUp.err) {
        signUpSubmitLoading.value = false;
        // TODO 注册失败?
        console.log(resultSignUp.err);
        Toast(resultSignUp.err.message);
        return;
      }
      const resultEmailLogin = await apiEmailLogin({ email, password });
      if (resultEmailLogin.err) {
        signUpSubmitLoading.value = false;
        // Modal.error(err); // initApollo onError 会报错
        Toast(t("pageLogin.loginFailed"));
        return;
      }
      const { token } = resultEmailLogin.data.signin;
      const { id, username } = resultEmailLogin.data.signin.user;
      const resultSignInFullPath = await userStore.signInFullPath({
        id,
        token,
        username,
        email,
      });
      signUpSubmitLoading.value = false;
      if (resultSignInFullPath.err) {
        signUpSubmitLoading.value = false;
        Toast(resultSignInFullPath.err.message);
        return;
      }
      Dialog.alert({
        title: "登录/注册成功!",
        message: `新密码是 ${password}`,
      }).then(() => {
        resetForm();
        resetSignUpForm();
        baseStore.changeIsShowLoginModal(false);
      });
    };
    const onSwitchFormType = (t: FormType) => {
      if (t === "signIn") {
        resetForm();
        formType.value = "signIn";
      } else {
        resetSignUpForm();
        formType.value = "signUp";
      }
    };
    const onClickForgetPwd = () => {
      // emit("update:visible", false);
      // router.push({
      //   name: "ResetPwd",
      //   query: { redirect: route.fullPath },
      // });
      window.open(router.resolve({ name: "ResetPwd" }).href, "_blank");
    };
    return {
      ...useLogoSvgAndName(),
      updateVisible,
      loginType,
      onChangeLoginType,
      formType,
      form,
      signUpForm,
      submitLoading,
      signUpSubmitLoading,
      onSubmit,
      onSignUpSubmit,
      isLockSendEamil,
      countdownSendEamil,
      onSendEmailCode,
      onSwitchFormType,
      onClickForgetPwd,
    };
  },
});
</script>

<style lang="less" scoped>
.inputModalLogin {
  &:focus {
    outline: none;
    border: none;
  }
}
.moneyBtn {
  &:hover {
    // background-color: #4b8ce1 !important;
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
}
</style>
