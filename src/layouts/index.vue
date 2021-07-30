<template>
  <keep-alive>
    <component :is="curLayout"></component>
  </keep-alive>
</template>

<script lang="ts">
import { useUserStore } from "@/store";
import { defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Common from "./Common.vue";
import SharedFile from "./SharedFile.vue";

type Layout = "SharedFile" | "Common";

export default defineComponent({
  components: {
    Common,
    SharedFile,
  },
  setup() {
    const userStore = useUserStore();
    const route = useRoute();
    const curLayout = ref<Layout>("Common");
    /** 不重复设置相同的值 */
    const dupSetCurLayout = (str: Layout) => {
      if (curLayout.value !== str) curLayout.value = str;
    };
    watch(
      () => route,
      (newVal) => {
        // console.log("layout-index-watch-route", newVal);
        // 如果是 分享链接页面&&未登录 , 用SharedFile layout
        dupSetCurLayout(
          newVal.path.includes("sharedFile") && !userStore.isLoggedIn
            ? "SharedFile"
            : "Common"
        );
      },
      {
        immediate: true,
      }
    );
    return { curLayout };
  },
});
</script>

<style scoped>
</style>