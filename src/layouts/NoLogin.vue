<template>
  <div
    class="w-full h-full"
    :style="{
      background: '#f0f2f5',
    }"
  >
    <div class="px-12 h-14 mb-6 bg-white flex items-center justify-between">
      <div>
        <img class="w-7 h-7" src="~@/assets/images/logo_icon.png" alt="" />
      </div>
      <div>
        <a-button class="mr-2" type="primary" @click="onClickHeaderSignIn"
          >注册</a-button
        >
        <a-button @click="onClickHeaderLogin">登录</a-button>
      </div>
    </div>
    <div class="px-20">
      <div class="bg-white">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useBaseStore } from "@/store";
import { message } from "ant-design-vue";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    // 未登录状态的分享文件
    const router = useRouter();
    const route = useRoute();
    const baseStore = useBaseStore();
    const onClickHeaderSignIn = () => {
      message.info("TODO");
      // router.push({
      //   name: "Login",
      //   query: {
      //     callback: route.fullPath,
      //   },
      // });
    };
    const onClickHeaderLogin = () => {
      baseStore.changeIsShowLoginModal(true);
    };
    return { onClickHeaderSignIn, onClickHeaderLogin };
  },
});
</script>

<style scoped>
</style>