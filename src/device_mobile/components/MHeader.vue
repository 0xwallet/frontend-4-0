<template>
  <header class="px-4 bg-white h-14 flex items-center">
    <div class="mr-4">
      <img class="w-8 h-8" src="~@/assets/images/logo_icon.png" alt="" />
    </div>
    <div class="font-18">{{ title }}</div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
</style>