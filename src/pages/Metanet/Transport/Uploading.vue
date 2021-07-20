<template>
  <div>
    <input
      multiple
      class="hidden"
      type="file"
      id="singleInput"
      @change="onChangeMultipleUploadFile"
    />
    <!-- 功能区 -->
    <div class="mb-3 flex items-center">
      <!-- 上传总进度 -->
      <div class="mr-2 flex flex-1">
        <div class="mr-2 whitespace-nowrap text-gray-400">总进度</div>
        <div class="flex-1 relative">
          <!-- <div
            class="absolute z-50 left-0 right-0 text-center text-white"
            :style="{ 'padding-top': '1px' }"
          >
            {{ `${totalPercent}/%` }}
          </div> -->
          <a-progress :showInfo="true" :percent="totalPercent" />
        </div>
      </div>
      <div>
        <a-button class="mr-2" type="primary" @click="onTestUploadFile"
          >测试上传</a-button
        >
        <a-button class="mr-2" :disabled="disabledAllBeginBtn"
          >全部开始</a-button
        >
        <a-button class="mr-2" :disabled="disabledAllPauseBtn"
          >全部暂停</a-button
        >
        <a-button :disabled="disabledAllCancelBtn">全部取消</a-button>
      </div>
    </div>
    <!-- 表格区 -->
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
      <template #speed="{ record }">
        <div class="text-gray-400">
          {{ `${formatBytes(record.speed)} / s` }}
        </div>
      </template>
      <template #uploadProgressBar="{ record }">
        <a-progress :percent="record.progress" :showInfo="false"></a-progress>
      </template>
      <template #statusText="{ record }">
        <div class="text-gray-400">
          {{ calcStatusText(record) }}
        </div>
      </template>
      <template #startOrPause="{ record }">
        <a href="javascript:;" @click="onRecordStartOrPause(record)">
          <template v-if="['pause'].includes(record.status)">
            <a-tooltip title="开始">
              <RightSquareOutlined />
            </a-tooltip>
          </template>
          <template v-if="['queueing', 'uploading'].includes(record.status)">
            <a-tooltip title="暂停">
              <PauseOutlined />
            </a-tooltip>
          </template>
          <template v-if="['failed'].includes(record.status)">
            <a-tooltip title="重试">
              <ReloadOutlined />
            </a-tooltip>
          </template>
        </a>
      </template>
      <template #cancel="{ record }">
        <!-- 处于等待ws 确认状态的不可取消 -->
        <a
          href="javascript:;"
          v-if="!['waiting'].includes(record.status)"
          @click="onRecordCancel(record)"
        >
          <a-tooltip title="取消">
            <CloseOutlined />
          </a-tooltip>
        </a>
      </template>
    </TableFiles>
  </div>
</template>

