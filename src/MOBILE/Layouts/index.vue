<template>
  <keep-alive>
    <component :is="curLayout"></component>
  </keep-alive>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Common from "./Common.vue";
import NoLogin from "./NoLogin.vue";

export default defineComponent({
  components: {
    Common,
    NoLogin,
  },
  setup() {
    
    const curLayout = ref("");

    return { curLayout };
  },
});
</script>

<style scoped>
</style>