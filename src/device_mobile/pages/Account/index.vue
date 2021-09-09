<template>
  <div class="p-10">
    <h1 class="mb-4">手机版账户页-TODO</h1>
    <div>
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
    const onLogout = () => {
      console.log("onLogout");
      userStore.signOutAndClear();
      router.push("/login");
    };
    return { onLogout };
  },
});
</script>

<style scoped>
</style>