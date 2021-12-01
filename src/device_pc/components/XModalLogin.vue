<template>
  <a-modal
    :width="460"
    :closable="false"
    destroyOnClose
    centered
    :visible="visible"
    @update:visible="updateVisible"
    :footer="null"
    :bodyStyle="{ padding: '0 12px 16px 12px' }"
    transitionName="fadeDown"
    wrapClassName="modalLogin"
  >
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
        margin: '0 -12px 12px -12px',
        'border-bottom': '1px solid #e7e7e7',
      }"
    >
      {{ $t("pageLogin.welcomeUsage") }}
      {{ $t("pageLogin.productName") }}
      <a
        href="javascript:;"
        class="absolute cursor-pointer"
        @click="onModalCancel"
        :style="{
          right: '14px',
        }"
      >
        <CloseOutlined />
      </a>
    </div>
    <div
      class="h-20 flex items-center justify-center mb-3"
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

    <!-- 登录模式 -->
    <div
      class="flex items-center justify-center font-18 mb-4"
      :style="{
        color: '#505050',
      }"
    >
      <!-- <div
        class="w-24 cursor-pointer text-center"
        :class="{
          'ant-color-blue-6': loginType === 'password',
        }"
        @click="onChangeLoginType('password')"
      >
        登录
      </div> -->
      <a-dropdown
        class="w-28 cursor-pointer text-center"
        placement="bottomRight"
      >
        <a
          :class="{ 'ant-color-blue-6': formType !== 'signUp' }"
          @click.prevent="onDropdownMenuItemClick(loginType)"
        >
          {{ LOGINTYPE_MAP[loginType] }}
          <DownOutlined class="" />
        </a>
        <template #overlay>
          <a-menu
            class="py-1"
            :style="{
              'border-radius': '8px',
            }"
          >
            <a-menu-item v-for="item in otherLoginType" :key="item">
              <a href="javascript:;" @click="onDropdownMenuItemClick(item)">{{
                LOGINTYPE_MAP[item]
              }}</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <div
        class="mx-2"
        :style="{
          width: '1px',
          height: '20px',
          'background-color': '#e7e7e7',
        }"
      ></div>
      <div
        class="w-28 cursor-pointer text-center"
        :class="{
          'ant-color-blue-6': formType === 'signUp',
        }"
        @click="onSwitchFormType('signUp')"
      >
        {{ $t("pageLogin.registerButton") }}
      </div>
      <!-- <div
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
          'ant-color-blue-6': loginType === 'webAuthn',
        }"
        @click="onChangeLoginType('webAuthn')"
      >
        webAuthn
      </div> -->
    </div>
    <section
      class="mx-auto"
      :style="{
        width: '400px',
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
            class="inputModalLogin w-52"
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
            class="inputModalLogin w-52"
            type="password"
            placeholder="请输入密码"
            v-model="form.password"
          />
          <div
            class="ml-auto cursor-pointer ant-color-blue-6"
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
            class="inputModalLogin w-52"
            type="text"
            placeholder="请输入邮箱"
            v-model="signUpForm.email"
          />
          <div
            class="ml-auto cursor-pointer ant-color-blue-6"
            @click="onSendEmailCode"
          >
            {{
              isLockSendEamil ? countdownSendEamil : $t("countdown.normalText")
            }}
          </div>
        </div>
        <div class="flex h-11 items-center px-5">
          <div class="w-14">
            {{ $t("account.verifyCode") }}
          </div>
          <input
            class="inputModalLogin w-52"
            type="text"
            placeholder="请输入验证码"
            v-model="signUpForm.code"
          />
        </div>
      </div>

      <div v-if="formType === 'signIn'" class="mb-5">
        <a-button
          block
          type="primary"
          class="rounded font-14"
          :loading="submitLoading"
          @click.prevent="onSubmit"
          :style="{
            'border-radius': '8px',
            height: '40px',
            'line-height': '40px',
          }"
        >
          {{ $t("pageLogin.loginButton") }}</a-button
        >
      </div>
      <div v-else class="mb-5">
        <a-button
          block
          type="primary"
          class="rounded font-14"
          :loading="signUpSubmitLoading"
          @click.prevent="onSignUpSubmit"
          :style="{
            'border-radius': '8px',
            height: '40px',
            'line-height': '40px',
          }"
        >
          {{ $t("pageLogin.loginButton") }}
        </a-button>
      </div>
    </section>
    <div
      class="text-center mb-2"
      :style="{
        color: '#999',
      }"
    >
      其他登录方式
    </div>
    <div class="flex items-center justify-center mb-6">
      <a-button
        type="primary"
        class="text-white flex items-center moneyBtn"
        :style="{
          'border-radius': '4px',
        }"
      >
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
      </a-button>
    </div>
    <div
      class="font-12 text-center"
      :style="{
        color: '#999',
      }"
    >
      <div>
        未注册邮箱验证后自动登录，注册即代表同意
        <a class="ant-color-blue-6" href="javascript:;">用户协议</a>
        和
        <a class="ant-color-blue-6" href="javascript:;">隐私政策</a>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
