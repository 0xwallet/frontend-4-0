<template>
  <van-popup
    :show="visible"
    @update:show="updateVisible"
    :style="{
      'border-radius': '4px',
    }"
  >
    <div class="w-screen pb-6">
      <div class="px-5 pt-8 text-center font-semibold text-2xl mb-6">
        登录到比特网盘
      </div>
      <div class="w-full px-5">
        <div
          class="mb-1 font-14 text-gray-400"
          :style="{
            height: '26px',
            'line-height': '26px',
          }"
        >
          {{ $t("pageLogin.emailLabel") }}
        </div>
        <input class="inputModalLogin mb-4" type="text" v-model="form.email" />
        <div
          class="mb-1 font-14 text-gray-400"
          :style="{
            height: '26px',
            'line-height': '26px',
          }"
        >
          {{ $t("pageLogin.password") }}
        </div>
        <input
          class="inputModalLogin mb-4"
          type="password"
          v-model="form.password"
        />
      </div>
      <div class="px-5 pt-4 mb-4 flex items-center justify-between">
        <van-button
          type="primary"
          class="rounded font-16 px-4"
          :loading="submitLoading"
          @click="onSubmit"
          :style="{
            border: 'none',
            'border-radius': '4px',
            height: '36px',
            'line-height': '36px',
          }"
        >
          <div class="flex items-center">
            <MSvgIcon icon="check" :size="16" class="mr-1" />
            {{ $t("pageLogin.loginButton") }}
          </div>
        </van-button>
        <a href="javascript:;" class="ant-blue" @click="onClickForgetPwd">{{
          $t("pageLogin.forgetPassword")
        }}</a>
      </div>
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
    </div>
  </van-popup>
</template>

<script lang="ts">
import { apiEmailLogin } from "@/apollo/api";
import { useUserStore } from "@/store";
import { Toast } from "vant";
import { defineComponent, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MSvgIcon from "./MSvgIcon.vue";

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
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    const [route, router] = [useRoute(), useRouter()];
    const form = reactive({
      email: "",
      password: "",
    });
    const resetFields = () => {
      form.email = "";
      form.password = "";
    };
    const submitLoading = ref(false);
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
      resetFields();
      Toast("登录成功");
      setTimeout(() => {
        window.location.reload();
      }, 0);
      if (resultSignInFullPath.err) return;
    };
    const onClickForgetPwd = () => {
      emit("update:visible", false);
      router.push({
        name: "ResetPwd",
        query: { redirect: route.fullPath },
      });
    };
    return {
      updateVisible,
      form,
      submitLoading,
      onSubmit,
      onClickForgetPwd,
    };
  },
});
</script>

<style lang="less" scoped>
.inputModalLogin {
  width: 100%;
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
