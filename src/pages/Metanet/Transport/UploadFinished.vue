<template>
  <div>
    <!-- 功能区 -->
    <div class="mb-3 flex items-center justify-between">
      <div>
        共传输完成
        <span class="ant-color-blue-6">{{ uploadSuccessList.length }}</span>
        个文件!
      </div>
      <a-button
        :disabled="uploadSuccessList.length === 0"
        size="small"
        @click="onBatchClear"
      >
        清除所有记录
      </a-button>
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
        <div class="text-gray-400">
          {{ formatBytes(record.fileSize) }}
        </div>
      </template>
      <template #fileDir="{ record }">
        <div class="text-gray-400" title="路径全名">
          {{ fullNameToFileDir(record) }}
        </div>
      </template>
      <template #successIcon="{ record }">
        <!-- success_upload -->
        <div
          v-if="record.isSecondUpload"
          class="flex items-center justify-center"
        >
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_rocket.png" alt="" />
          </div>
          <div>急速秒传</div>
        </div>
        <div v-else class="flex items-center justify-center">
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_upload.png" alt="" />
          </div>
          <div>上传成功</div>
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
import { formatBytes, lastOfArray } from "@/utils";
import { UploadItem } from "@/store/transport";
import { useRouter } from "vue-router";
import { apiQueryFileByDir } from "@/apollo/api";
import { THistoryDirItem } from "../File.vue";
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
    const router = useRouter();
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
        title: "fileDir",
        slots: { customRender: "fileDir" },
        width: 300,
      },
      {
        title: "successIcon",
        slots: { customRender: "successIcon" },
        width: 150,
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
    /** 根据目录数组返回包含id 的对象 */
    async function getLastItemIdByNameArr(nameArr: string[]) {
      const resultOfAll = await Promise.all(
        nameArr.map(async (item, idx) => {
          const resItem = await apiQueryFileByDir(
            // 查询上级目录
            idx === 0
              ? {
                  dirId: "root",
                }
              : {
                  fullName: nameArr.slice(0, idx),
                }
          );
          const foundItem = resItem.data?.driveListFiles.find(
            (i) => i && lastOfArray(i.fullName) === item
          );
          if (!foundItem) throw Error(`${item}-找不到对应目录`);
          return {
            id: foundItem.id,
            name: item,
            isShared: foundItem.isShared,
          };
        })
      );
      return resultOfAll;
    }
    /** 打开到所在文件夹 */
    const onRecordOpenDir = async (record: UploadItem) => {
      console.log("onRecordOpenDir", record);
      const fullName = record.fullName;
      let folderArr: THistoryDirItem[];
      if (fullName.length === 1) folderArr = [];
      else {
        folderArr = await getLastItemIdByNameArr(fullName.slice(0, -1));
      }
      // console.log("folderArr", folderArr);
      router.push({
        name: "MetanetFile",
        params: {
          folderArrStr: JSON.stringify(folderArr),
        },
      });
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
    /** 转换fullName 为路径全名 */
    const fullNameToFileDir = (record: UploadItem) => {
      return `~/${record.fullName.join("/")}`;
    };
    return {
      uploadSuccessList,
      tableLoading,
      columns,
      tableData,
      formatBytes,
      fullNameToFileDir,
      onRecordOpenDir,
      onRecordClear,
      onBatchClear,
    };
  },
});
</script>

<style scoped>
</style>