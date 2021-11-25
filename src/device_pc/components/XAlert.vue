<template>
  <div
    class="flex w-80 rounded-xl p-4 opacity-80"
    :style="{
      position: 'fixed',
      top: '50px',
      left: '50%',
      transform: 'translateX(-50%)',
      'background-color': '#fffbe6',
      border: '1px solid #ffe58f',
    }"
  >
    <div class="mr-2">
      <ExclamationCircleOutlined
        class="font-24"
        :style="{
          color: '#faad14',
        }"
      />
    </div>
    <div>
      <div class="font-16 mb-1">
        {{ title }}
      </div>
      <div class="font-14">
        {{ content }}
      </div>
    </div>
    <CloseOutlined
      class="absolute top-3 right-3 cursor-pointer"
      @click="onClickCloseIcon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import {
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    CloseOutlined,
    ExclamationCircleOutlined,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const onClickCloseIcon = () => {
      emit("close");
    };
    return { onClickCloseIcon };
  },
});
</script>

<style scoped>
</style>