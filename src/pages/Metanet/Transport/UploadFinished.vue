<template>
  <div>
    <!-- 功能区 -->
    <div class="mb-3 flex items-center justify-between">
      <div>
        共传输完成
        <span class="ant-color-blue-6">{{ uploadSuccessList.length }}</span>
        个文件!
      </div>
      <a-button @click="onBatchClear"> 清除所有记录 </a-button>
    </div>
    <TableFiles
      rowKey="fileHash"
      :disableSelect="true"
      :showHeader="false"
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
    >
      <template #name="{ record }">
        <!-- <div>55----{{ record }}</div> -->
        <div :title="$lastOfArray(record.fullName)">
          <XFileTypeIcon class="w-6 h-6 mr-2" :type="record.fileType" />
          <span>{{ $lastOfArray(record.fullName) }}</span>
        </div>
      </template>
      <template #fileInfo="{ record }">
        <div>
          {{ formatBytes(record.fileSize) }}
        </div>
      </template>
      <template #openDir="{ record }">
        <a href="javascript:;" @click="onRecordOpenDir(record)">
          <a-tooltip title="打开所在文件夹">
            <FolderOutlined />
          </a-tooltip>
        </a>
      </template>
      <template #clear="{ record }">
        <a href="javascript:;" @click="onRecordClear(record)">
          <a-tooltip title="清除记录">
            <ClearOutlined />
          </a-tooltip>
        </a>
      </template>
    </TableFiles>
  </div>
</template>

<script lang="ts">
import { useTransportStore } from "@/store";
import { computed, defineComponent, ref } from "vue";
import { FolderOutlined, ClearOutlined } from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import TableFiles from "../components/TableFiles.vue";
import XFileTypeIcon from "@/components/XFileTypeIcon.vue";
import { formatBytes } from "@/utils";
import { UploadItem } from "@/store/transport";
export default defineComponent({
  components: {
    TableFiles,
    XFileTypeIcon,
    // ant icons
    FolderOutlined,
    ClearOutlined,
  },
  setup() {
    const { t } = useI18n();
    const transPortStore = useTransportStore();
    const uploadSuccessList = computed(() => {
      return transPortStore.uploadSuccessList;
    });
    const tableLoading = ref(false);
    const columns = [
      {
        title: t("metanet.name"),
        slots: { customRender: "name" },
      },
      {
        title: "fileInfo",
        slots: { customRender: "fileInfo" },
        width: 100,
      },
      {
        title: "openDir",
        slots: { customRender: "openDir" },
        width: 50,
      },
      {
        title: "clear",
        slots: { customRender: "clear" },
        width: 50,
      },
    ];
    const tableData = computed(() => {
      return transPortStore.uploadSuccessList;
    });
    /** 打开到所在文件夹 */
    const onRecordOpenDir = (record: UploadItem) => {
      console.log("onRecordOpenDir", record);
    };
    /** 清除单项成功记录 */
    const onRecordClear = (record: UploadItem) => {
      console.log("onRecordClear", record);
      transPortStore.clearItem(record.fileHash);
    };
    /** 清除所有成功的记录 */
    const onBatchClear = () => {
      transPortStore.uploadSuccessList.forEach(({ fileHash }) => {
        transPortStore.clearItem(fileHash);
      });
    };
    return {
      uploadSuccessList,
      tableLoading,
      columns,
      tableData,
      formatBytes,
      onRecordOpenDir,
      onRecordClear,
      onBatchClear,
    };
  },
});
</script>

<style scoped>
</style>