<template>
  <div>
    <!-- 功能区 -->
    <div class="mb-3 flex items-center">
      <!-- 按钮区 -->
      <div class="flex items-center" :style="{ height: '32px' }">
        <!-- <transition name="no-mode-fade">
            <a-button
              shape="round"
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
              shape="round"
              :disabled="selectedRows.length === 0"
              v-else
              key="pause"
              class="absolute"
              @click="onBatchPause"
            >
              <PauseOutlined />
              暂停</a-button
            >
          </transition> -->
        <a-tooltip v-if="isShowBatchStartBtn" title="开始选中的任务">
          <a
            href="javascript:;"
            class="inline-block px-1 mr-2"
            @click="onBatchStart()"
            :disabled="selectedRows.length === 0"
          >
            <RightCircleOutlined />
          </a>
        </a-tooltip>
        <a-tooltip v-else title="暂停选中的任务">
          <a
            href="javascript:;"
            class="inline-block px-1 mr-2"
            @click="onBatchPause()"
            :disabled="selectedRows.length === 0"
          >
            <PauseOutlined />
          </a>
        </a-tooltip>
        <!-- <a-button
          shape="round"
          :disabled="selectedRows.length === 0"
          @click="onBatchCancel"
        >
          <CloseCircleOutlined />
          取消</a-button
        > -->
        <a-tooltip title="取消选中的任务">
          <a
            href="javascript:;"
            class="inline-block px-1 mr-2"
            @click="onBatchCancel()"
            :disabled="selectedRows.length === 0"
          >
            <CloseCircleOutlined />
          </a>
        </a-tooltip>
      </div>
      <!-- 进度区 -->
      <div class="flex flex-1">
        <!-- <div class="mr-2 whitespace-nowrap text-gray-400">总进度</div> -->
        <!-- color: isTotalProgressBarTextWhite ? '#FFF ' : '#3C6889', -->
        <div class="flex-1 relative">
          <!-- 拖拽上传区域 -->
          <div
            class="absolute inset-0 z-50 rounded-full"
            :class="{
              dashedBorder: isFileOverUploadZone,
            }"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
          ></div>
          <div
            class="absolute z-40 left-0 right-0 text-center text-white"
            :style="{
              color: '#3C6889',
              height: '30px',
              'line-height': '30px',
            }"
          >
            <span id="totalProgressBarText">
              <!-- 总进度: {{ `${totalPercent}%` }} -->
              {{ showBarText }}
            </span>
          </div>
          <a-progress
            id="totalProgressBar"
            :showInfo="false"
            :percent="totalPercent"
          />
        </div>
      </div>
    </div>
    <!-- 表格区 -->
    <div class="relative">
      <XTableFiles
        rowKey="uniqueId"
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
        :locale="emptyLocale"
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
          <!-- 处于ws等待状态的时候 已发送大小显示手动改为文件的全大小, 因为progress实际上还没到100(为了等待故意暂停的) -->
          <div class="text-gray-400">
            {{
              record.status === "waiting"
                ? formatBytes(record.fileSize)
                : formatBytes(record.fileSize * (record.progress / 100))
            }}
            /
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
              <template v-if="isLoadingNknMulticlient">
                <span> 等待nkn节点中,请稍后手动开始 </span>
              </template>
              <template v-else-if="record.status === 'uploading'">
                <span class="ant-color-blue-6">
                  <!-- {{ calcStatusText(record.status) }} -->
                  {{ formatBytes(record.speed) }}/S
                </span>
                <span v-if="record.speed > 0">
                  - {{ calcTimeLeftText(record) }}</span
                >
              </template>
              <template v-else-if="record.status === 'queueing'">
                <span>排队中</span>
              </template>
              <template v-else-if="record.status === 'pause'">
                <span>任务暂停</span>
              </template>
              <template v-else-if="record.status === 'waiting'">
                <span>等待ws确认</span>
              </template>
              <template v-else-if="record.status === 'failed'">
                <span>任务失败</span>
              </template>
              <template v-else>
                <span> </span>
              </template>
            </div>
          </div>
        </template>
        <!-- <template #uploadStatus="{ record }">
        {{ calcStatusText(record.status) }}
      </template> -->
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
              <template
                v-if="['queueing', 'uploading'].includes(record.status)"
              >
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
      </XTableFiles>
    </div>
  </div>
</template>

