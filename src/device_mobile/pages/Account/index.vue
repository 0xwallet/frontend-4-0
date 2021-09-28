<template>
  <div class="p-10">
    <h1 class="mb-4">当前手机版默认主页跳转到- 手机版账户页-TODO</h1>
    <div>
      <van-button class="mr-6" @click="onBack">后退</van-button>
      <van-button type="primary" @click="onLogout"> 退出登录 </van-button>
    </div>
  </div>
</template>

<script lang="ts">
import { useUserStore } from "@/store";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const onBack = () => {
      router.go(-1);
    };
    const onLogout = () => {
      console.log("onLogout");
      userStore.signOutAndClear();
      router.push("/login");
    };
    return {
      onBack,
      onLogout,
    };
  },
});
</script>

<style scoped>
</style>