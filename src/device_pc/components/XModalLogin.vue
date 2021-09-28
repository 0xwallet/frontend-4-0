<template>
  <a-modal
    :width="500"
    :closable="false"
    destroyOnClose
    centered
    :visible="visible"
    @update:visible="updateVisible"
    @cancel="onModalCancel"
    :footer="null"
    :bodyStyle="{ padding: '18px 12px', border: '1px solid #f2f2f2' }"
    transitionName="fadeDown"
    wrapClassName="modalLogin"
  >
    <div class="px-5 pt-3 text-center font-semibold text-2xl mb-6">
      登录到比特网盘
    </div>
    <a-form class="px-5" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
      <a-form-item v-bind="validateInfos.email" class="mb-4">
        <div
          class="mb-1 font-14 text-gray-400"
          :style="{
            height: '26px',
            'line-height': '26px',
          }"
        >
          {{ $t("pageLogin.emailLabel") }}
        </div>
        <a-input
          size="large"
          class="inputModalLogin"
          :style="{}"
          v-model:value="modelRef.email"
        />
      </a-form-item>
      <a-form-item v-bind="validateInfos.password" class="mb-4">
        <div
          class="mb-1 font-14 text-gray-400"
          :style="{
            height: '26px',
            'line-height': '26px',
          }"
        >
          {{ $t("pageLogin.passwordLabel") }}
        </div>
        <a-input-password
          size="large"
          :visibilityToggle="false"
          class="inputModalLogin"
          v-model:value="modelRef.password"
        />
      </a-form-item>
      <a-form-item class="pt-4" :wrapper-col="{ span: 24 }">
        <div class="flex items-center justify-between">
          <a-button
            type="primary"
            class="rounded font-16 px-4"
            :loading="submitLoading"
            @click.prevent="onSubmit"
            :style="{
              border: 'none',
              'border-radius': '4px',
              height: '36px',
              'line-height': '36px',
            }"
          >
            <XSvgIcon icon="check" :size="16" class="mr-1" />
            {{ $t("pageLogin.loginButton") }}</a-button
          >
          <a
            href="javascript:;"
            class="ant-color-blue-6"
            @click="onClickForgetPwd"
            >{{ $t("pageLogin.forgetPassword") }}</a
          >
        </div>
      </a-form-item>
    </a-form>
    <div class="text-center mb-4">
      <div
        class="w-40 mx-auto"
        :style="{
          height: '1px',
          background: '#eee',
        }"
      ></div>
    </div>
    <div class="flex items-center justify-center pb-4">
      <a href="javascript:;" class="mr-2">
        <img src="~@/assets/images/nkn_gray.png" class="w-6 h-6" alt="" />
      </a>
      <a href="javascript:;" class="mr-2">
        <img src="~@/assets/images/nkn_gray.png" class="w-6 h-6" alt="" />
      </a>
      <a href="javascript:;">
        <img src="~@/assets/images/nkn_gray.png" class="w-6 h-6" alt="" />
      </a>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { apiEmailLogin } from "@/apollo/api";
import { useUserStore } from "@/store";
import { useForm } from "@ant-design-vue/use";
import { defineComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import XSvgIcon from "./XSvgIcon.vue";
// import { CheckOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    // CheckOutlined,
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
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    const onModalCancel = () => {
      updateVisible(false);
    };
    const modelRef = reactive({
      email: "",
      password: "",
    });
    const rulesRef = reactive({
      email: [
        {
          type: "email",
          required: true,
          message: t("pageLogin.emailPlaceholder"),
        },
      ],
      password: [
        {
          required: true,
          message: t("pageLogin.passwordPlaceholder"),
        },
      ],
    });
    const { resetFields, validate, validateInfos } = useForm(
      modelRef,
      rulesRef
    );
    const submitLoading = ref(false);
    const onSubmit = () => {
      validate().then(async () => {
        console.log("校验通过,开始登录");
        submitLoading.value = true;
        const resultEmailLogin = await apiEmailLogin({
          email: modelRef.email,
          password: modelRef.password,
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
          email: modelRef.email,
        });
        resetFields();
        setTimeout(() => {
          window.location.reload();
        }, 0);
        if (resultSignInFullPath.err) return;
      });
    };
    const onClickForgetPwd = () => {
      emit("update:visible", false);
      router.push({
        name: "ResetPwd",
        query: { redirect: route.fullPath },
      });
    };
    return {
      onModalCancel,
      updateVisible,
      modelRef,
      validateInfos,
      submitLoading,
      onSubmit,
      onClickForgetPwd,
    };
  },
});
</script>

<style lang="less">
.modalLogin {
  .ant-modal-content {
    border-radius: 4px;
  }
}
</style>
<style lang="less" scoped>
.inputModalLogin {
  height: 40px;
  line-height: 40px;
  color: #555;
  border: none;
  outline: none;
  border-radius: 4px;
  background-color: rgba(238, 238, 238, 0.6) !important;
  &:focus {
    color: #25282c;
    background-color: #fff !important;
    box-shadow: 0 0 2px 2px rgba(53, 126, 221, 0.6) !important;
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