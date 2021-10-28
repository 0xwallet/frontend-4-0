<template>
  <!-- 弹窗 我的文件夹 -->
  <a-modal
    destroyOnClose
    :title="title"
    :visible="visible"
    @update:visible="updateVisible"
    @ok="onOk"
    :footer="footer"
    :bodyStyle="{ padding: '18px 12px', border: '1px solid #f2f2f2' }"
    :confirmLoading="confirmLoading"
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
      :loading="tableLoading"
      @expandedChange="onExpandedChange"
    >
      <!-- <template #name="{ record }"> -->
      <template #name="{ record }">
        <div class="inline-block">
          <!-- 空白就是blank 文件夹就是folder -->
          <!-- <FolderFilled /> -->
          <!-- <FolderOpenFilled /> -->
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
import { FolderFilled, FolderOpenFilled } from "@ant-design/icons-vue";

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
    rowClassName: {
      type: Function,
      required: true,
    },
    customRow: {
      type: Function,
      required: true,
    },
    footer: {
      type: [String, Object],
      // 源码中 undefined 才会显示默认的按钮
      default: () => undefined,
    },
    tableLoading: {
      type: Boolean,
    },
    confirmLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "ok"],
  components: {
    XFileTypeIcon,
    FolderFilled,
    FolderOpenFilled,
  },
  setup(props, { emit }) {
    const onOk = () => emit("ok");
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    const onExpandedChange = () => {
      console.log("onExpandedChange", arguments);
    };
    return { updateVisible, onOk, onExpandedChange };
  },
});
</script>

<style scoped>
</style>