<script lang="ts">
import { useTransportStore } from "@/store";
import { UploadItem, UploadStatus } from "@/store/transport";
import { computed, defineComponent, reactive, ref } from "vue";
import {
  RightSquareOutlined,
  PauseOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import TableFiles from "../components/TableFiles.vue";
import XFileTypeIcon from "@/components/XFileTypeIcon.vue";
import { formatBytes, getFileSHA256, getFileType } from "@/utils";

type TabKey = "uploading" | "uploadFinished" | "sendFile";

export default defineComponent({
  name: "Transport",
  components: {
    TableFiles,
    XFileTypeIcon,
    RightSquareOutlined,
    PauseOutlined,
    CloseOutlined,
    ReloadOutlined,
  },
  setup() {
    const { t } = useI18n();
    const transPortStore = useTransportStore();
    // 测试用 start
    const onTestUploadFile = () => {
      document.getElementById("singleInput")?.click();
    };
    const onChangeMultipleUploadFile = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (!input.files?.length) return;
      async function onUploadSingleFile(file: File) {
        const fileName = file.name;
        const fileHash = await getFileSHA256(file);
        const resultUploadSingle = await transPortStore.uploadFile({
          file,
          fileHash,
          fileType: getFileType({
            isDir: false,
            fileName,
          }),
          fullName: [fileName],
          description: "",
        });
        console.log("resultUploadSingle", resultUploadSingle);
      }
      [...input.files].forEach((i) => onUploadSingleFile(i));
      input.value = "";
    };
    // 测试用 end
    /** 表格数据 */
    function useTableData() {
      const tableLoading = ref(false);
      const columns = [
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
        },
        {
          title: "uploadProgressText",
          slots: { customRender: "uploadProgressText" },
          width: 100,
        },
        {
          title: "fileInfo",
          slots: { customRender: "fileInfo" },
          width: 100,
        },
        {
          title: "speed",
          slots: { customRender: "speed" },
          width: 100,
        },
        {
          title: "uploadProgressBar",
          slots: { customRender: "uploadProgressBar" },
          width: 140,
        },
        {
          title: "statusText",
          slots: { customRender: "statusText" },
          width: 100,
        },
        {
          title: "startOrPause",
          slots: { customRender: "startOrPause" },
          width: 50,
        },
        {
          title: "cancel",
          slots: { customRender: "cancel" },
          width: 50,
        },
        // {
        //   title: t("metanet.action"),
        //   fixed: "right",
        //   width: 60,
        //   slots: { customRender: "action" },
        // },
      ];
      const tableData = computed(() => {
        return transPortStore.uploadingList;
      });
      const totalPercent = computed(() => {
        const statusList = [
          "queueing",
          "uploading",
          "pause",
          "waiting",
          "failed",
        ];
        const list = tableData.value.filter((i) =>
          statusList.includes(i.status)
        );
        const val = Math.floor(
          (list.reduce((a, b) => (a += b.progress), 0) / (list.length * 100)) *
            100
        );
        // console.log(
        //   "val",
        //   list.reduce((a, b) => (a += b.progress), 0),
        //   val
        // );
        return val;
      });
      /** 禁用 全部开始 按钮 */
      const disabledAllBeginBtn = computed(() => {
        const onGoingList = [
          "queueing",
          "uploading",
          "pause",
          "waiting",
          "failed",
        ];
        return (
          tableData.value.length === 0 ||
          tableData.value.every((i) => onGoingList.includes(i.status))
        );
      });
      /** 禁用 全部暂停 按钮 */
      const disabledAllPauseBtn = computed(() => {
        return (
          tableData.value.length === 0 ||
          tableData.value.every((i) => ["pause", "waiting"].includes(i.status))
        );
      });
      /** 禁用 全部取消 按钮 */
      const disabledAllCancelBtn = computed(() => {
        // 已经处于等待ws 状态的不可取消
        return (
          tableData.value.length === 0 ||
          tableData.value.every((i) => ["waiting"].includes(i.status))
        );
      });
      const onRecordStartOrPause = (record: UploadItem) => {
        console.log("onRecordStartOrPause", record);
        const canResumeStatusKeys: UploadStatus[] = ["pause", "failed"];
        const canPauseStatusKeys: UploadStatus[] = [
          "queueing",
          "uploading",
          // "failed", // 失败的也可以重新开启?
        ];
        if (canResumeStatusKeys.includes(record.status)) {
          transPortStore.resumeItem(record.fileHash);
        } else if (canPauseStatusKeys.includes(record.status)) {
          transPortStore.pauseItem(record.fileHash);
        }
      };
      const onRecordCancel = (record: UploadItem) => {
        console.log("onRecordCancel", record);
        transPortStore.cancelItem(record.fileHash);
      };
      const calcStatusText = (record: UploadItem) => {
        const mapText: { [key in UploadStatus]?: string } = {
          queueing: "排队中",
          uploading: "上传中",
          pause: "暂停中",
          waiting: "等待ws确认",
          failed: "失败",
        };
        return mapText[record.status];
      };
      return {
        tableLoading,
        columns,
        tableData,
        totalPercent,
        formatBytes,
        disabledAllBeginBtn,
        disabledAllPauseBtn,
        disabledAllCancelBtn,
        onRecordStartOrPause,
        onRecordCancel,
        calcStatusText,
      };
    }
    return {
      onTestUploadFile,
      onChangeMultipleUploadFile,
      ...useTableData(),
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
  border-radius: 0 !important;
}
:deep(.ant-progress-inner) {
  border-radius: 0 !important;
}
</style>