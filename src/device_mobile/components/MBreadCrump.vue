<template>
  <div>
    <template v-for="(title, idx) in titleArr" :key="title">
      <div>{{ title }}</div>
      <span v-if="idx < titleArr.length - 1" class="px-2 text-gray-400">/</span>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    titleArr: {
      type: Array,
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