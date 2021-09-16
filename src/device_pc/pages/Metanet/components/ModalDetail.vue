<template>
  <!-- v-model:value="value" -->
  <a-modal
    centered
    destroyOnClose
    class="modalDetail font-lato"
    :title="null"
    :footer="null"
    :visible="visible"
    @update:visible="updateFromAModal"
  >
    <!-- 原本关闭的icon 是16x16的 -->
    <!-- top -->
    <div class="flex">
      <!-- 因为icon 设计的不标准, 所以这里为了好看, 如果是文件夹类型的话就加个padding -->
      <div
        class="w-2/4"
        :class="{
          'p-5': detail.type === 'folder',
        }"
      >
        <XFileTypeIcon :type="detail.type" />
      </div>
      <div class="w-2/4">
        <template v-for="(value, key) in detail">
          <slot :name="key" :record="detail">
            <a-row class="mb-1" justify="space-between" :key="key">
              <a-col class="ant-color-gray" :span="6">{{
                formatDetailKey(key)
              }}</a-col>
              <template v-if="canShowToolTipKeys.includes(key)">
                <a-tooltip :title="value">
                  <a-col :span="17" class="truncate">{{ value }}</a-col>
                </a-tooltip>
              </template>
              <a-col v-else :span="17" class="truncate">{{ value }}</a-col>
            </a-row>
          </slot>
        </template>
      </div>
    </div>
    <slot name="bottom" :record="detail" />
    <!-- bottom -->
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { XFileTypeIcon } from "../../../components";

export type TDetailInfo = {
  [key: string]: any;
};
// TODOD 国际化
const MAP_DETAIL_KEY = {
  name: "名称",
  size: "大小",
  type: "类型",
  location: "位置",
  usedSpaceRatio: "占用空间",
  updatedAt: "修改时间",
  insertedAt: "创建时间",
  desc: "描述",
  owner: "所有者",
  shareLink: "分享链接",
  shareHash: "Hash",
};
export default defineComponent({
  components: {
    XFileTypeIcon,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    detail: {
      type: Object as PropType<TDetailInfo>,
      required: true,
    },
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    // 需要显示tooltip 的数组
    const canShowToolTipKeys = ["shareLink", "shareHash"];
    // console.log("props", props.detail);
    /** 穿透v-model */
    const updateFromAModal = (v: boolean) => emit("update:visible", v);
    /** map出文字 */
    const formatDetailKey = (k: keyof typeof MAP_DETAIL_KEY) =>
      MAP_DETAIL_KEY[k];
    return { updateFromAModal, formatDetailKey, canShowToolTipKeys };
  },
});
</script>

<style scoped>
</style>