<template>
  <div>
    <!-- 功能区 -->
    <div class="mb-3 flex items-center">
      <!-- 按钮区 -->
      <div class="mr-2 flex items-center" :style="{ height: '32px' }">
        <div
          :style="{
            width: '82px',
          }"
          class="h-full relative inline-block mr-2"
        >
          <transition name="no-mode-fade">
            <a-button
              :disabled="selectedRows.length === 0"
              v-if="isShowBatchStartBtn"
              key="start"
              class="absolute"
              @click="onBatchStart"
            >
              <RightCircleOutlined />
              开始</a-button
            >
            <a-button
              :disabled="selectedRows.length === 0"
              v-else
              key="pause"
              class="absolute"
              @click="onBatchPause"
            >
              <PauseOutlined />
              暂停</a-button
            >
          </transition>
        </div>
        <a-button :disabled="selectedRows.length === 0" @click="onBatchCancel">
          <CloseCircleOutlined />
          取消</a-button
        >
      </div>
      <!-- 进度区 -->
      <div class="mr-2 flex flex-1 px-1">
        <div class="mr-2 whitespace-nowrap text-gray-400">总进度</div>
        <div class="flex-1 relative">
          <!-- <div
            class="absolute z-50 left-0 right-0 text-center text-white"
            :style="{ 'padding-top': '1px' }"
          >
            {{ `${totalPercent}/%` }}
          </div> -->
          <a-progress :showInfo="false" :percent="totalPercent" />
        </div>
      </div>
      <!-- 状态区 -->
      <div>
        <!-- nkn节点状态 -->
        <a-tooltip :title="`nkn节点: ${nknClientConnectStatusMap.count}/4`">
          <a
            href="javascript:;"
            class="inline-block mr-2"
            @click="onResetNknMultiClient"
          >
            <img
              :src="
                require(`@/assets/images/wifi_${nknClientConnectStatusMap.count}.png`)
              "
              :style="{
                width: '14px',
                height: '14px',
              }"
            />
          </a>
        </a-tooltip>
      </div>
    </div>
    <!-- 表格区 -->
    <TableFiles
      rowKey="fileHash"
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      v-model:selectedRows="selectedRows"
      v-model:selectedRowKeys="selectedRowKeys"
    >
      <template #name="{ record }">
        <!-- <div>55----{{ record }}</div> -->
        <div :title="$lastOfArray(record.fullName)">
          <XFileTypeIcon class="w-6 h-6 mr-2" :type="record.fileType" />
          <span>{{ $lastOfArray(record.fullName) }}</span>
        </div>
      </template>
      <template #fileSize="{ record }">
        <div class="text-gray-400">
          {{ formatBytes(record.fileSize * (record.progress / 100)) }} /
          {{ formatBytes(record.fileSize) }}
        </div>
      </template>
      <template #status="{ record }">
        <div class="text-gray-400 trProgressBox">
          <a-progress
            :style="{
              height: '10px',
              'margin-top': '-2px',
              'margin-down': '-2px',
            }"
            :percent="record.progress"
            :showInfo="false"
          ></a-progress>
          <div
            :style="{
              'margin-top': '-4px',
            }"
          >
            {{ calcStatusText(record.status) }}
            <template v-if="record.status === 'uploading'">
              -
              {{ formatBytes(record.speed) }} / s
            </template>
          </div>
        </div>
      </template>
      <template #action="{ record }">
        <div class="flex items-center text-gray-600">
          <a
            class="flex-1"
            href="javascript:;"
            @click="onRecordStartOrPause(record)"
          >
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
          <a
            class="flex-1"
            href="javascript:;"
            v-if="!['waiting'].includes(record.status)"
            @click="onRecordCancel(record)"
          >
            <a-tooltip title="取消">
              <CloseOutlined />
            </a-tooltip>
          </a>
        </div>
      </template>
    </TableFiles>
  </div>
</template>

