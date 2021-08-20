<template>
  <!-- 弹窗 我的文件夹 -->
  <a-modal
    destroyOnClose
    :title="title"
    :visible="visible"
    @update:visible="updateVisible"
    @ok="onOk"
    :bodyStyle="{ padding: '18px 12px', border: '1px solid #f2f2f2' }"
  >
    <!-- padding: '18px 12px', -->
    <a-table
      size="small"
      :rowKey="rowKey"
      :showHeader="false"
      :pagination="false"
      :style="{
        border: '1px solid #eff2f9',
      }"
      :defaultExpandedRowKeys="['root']"
      :rowClassName="rowClassName"
      :columns="columns"
      :dataSource="dataSource"
      :customRow="customRow"
      :loading="loading"
    >
      <!-- <template #name="{ record }"> -->
      <template #name="{ record }">
        <div class="inline-block">
          <!-- 空白就是blank 文件夹就是folder -->
          <XFileTypeIcon class="w-4 h-4" type="folder" />
          <a href="javascript:;" class="ml-1">{{ record.dirName }}</a>
        </div>
      </template>
    </a-table>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { XFileTypeIcon } from "./";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
    rowKey: {
      type: String,
      required: true,
    },
    dataSource: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
    },
    rowClassName: {
      type: Function,
      required: true,
    },
    customRow: {
      type: Function,
      required: true,
    },
  },
  emits: ["update:visible", "ok"],
  components: {
    XFileTypeIcon,
  },
  setup(props, { emit }) {
    const onOk = () => emit("ok");
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    return { updateVisible, onOk };
  },
});
</script>

<style scoped>
</style>