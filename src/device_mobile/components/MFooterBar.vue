<template>
  <footer
    class="
      absolute
      py-2
      px-4
      flex
      items-center
      justify-between
      bg-white
      bottom-0
      left-0
      right-0
    "
    :style="{
      'box-shadow': '0 2px 6px #404a66',
    }"
  >
    <slot />
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style scoped>
</style>