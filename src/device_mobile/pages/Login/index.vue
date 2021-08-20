<template>
  <div>
    <header class="px-4 mb-4 bg-white h-16 flex items-center">
      <div class="mr-4">
        <img class="w-8 h-8" src="~@/assets/images/logo_icon.png" alt="" />
      </div>
      <div class="font-20">登录</div>
    </header>
    <van-form class="pt-10" @submit="onSubmit">
      <div class="px-4 mb-6">
        <van-field
          :style="{
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          v-model="formLogin.email"
          name="邮箱"
          placeholder="邮箱"
        >
          <!-- :rules="[{ required: true, message: '请填写邮箱' }]" -->
          <template #left-icon>
            <van-icon class="mr-2" name="envelop-o" />
          </template>
        </van-field>
        <van-field
          :style="{
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          left-icon="smile-o"
          v-model="formLogin.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          name="密码"
          placeholder="密码"
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
              class="mr-2"
              name="closed-eye"
            />
          </template>
        </van-field>
      </div>

      <div class="px-4">
        <van-button
          class="font-16 h-12"
          round
          block
          type="primary"
          native-type="submit"
          :loading="isLoadingSubmit"
          :disabled="isFormUnfinished"
        >
          登入
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts">
import { apiEmailLogin } from "@/apollo/api";
import { useUserStore } from "@/store";
import { Toast } from "vant";
import { computed, defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const formLogin = reactive({
      email: "",
      password: "",
    });
    const isFormUnfinished = computed(() => {
      return !formLogin.email || !formLogin.password;
    });
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
      }
    };
    const isPasswordVisible = ref(false);
    const onSwitchIsPasswordVisible = () =>
      (isPasswordVisible.value = !isPasswordVisible.value);
    return {
      formLogin,
      isFormUnfinished,
      isLoadingSubmit,
      onSubmit,
      isPasswordVisible,
      onSwitchIsPasswordVisible,
    };
  },
});
</script>

<style scoped>
header {
  box-shadow: 0 2px 18px 0 rgba(0, 0, 0, 0.07);
}
</style>