import {
  apiEmailLogin,
  apiSendSignUpEmailCaptcha,
  apiSignUp,
} from "@/apollo/api";
import { useBaseStore, useUserStore } from "@/store";
import { getRandomNumAndStr, XToast } from "@/utils";
import {
  computed,
  createVNode,
  defineComponent,
  h,
  onUnmounted,
  reactive,
  ref,
  toRaw,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import XSvgIcon from "./XSvgIcon.vue";
import {
  CloseOutlined,
  ArrowLeftOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import { message, Modal, notification } from "ant-design-vue";
import { REG_OBJ } from "@/constants";

type LoginType = "password" | "nMobile" | "webAuthn";
type FormType = "signIn" | "signUp";
const LOGINTYPE_MAP: { [key in LoginType]: string } = {
  password: "登录",
  nMobile: "nMobile",
  webAuthn: "webAuthn",
};
export default defineComponent({
  components: {
    CloseOutlined,
    ArrowLeftOutlined,
    DownOutlined,
    XSvgIcon,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:visible", "ok"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const [route, router] = [useRoute(), useRouter()];
    const userStore = useUserStore();
    const baseStore = useBaseStore();
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    const onModalCancel = () => {
      console.log("onModalCancel");
      // 重置 表单值 和 表单类型
      formType.value = "signIn";
      loginType.value = "password";
      resetForm();
      resetSignUpForm();
      updateVisible(false);
    };
    const loginType = ref<LoginType>("password");
    const otherLoginType = computed(() => {
      const all: LoginType[] = ["password", "nMobile", "webAuthn"];
      return all.filter((i) => i !== loginType.value);
    });
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
        message.warning(t("pageLogin.emailPlaceholder"));
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
    };
    onUnmounted(() => counter && clearInterval(counter));
    const onSubmit = async () => {
      if (!form.email || !form.password) {
        message.warning("请完善表单");
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
      message.success("登录成功!");
      resetForm();
      resetSignUpForm();
      baseStore.changeIsShowLoginModal(false);
    };
    const onSignUpSubmit = async () => {
      const { email, code } = signUpForm;
      if (!email || !code) {
        message.warning("请完善表单");
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
        message.warning(resultSignUp.err.message);
        return;
      }
      const resultEmailLogin = await apiEmailLogin({ email, password });
      if (resultEmailLogin.err) {
        signUpSubmitLoading.value = false;
        // Modal.error(err); // initApollo onError 会报错
        message.warning(t("pageLogin.loginFailed"));
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
        message.warning(resultSignInFullPath.err.message);
        return;
      }
      Modal.success({
        title: "登录/注册成功!",
        content: createVNode("div", {}, [
          createVNode("span", { class: "mr-2" }, "新密码是 "),
          createVNode("span", { style: { color: "red" } }, `${password}`),
        ]),
        onOk: () => {
          resetForm();
          resetSignUpForm();
          baseStore.changeIsShowLoginModal(false);
        },
      });
      ///
    };
    const onSwitchFormType = (t: FormType) => {
      if (t === "signIn") {
        resetForm();
        formType.value = "signIn";
      } else {
        // XToast("输入邮箱，注册账号");
        resetSignUpForm();
        formType.value = "signUp";
      }
    };
    const onDropdownMenuItemClick = (item: LoginType) => {
      onSwitchFormType("signIn");
      onChangeLoginType(item);
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
      onModalCancel,
      updateVisible,
      loginType,
      otherLoginType,
      LOGINTYPE_MAP,
      onChangeLoginType,
      formType,
      form,
      signUpForm,
      isLockSendEamil,
      countdownSendEamil,
      onSendEmailCode,
      submitLoading,
      signUpSubmitLoading,
      onSubmit,
      onSignUpSubmit,
      onSwitchFormType,
      onDropdownMenuItemClick,
      onClickForgetPwd,
    };
  },
});
</script>

<style lang="less">
.modalLogin {
  .ant-modal-content {
    border-radius: 8px;
  }
}
</style>
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

<style lang="less">
// 登录弹窗动画
// ant-design modal 动画 https://github.com/ant-design/ant-design/issues/16435
.fadeDown-enter,
.fadeDown-appear {
  animation-duration: 0.2s;
  animation-fill-mode: both;
  animation-play-state: paused;
}

.fadeDown-leave {
  animation-duration: 0.2s;
  animation-fill-mode: both;
  animation-play-state: paused;
}

.fadeDown-enter.fadeDown-enter-active,
.fadeDown-appear.fadeDown-appear-active {
  animation-name: antFadeInSlide;
  animation-play-state: running;
}

.fadeDown-leave.fadeDown-leave-active {
  animation-name: antFadeOutSlide;
  animation-play-state: running;
  pointer-events: none;
}

.fadeDown-enter,
.fadeDown-appear {
  opacity: 0;
  animation-timing-function: linear;
}

.fadeDown-leave {
  animation-timing-function: linear;
}

@keyframes antFadeInSlide {
  0% {
    opacity: 0;
    transform: translateY(-16px);
  }

  100% {
    opacity: 1;
    transform: translateY(0px);
  }
}

@keyframes antFadeOutSlide {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }

  100% {
    opacity: 0;
    transform: translateY(-16px);
  }
}
</style>