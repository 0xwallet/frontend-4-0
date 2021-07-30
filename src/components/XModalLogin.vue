<template>
  <a-modal
    :width="356"
    destroyOnClose
    :visible="visible"
    @update:visible="updateVisible"
    @cancel="onModalCancel"
    :footer="null"
    :bodyStyle="{ padding: '18px 12px', border: '1px solid #f2f2f2' }"
  >
    <div class="px-5 font-semibold text-xl mb-10">账号密码登录</div>
    <a-form class="px-5" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
      <a-form-item v-bind="validateInfos.email">
        <a-input
          v-model:value="modelRef.email"
          :placeholder="$t('pageLogin.email')"
        />
      </a-form-item>
      <a-form-item v-bind="validateInfos.password">
        <a-input-password
          visibilityToggle
          v-model:value="modelRef.password"
          :placeholder="$t('pageLogin.password')"
        />
      </a-form-item>
      <a-form-item class="pt-7" :wrapper-col="{ span: 24 }">
        <a-button
          size="large"
          :loading="submitLoading"
          block
          type="primary"
          @click.prevent="onSubmit"
          >{{ $t("pageLogin.loginButton") }}</a-button
        >
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { apiEmailLogin } from "@/apollo/api";
import { useUserStore } from "@/store";
import { useForm } from "@ant-design-vue/use";
import { defineComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:visible", "ok"],
  setup(props, { emit }) {
    const { t } = useI18n();
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
    return {
      onModalCancel,
      updateVisible,
      modelRef,
      validateInfos,
      submitLoading,
      onSubmit,
    };
  },
});
</script>

<style scoped>
</style>