<script lang="ts">
import { useTransportStore, useUserStore } from "@/store";
import {
  SUCCESS_STATUS_ARR,
  UploadItem,
  UploadStatus,
} from "@/store/transport";
import {
  computed,
  createVNode,
  defineComponent,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  RightSquareOutlined,
  PauseOutlined,
  CloseOutlined,
  ReloadOutlined,
  RightCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import { XFileTypeIcon, XTableFiles } from "../../components";
import { formatBytes, getFileSHA256, getFileType, useDelay } from "@/utils";
import { NKN_SUB_CLIENT_COUNT } from "@/constants";
import { throttle } from "lodash-es";
import { Empty, message } from "ant-design-vue";
import { apiQueryMeSpace } from "@/apollo/api";
import { useRouter } from "vue-router";

type TabKey = "uploading" | "uploadFinished" | "sendFile";

/**计算剩余时间 */
const calcTimeLeftTextFn = (record: UploadItem) => {
  let { fileSize, progress, speed } = record;
  // `剩余时间: 00:00:01` // speed /s
  const leftSize = fileSize * ((100 - progress) / 100);

  /** 不足两位数的,前面加个0 */
  const preZero = (v: number) => {
    if (v === Infinity) return "00";
    return v.toString().length > 1 ? `${v}` : `0${v}`;
  };
  let seconds, mins, hours;
  seconds = Math.floor(leftSize / speed);
  if (record.progress === 0 || seconds === 0 || speed === 0 || isNaN(seconds)) {
    return `剩余时间: 00:59:00`;
  }
  // 只有秒
  if (seconds < 60) {
    return `剩余时间: 00:00:${preZero(seconds)}`;
    // 有秒 分
  } else if ((mins = Math.floor(seconds / 60)) < 60) {
    return `剩余时间: 00:${preZero(mins)}:${preZero(seconds % 60)}`;
    // 有秒 分 时
  } else {
    hours = Math.floor(mins / 60);
    return `剩余时间: ${preZero(hours)}:${preZero(mins % 60)}:${preZero(
      seconds % 60
    )}`;
  }
};
const calcTimeLeftText = throttle(calcTimeLeftTextFn, 1000);

export default defineComponent({
  name: "TransportUpLoading",
  components: {
    XTableFiles,
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
    const router = useRouter();
    const transportStore = useTransportStore();
    // 测试用插入假数据 start
    // transportStore.uploadHashMap["22"] = {
    //   uniqueId: "2",
    //   action: "drive",
    //   roundId: 1,
    //   file: new File([], "t.txt"),
    //   fileHash: "22",
    //   fullName: ["fake.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 50,
    //   status: "uploading",
    //   description: "sdfs",
    //   speed: 1000,
    // };
    // transportStore.uploadHashMap["23"] = {
    //   fileHash: "23",
    //   fullName: ["fake.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 0,
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
      return transportStore.uploadingList;
    });
    /** 拖拽 */
    function useDropUpload() {
      /** 是否鼠标拖动文件到区域上方,是就显示边框 */
      const isFileOverUploadZone = ref(false);
      const onDragEnter = (event: DragEvent) => {
        event.preventDefault();
        isFileOverUploadZone.value = true;
      };
      const onDragLeave = (event: DragEvent) => {
        event.preventDefault();
        isFileOverUploadZone.value = false;
      };
      const onDragOver = (event: DragEvent) => {
        event.preventDefault();
      };
      const onDrop = async (event: DragEvent) => {
        event.preventDefault();
        isFileOverUploadZone.value = false;
        const files = event.dataTransfer?.files;
        if (!files) return;
        const hide = message.loading("查询中...", 0);
        // console.log(files);
        const resultQuerySpace = await apiQueryMeSpace();
        hide();
        if (resultQuerySpace.err) {
          return;
        }
        const { availableSpace } = resultQuerySpace.data.me.driveSetting;
        // 如果即将要传的文件总大小超出可用, 退出
        const toUploadFiles = [...files];
        if (
          toUploadFiles.reduce((a, b) => (a += b.size), 0) > +availableSpace
        ) {
          message.warning("超出最大可用容量!");
          return;
        }
        try {
          // 如果当前没有任务正在上传, 增加回合id
          if (!transportStore.uploadingList.length) {
            transportStore.plusCurRoundId();
          }
          Promise.all(
            toUploadFiles.map((i) =>
              onUploadSingleFile(i, transportStore.uploadCurRoundId)
            )
          );
          // console.log("resOfAll", resOfAll);
        } catch (error) {
          console.log("上传文件错误", error);
        }
      };
      /** 上传单个文件 */
      const onUploadSingleFile = async (file: File, roundId: number) => {
        const fileName = file.name;
        const fileHash = await getFileSHA256(file);
        await transportStore.uploadFile({
          file,
          fileHash,
          roundId,
          fileType: getFileType({
            isDir: false,
            fileName,
          }),
          fullName: [fileName],
          description: "",
          action: "drive",
        });
        // console.log("resultUploadSingle", resultUploadSingle);
      };
      return {
        isFileOverUploadZone,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
      };
    }
    /** 表格数据 */
    function useTableData() {
      const emptyLocale = {
        emptyText: createVNode("div", {}, [
          createVNode(Empty, {
            image: Empty.PRESENTED_IMAGE_SIMPLE,
            // description: "拖拽文件至此可直接上传到根目录",
            description: "暂无任务",
          }),
        ]),
      };
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
          width: 250,
        },
        // {
        //   title: "临时测试用-上传状态",
        //   slots: { customRender: "uploadStatus" },
        // },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 100,
          slots: { customRender: "action" },
        },
      ];

      const totalPercent = computed(() => {
        // const statusList = [
        //   "queueing",
        //   "uploading",
        //   "pause",
        //   "waiting",
        //   "failed",
        // ];
        // 当前回合的list
        const list = transportStore.uploadList.filter(
          (i) =>
            // statusList.includes(i.status)
            i.roundId === transportStore.uploadCurRoundId
        );
        // console.log("totalPercent-filterListLen", list.length);
        if (
          !list.length ||
          list.every((i) => SUCCESS_STATUS_ARR.includes(i.status))
        )
          return 0;
        const val = Math.floor(
          (list.reduce((a, b) => (a += b.progress), 0) / (list.length * 100)) *
            100
        );
        return val;
      });
      const isTotalProgressBarTextWhite = ref(false);
      let totalProgressBarWidth = 0;
      onMounted(() => {
        totalProgressBarWidth =
          document.getElementById("totalProgressBar")?.getBoundingClientRect()
            .width ?? 0;
      });
      /** 缓存breakpoint 结果,因为渲染后就是固定的, 不用重新计算 */
      const cacheGetBreakPointWidth = () => {
        let cache = 0;
        return () => {
          if (cache !== 0) return cache;
          const el = document.getElementById("totalProgressBarText");
          cache = !el ? 0 : el.offsetLeft + el.getBoundingClientRect().width;
          return cache;
        };
      };
      const getBreakPointWidth = cacheGetBreakPointWidth();
      watch(
        () => totalPercent.value,
        (newVal) => {
          const currentPercentWidth = totalProgressBarWidth * (newVal / 100);
          isTotalProgressBarTextWhite.value =
            currentPercentWidth > getBreakPointWidth();
        }
      );
      const canResumeStatusKeys: UploadStatus[] = ["pause", "failed"];
      const canPauseStatusKeys: UploadStatus[] = [
        "queueing",
        "uploading",
        // "failed", // 失败的也可以重新开启?
      ];
      const onRecordStartOrPause = (record: UploadItem) => {
        console.log("onRecordStartOrPause", record);
        if (canResumeStatusKeys.includes(record.status)) {
          transportStore.resumeItem(record.uniqueId);
        } else if (canPauseStatusKeys.includes(record.status)) {
          transportStore.pauseItem(record.uniqueId);
        }
      };
      const onRecordCancel = (record: UploadItem) => {
        console.log("onRecordCancel", record);
        transportStore.cancelItem(record.uniqueId);
      };
      const onBatchStart = () => {
        // console.log("onBatchStart");
        transportStore.uploadingList
          .filter((i) => canResumeStatusKeys.includes(i.status))
          .forEach((i) => transportStore.resumeItem(i.uniqueId));
      };
      const onBatchPause = () => {
        // console.log("onBatchPause");
        transportStore.uploadingList
          .filter((i) => canPauseStatusKeys.includes(i.status))
          .forEach((i) => transportStore.pauseItem(i.uniqueId));
      };
      const onBatchCancel = () => {
        // console.log("onBatchCancel");
        transportStore.uploadingList
          .filter((i) => i.status !== "waiting")
          .forEach((i) => transportStore.cancelItem(i.uniqueId));
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
      const showBarText = ref(`总进度: ${totalPercent.value}%`);
      let startCount = 0;
      let counterBarText: number;
      onActivated(() => {
        console.log("onActivated");
        if (counterBarText) {
          clearInterval(counterBarText);
        }
        counterBarText = window.setInterval(() => {
          startCount++;
          if (startCount % 5 === 0) {
            showBarText.value = "拖拽文件至此可直接上传到根目录";
          } else {
            showBarText.value = `总进度: ${totalPercent.value}%`;
          }
        }, 1000);
      });
      onDeactivated(() => {
        console.log("onDeactivated");
        if (counterBarText) {
          clearInterval(counterBarText);
          startCount = 0;
        }
      });
      return {
        emptyLocale,
        tableLoading,
        columns,
        tableData,
        totalPercent,
        showBarText,
        formatBytes,
        calcTimeLeftText,
        isTotalProgressBarTextWhite,
        onRecordStartOrPause,
        onRecordCancel,
        onBatchStart,
        onBatchPause,
        onBatchCancel,
        calcStatusText,
      };
    }

    function useNknStatus() {
      const isLoadingNknMulticlient = computed(() => {
        return userStore.isLoadingMultiClient;
      });
      return {
        isLoadingNknMulticlient,
      };
    }
    return {
      // onTestUploadFile,
      // onChangeMultipleUploadFile,
      ...useToolSet(),
      selectedRows,
      selectedRowKeys,
      ...useDropUpload(),
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
  height: 30px !important;
  // border-radius: 0 !important;
}
:deep(.trProgressBox .ant-progress-bg) {
  height: 6px !important;
}
// :deep(.ant-progress-inner) {
// border-radius: 0 !important;
// }
.dashedBorder {
  border: 2px dashed #1890ff;
}
</style>