
<template>
  <div
    :style="{
      'padding-top': 0,
    }"
  >
    <!-- tab 正在上传 传输完成 文件空投 -->
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane
        v-for="(value, key) in tabKeyNameMap"
        :key="key"
        :tab="calcTabKeyText(key)"
      ></a-tab-pane>
    </a-tabs>
    <keep-alive>
      <component :is="activeKey"></component>
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Uploading from "./Uploading.vue";
import UploadFinished from "./UploadFinished.vue";
import PeerTransfer from "./PeerTransfer.vue";
import { useTransportStore } from "@/store";
import { useRoute, useRouter } from "vue-router";

type TabKey = "Uploading" | "UploadFinished" | "PeerTransfer";

export default defineComponent({
  name: "Transport",
  components: {
    Uploading,
    UploadFinished,
    PeerTransfer,
  },
  setup() {
    const activeKey = ref<TabKey>("Uploading");
    const router = useRouter();
    const route = useRoute();
    // activeKey 与路由query 绑定 -start
    const queryTab = route.query.tab as TabKey;
    const queryTabKeys: TabKey[] = [
      "Uploading",
      "UploadFinished",
      "PeerTransfer",
    ];
    if (!queryTab || !queryTabKeys.includes(queryTab)) {
      activeKey.value = "Uploading";
      router.replace({ query: { tab: "Uploading" } });
    } else {
      activeKey.value = queryTab;
    }
    watch(
      () => activeKey.value,
      (newVal) => router.replace({ query: { tab: newVal } })
    );
    // activeKey 与路由query 绑定 -end
    const tabKeyNameMap: { [key in TabKey]: string } = {
      Uploading: "正在上传",
      UploadFinished: "传输完成",
      PeerTransfer: "文件空投",
    };
    const transPortStore = useTransportStore();
    const calcTabKeyText = (key: TabKey) => {
      const uploadingCount = transPortStore.uploadingList.length;
      const uploadSuccessCount = transPortStore.uploadSuccessList.length;
      if (key === "Uploading")
        return `${tabKeyNameMap[key]}(${uploadingCount})`;
      if (key === "UploadFinished")
        return `${tabKeyNameMap[key]}(${uploadSuccessCount})`;
      else return tabKeyNameMap[key];
    };
    return {
      activeKey,
      tabKeyNameMap,
      calcTabKeyText,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-tabs-bar) {
  margin: 0 0 10px 0;
}
:deep(.ant-progress-bg) {
  height: 14px !important;
}
</style>