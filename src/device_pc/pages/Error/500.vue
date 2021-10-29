<template>
  <a-result
    class="pt-20"
    status="500"
    title="500"
    :subTitle="$t('errPage.500_subTitle')"
  >
    <template #extra>
      <a-button shape="round" type="primary" @click="onBackHome">{{
        $t("errPage.backHome")
      }}</a-button>
    </template>
  </a-result>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const onBackHome = () => router.replace({ name: "Dashboard" });
    return { onBackHome };
  },
});
</script>

<style scoped>
</style>