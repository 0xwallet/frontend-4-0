<template>
  <div>
    <div @click="onShowActionsheet">
      <!-- <img class="w-5 h-5" src="~@/assets/svg/mobile-translate.svg" alt="" /> -->
      <MSvgIcon icon="translate" :size="20" />
    </div>
    <van-action-sheet
      teleport="body"
      close-on-click-action
      v-model:show="isShowActionsheet"
    >
      <div class="content">
        <div
          class="font-16 py-3 text-center"
          v-for="item in actions"
          :class="{
            'ant-blue': item.selected,
          }"
          :key="item.name"
          @click="onSelectItem(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { defineComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import MSvgIcon from "./MSvgIcon.vue";

export default defineComponent({
  components: {
    MSvgIcon,
  },
  setup() {
    const globalComposer = useI18n();
    const isShowActionsheet = ref(false);
    const onShowActionsheet = () => {
      isShowActionsheet.value = true;
    };
    const localeStorage = useLocalStorage("locale", "zh_CN");
    const actions = reactive([
      { name: "简体中文", value: "zh_CN", selected: true },
      { name: "English", value: "en_US", selected: false },
    ]);
    console.log("localeStorage", localeStorage.value);
    // 首次打开 检查localstorage里的
    actions.forEach((e) => (e.selected = e.value === localeStorage.value));
    const onSelectItem = (item: { name: string; value: string }) => {
      globalComposer.locale.value = item.value;
      localeStorage.value = item.value;
      // 默认情况下点击选项时不会自动收起
      // 可以通过 close-on-click-action 属性开启自动收起
      isShowActionsheet.value = false;
      actions.forEach((e) => {
        e.selected = e.value === item.value;
      });
    };
    return {
      isShowActionsheet,
      onShowActionsheet,
      actions,
      onSelectItem,
    };
  },
});
</script>

<style scoped>
</style>