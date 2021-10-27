<template>
  <div>path</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const [route, router] = [useRoute(), useRouter()];
    const queryPath = route.query.path as string;
    console.log("queryPath", queryPath);
    // 如果路由没有path, replace一个新的path
    if (!queryPath) {
      router.replace({
        name: "MetanetFile",
        query: {
          path: "~",
        },
      });
    }
    console.log("haha", queryPath);
    return {};
  },
});
</script>

<style scoped>
</style>