<template>
  <div class="w-full h-full bg-white">
    <MHeader :title="$t('common.signIn')" class="van-hairline--bottom" />
    <van-form class="pt-4 mb-6 bg-white" @submit="onSubmit">
      <div class="px-2 mb-6 font-16">
        <van-field
          size="large"
          :style="{
            'font-size': '16px',
            background: 'transparent',
            'padding-bottom': '20px',
          }"
          v-model="formLogin.email"
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
              class="mr-2 font-16"
              name="closed-eye"
            />
          </template>
        </van-field>
        <!-- vant 的边框bug ,这里价格透明的去显示出van-field 原来的边框 -->
        <div
          class="mx-8"
          :style="{
            'border-bottom': '1px solid transparent',
          }"
        ></div>
      </div>
      <div class="px-6 mb-6">
        <van-checkbox v-model="isRememberMe" class="font-14">
          <span class="text-gray"> 记住我 </span>
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
          登录
        </van-button>
      </div>
    </van-form>
    <div class="flex items-center justify-between px-6 mb-10">
      <router-link to="/resetpassword" class="font-14 ant-blue">
        忘记密码?
      </router-link>
      <router-link to="/register" class="font-14 ant-blue">
        马上注册
      </router-link>
    </div>
    <div
      class="relative mx-6"
      :style="{
        'border-top': '1px solid rgba(0,0,0,.1)',
      }"
    >
      <div
        class="absolute bg-white font-12 px-6"
        :style="{
          color: 'rgba(0,0,0,.2)',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
        }"
      >
        其他登录方式
      </div>
      <div class="flex items-center justify-center pt-6">
        <div class="flex flex-col items-center">
          <img
            src="~@/assets/images/nkn_gray.png"
            class="w-8 h-8 mb-1"
            alt=""
          />
          <span class="font-12 text-gray">nMobile</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { apiEmailLogin } from "@/apollo/api";
import { useUserStore } from "@/store";
import { Toast } from "vant";
import { computed, defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MHeader } from "../../components";

export default defineComponent({
  components: {
    MHeader,
  },
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
      }
    };
    const isPasswordVisible = ref(false);
    const onSwitchIsPasswordVisible = () =>
      (isPasswordVisible.value = !isPasswordVisible.value);
    return {
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

<style scoped>
/* header { */
/* box-shadow: 0 2px 18px 0 rgba(0, 0, 0, 0.07); */
/* border-bottom: 1px solid rgba(0, 0, 0, 0.07); */
/* } */
</style>