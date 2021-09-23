<template>
  <span
    class="inline-block w-1.5 h-1.5 rounded-full align-middle"
    :style="{
      'background-color': STATUS_COLOR_MAP[type],
    }"
  ></span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

type DotTypes = "default" | "processing" | "success" | "error";
const STATUS_COLOR_MAP: { [key in DotTypes]: string } = {
  default: "#d9d9d9",
  processing: "#1890ff",
  success: "#52c41a",
  error: "#ff4d4f",
};

export default defineComponent({
  props: {
    type: {
      type: String as PropType<DotTypes>,
      default: "success",
    },
  },
  setup() {
    return { STATUS_COLOR_MAP };
  },
});
</script>

<style scoped>
</style>