<script lang="ts">
import { useTransportStore, useUserStore } from "@/store";
import { UploadItem, UploadStatus } from "@/store/transport";
import { computed, defineComponent, onUnmounted, reactive, ref } from "vue";
import {
  RightSquareOutlined,
  PauseOutlined,
  CloseOutlined,
  ReloadOutlined,
  RightCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import TableFiles from "../components/TableFiles.vue";
import XFileTypeIcon from "@/components/XFileTypeIcon.vue";
import { formatBytes, getFileSHA256, getFileType } from "@/utils";
import { NKN_SUB_CLIENT_COUNT } from "@/constants";

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
    RightCircleOutlined,
    CloseCircleOutlined,
  },
  setup() {
    const { t } = useI18n();
    const transPortStore = useTransportStore();
    // 测试用插入假数据 start
    // transPortStore.uploadHashMap["22"] = {
    //   fileHash: "22",
    //   fullName: ["fake.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 20,
    //   status: "uploading",
    //   description: "sdfs",
    //   speed: 500,
    // };
    // transPortStore.uploadHashMap["23"] = {
    //   fileHash: "23",
    //   fullName: ["fake.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 80,
    //   status: "uploading",
    //   description: "sdfs",
    //   speed: 1028,
    // };
    // 测试用插入假数据 end
    const userStore = useUserStore();
    const selectedRows = ref<UploadItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const isShowBatchStartBtn = computed(() => {
      const list = selectedRows.value;
      if (list.length === 0) return true;
      // list 里可以暂停的数量
      const canStartCount = list.filter((i) =>
        ["pause"].includes(i.status)
      ).length;
      // list 里可以开始的数量
      const canPauseCount = list.filter((i) =>
        ["queueing", "uploading"].includes(i.status)
      ).length;
      return canStartCount > canPauseCount;
    });
    /** 功能区 */
    function useToolSet() {
      return {
        isShowBatchStartBtn,
      };
    }
    // 测试用 end
    const tableData = computed(() => {
      return transPortStore.uploadingList;
    });

    /** 表格数据 */
    function useTableData() {
      const tableLoading = ref(false);
      const columns = [
        {
          title: "文件名",
          slots: { customRender: "name" },
        },
        {
          title: "大小",
          slots: { customRender: "fileSize" },
          width: 180,
        },
        {
          title: "状态",
          slots: { customRender: "status" },
          width: 200,
        },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 100,
          slots: { customRender: "action" },
        },
      ];

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
      const canResumeStatusKeys: UploadStatus[] = ["pause", "failed"];
      const canPauseStatusKeys: UploadStatus[] = [
        "queueing",
        "uploading",
        // "failed", // 失败的也可以重新开启?
      ];
      const onRecordStartOrPause = (record: UploadItem) => {
        console.log("onRecordStartOrPause", record);
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
      const onBatchStart = () => {
        // console.log("onBatchStart");
        transPortStore.uploadingList
          .filter((i) => canResumeStatusKeys.includes(i.status))
          .forEach((i) => transPortStore.resumeItem(i.fileHash));
      };
      const onBatchPause = () => {
        // console.log("onBatchPause");
        transPortStore.uploadingList
          .filter((i) => canPauseStatusKeys.includes(i.status))
          .forEach((i) => transPortStore.pauseItem(i.fileHash));
      };
      const onBatchCancel = () => {
        // console.log("onBatchCancel");
        transPortStore.uploadingList
          .filter((i) => i.status !== "waiting")
          .forEach((i) => transPortStore.cancelItem(i.fileHash));
      };
      const calcStatusText = (status: UploadStatus) => {
        const mapText: { [key in UploadStatus]?: string } = {
          queueing: "排队中",
          uploading: "上传中",
          pause: "暂停",
          waiting: "等待ws确认",
          failed: "失败",
        };
        return mapText[status];
      };
      return {
        tableLoading,
        columns,
        tableData,
        totalPercent,
        formatBytes,
        onRecordStartOrPause,
        onRecordCancel,
        onBatchStart,
        onBatchPause,
        onBatchCancel,
        calcStatusText,
      };
    }
    /** nkn client 连接状态 */
    function useNknStatus() {
      // 连接中 3/4
      const nknClientConnectStatusMap = reactive({
        count: 0,
        text: "连接中",
      });
      // let readyClientCount = useUserStore().multiClient?.clients ?? 0
      const getStoreNknClientCount = () => {
        const multiClient = userStore.multiClient;
        if (!multiClient) return 0;
        else {
          // console.log(multiClient.readyClientIDs());
          return multiClient.readyClientIDs().length;
        }
      };
      nknClientConnectStatusMap.count = getStoreNknClientCount();
      let counterOfNknCLient = 0; // 用来猜测计时ws 连接fail 的时间
      let timer: number;
      /** 全局不断检测nkn节点状态 */
      const intervalGetClientCount = () => {
        timer = window.setTimeout(() => {
          counterOfNknCLient++;
          nknClientConnectStatusMap.count = getStoreNknClientCount();
          intervalGetClientCount();
          if (nknClientConnectStatusMap.count === NKN_SUB_CLIENT_COUNT) {
            nknClientConnectStatusMap.text = "就绪";
          } else if (counterOfNknCLient > 30) {
            // 30秒后
            if (nknClientConnectStatusMap.count === 0) {
              // 一个都没成功就自动重置
              counterOfNknCLient = 0; // 重新计数 , 下一轮才reset
              userStore.resetMultiClient();
              nknClientConnectStatusMap.text = "重连中";
            } else {
              // 未能全部成功的话
              nknClientConnectStatusMap.text = "半连接"; // 半准备?
            }
          }
        }, 1000);
      };
      // 防止内存泄漏
      onUnmounted(() => {
        clearInterval(timer);
      });
      intervalGetClientCount();
      /** 重置nkn client */
      const onResetNknMultiClient = () => {
        // 如果节点小于等于2个, 直接重置
        if (nknClientConnectStatusMap.count <= 2) {
          counterOfNknCLient = 0;
          useUserStore().resetMultiClient();
        } else {
          console.log("节点大于2,不进行重置");
        }
      };
      return { nknClientConnectStatusMap, onResetNknMultiClient };
    }
    return {
      // onTestUploadFile,
      // onChangeMultipleUploadFile,
      ...useToolSet(),
      selectedRows,
      selectedRowKeys,
      ...useTableData(),
      ...useNknStatus(),
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
  // border-radius: 0 !important;
}
:deep(.trProgressBox .ant-progress-bg) {
  height: 6px !important;
}
// :deep(.ant-progress-inner) {
//   border-radius: 0 !important;
// }
</style>