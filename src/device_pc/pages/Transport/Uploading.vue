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
          <XLink
            class="inline-block px-1 mr-2"
            @click="onBatchStart()"
            :disabled="selectedRows.length === 0"
          >
            <RightCircleOutlined />
          </XLink>
        </a-tooltip>
        <a-tooltip v-else title="暂停选中的任务">
          <XLink
            class="inline-block px-1 mr-2"
            @click="onBatchPause()"
            :disabled="selectedRows.length === 0"
          >
            <PauseOutlined />
          </XLink>
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
          <XLink
            class="inline-block px-1 mr-2"
            @click="onBatchCancel()"
            :disabled="selectedRows.length === 0"
          >
            <CloseCircleOutlined />
          </XLink>
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
            :style="{
              left: '30px',
            }"
            :class="{
              dashedBorder: isFileOverUploadZone,
            }"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
          ></div>
          <div
            class="absolute cursor-pointer px-1"
            :style="{
              'z-index': 999,
              left: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
            }"
            @click="onDefaultPathModalPreAction"
          >
            <a-tooltip title="选择拖拽上传默认路径">
              <PlusSquareOutlined class="mr-2" />
              <!-- 上传进度>0 的时候隐藏路径 -->
              <template v-if="totalPercent === 0">
                {{ selectedDefaultPathShowName }}
              </template>
            </a-tooltip>
          </div>
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
              <!-- 指示灯 -->
              <a-tooltip>
                <template #title>
                  <div
                    class="flex items-center tdHash"
                    v-if="calcRecordStatusTooltip(record).length > 5"
                  >
                    NFR 地址 :
                    <div class="pl-1">
                      {{
                        calcRecordStatusTooltip(record)
                          .replace(/file-jpgkdpid\./g, "")
                          .slice(0, 5)
                      }}
                    </div>
                    <div class="flex items-center">
                      <i
                        v-for="color in ['#2170FF', '#FF0078', '#FF9F00']"
                        :key="color"
                        class="
                          tdHashDot
                          relative
                          align-middle
                          ml-0.5
                          inline-block
                        "
                        :style="{
                          'background-color': color,
                          'font-size': 0,
                        }"
                      ></i>
                    </div>
                    <div class="ml-0.5">
                      {{ calcRecordStatusTooltip(record).slice(-5) }}
                    </div>
                  </div>
                  <template v-else>
                    {{ calcRecordStatusTooltip(record) }}
                  </template>
                </template>
                <span
                  class="
                    inline-block
                    w-1.5
                    h-1.5
                    rounded-full
                    mr-1
                    align-middle
                  "
                  :style="{
                    'background-color': calcRecordStatusColor(record),
                  }"
                ></span>
              </a-tooltip>
              <template v-if="isLoadingNknMulticlient">
                <span> 等待 NKN节点中,请稍后手动开始 </span>
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
    <XModalDir
      rowKey="dirId"
      v-model:visible="isShowDefaultPathModal"
      title="选择拖拽上传默认路径"
      :footer="null"
      @ok="onDefaultPathModalConfirm"
      :rowClassName="defaultPathModalTableRowClassName"
      :columns="defaultPathModalTableColumns"
      :dataSource="defaultPathModalTableData"
      :customRow="defaultPathModalTableCustomRow"
      :tableLoading="defaultPathModalTableLoading"
    />
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
  PlusSquareOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import { XFileTypeIcon, XTableFiles, XModalDir, XLink } from "../../components";
import {
  formatBytes,
  getFileSHA256,
  getFileType,
  lastOfArray,
  useDelay,
} from "@/utils";
import { throttle } from "lodash-es";
import { Empty, message } from "ant-design-vue";
import {
  apiLoopQueryFileByDir,
  apiQueryMeSpace,
  TFileItem,
} from "@/apollo/api";
import { useRouter } from "vue-router";
import { TDir } from "../Metanet/components/FileItem.vue";

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
    XModalDir,
    XFileTypeIcon,
    XLink,
    RightSquareOutlined,
    PauseOutlined,
    CloseOutlined,
    ReloadOutlined,
    RightCircleOutlined,
    CloseCircleOutlined,
    PlusSquareOutlined,
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
    //   nfrAddr: "333333333dddd3333333333333dddd",
    // };
    // transportStore.uploadHashMap["23"] = {
    //   uniqueId: "22",
    //   action: "drive",
    //   roundId: 1,
    //   file: new File([], "t.txt"),
    //   fileHash: "22",
    //   fullName: ["fak222e.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 50,
    //   status: "uploading",
    //   description: "sdfs",
    //   speed: 0,
    //   nfrAddr: "333333333dddd3333333333333dddd",
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
      const isShowDefaultPathModal = ref(false);
      const defaultPathModalTableColumns = [
        {
          title: "Name",
          // dataIndex: "name",
          slots: { customRender: "name" },
          key: "name",
        },
      ];
      const defaultPathModalTableLoading = ref(false);
      const defaultPathModalTableData = reactive<TDir[]>([]);
      /** 选中要复制/移动的目标文件夹 默认选中'全部文件' */
      // const defaultPathModalCurrentSelectedDir = ref("root");
      const defaultPathModalCurrentSelectedDir = ref<TDir>({
        dirId: "root",
        dirName: "全部文件",
        parent: null,
        isExpend: true,
      });
      const selectedDefaultPathShowName = computed(() => {
        const e = defaultPathModalCurrentSelectedDir.value;
        if (e.dirId === "root") {
          return "~/";
        } else {
          const arr = [e.dirName];
          let parent = e.parent;
          while (parent) {
            arr.unshift(parent.dirName === "root" ? "~" : parent.dirName);
            parent = parent.parent;
          }
          return arr.join("/");
        }
      });
      const getSetDefaultPathModalTableData = () => {
        defaultPathModalTableLoading.value = true;
        // 2021-07-05 先递归处理所有的目录, 后续要按需加载
        apiLoopQueryFileByDir({
          fileType: "DIR",
          dirId: "root",
          startPage: 1,
        }).then(async (resultQueryFile) => {
          if (resultQueryFile.err) {
            // console.log("err", err);
            defaultPathModalTableLoading.value = false;
            return;
          }
          /** 根据目录id, 父目录id 去递归获取children */
          const getAndSetDirChildren = async (item: TDir) => {
            const parentId = item.parent?.dirId;
            // const [resItem, errItem] = await apiLoopQueryFileByDir({
            const resultQueryFileItem = await apiLoopQueryFileByDir({
              fileType: "DIR",
              dirId: item.dirId,
              startPage: 1,
            });
            // console.log("目录res", item.dirId, item.dirName, resItem);
            if (resultQueryFileItem.err) return item;
            // 排除 非目录文件/ 根目录/ 自身/ 父目录(上一级)
            const afterFilterList =
              resultQueryFileItem.data.driveListFiles.filter(
                (i): i is TFileItem =>
                  i !== null &&
                  i.isDir &&
                  !["root", item.dirId, parentId].includes(i.id)
              );
            // console.log("afterFilterList", afterFilterList);
            if (!afterFilterList.length) return item;
            item.children = await Promise.all(
              afterFilterList.map((i) =>
                getAndSetDirChildren({
                  dirId: i.id,
                  dirName: lastOfArray(i.fullName),
                  parent: item,
                  isExpend: false,
                })
              )
            );
            return item;
          };
          // res.data.driveListFiles 提取文件夹的出来
          const resIsDirList = resultQueryFile.data.driveListFiles.filter(
            (i): i is TFileItem => i !== null && i.isDir && i.id !== "root"
          );
          const withChildrensDirList = await Promise.all(
            resIsDirList.map((i) =>
              getAndSetDirChildren({
                dirId: i.id,
                dirName: lastOfArray(i.fullName),
                isExpend: false,
                parent: {
                  dirId: "root",
                  dirName: "root",
                  parent: null,
                  isExpend: true,
                },
              })
            )
          );
          const rootDir: TDir = {
            dirId: "root",
            dirName: t("metanet.allFiles"),
            isExpend: true,
            parent: null,
            children: withChildrensDirList,
          };
          defaultPathModalTableData.push(rootDir);
          // console.log(
          //   "获取api后的defaultPathModalTableData",
          //   defaultPathModalTableData
          // );
          defaultPathModalTableLoading.value = false;
        });
      };
      /** 设置自定义行onClick 事件 */
      const defaultPathModalTableCustomRow = (record: TDir, index: number) => ({
        onClick: (e: {
          currentTarget: {
            dataset: {
              rowKey: string;
            };
          };
        }) => {
          console.log("defaultPathModalTableCustomRow", record);
          // console.log(e.currentTarget.dataset.rowKey);
          defaultPathModalCurrentSelectedDir.value = record;
        },
      });
      const defaultPathModalTableRowClassName = (
        record: TDir,
        index: number
      ) => {
        return record.dirId === defaultPathModalCurrentSelectedDir.value.dirId
          ? "copyMoveModalRow copyMoveModalRowActive"
          : "copyMoveModalRow";
      };
      /** 设置默认选中 */
      const onDefaultPathModalPreAction = () => {
        isShowDefaultPathModal.value = true;
        // 每次打开弹窗都获取最新的文件夹数据
        defaultPathModalTableData.length = 0;
        getSetDefaultPathModalTableData();
      };

      const onDefaultPathModalConfirm = () => {
        console.log("confirm选择默认路径");
      };
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
        // 用当前选中的默认拖拽上传路径去生成个 name数组
        const e = defaultPathModalCurrentSelectedDir.value;
        const preNameArr = [e.dirName];
        let parent = e.parent;
        while (parent) {
          preNameArr.unshift(parent.dirName);
          parent = parent.parent;
        }
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
          // slice 掉root 不需要传
          fullName: [...preNameArr.slice(1), fileName],
          description: "",
          action: "drive",
        });
        // console.log("resultUploadSingle", resultUploadSingle);
      };
      return {
        isFileOverUploadZone,
        isShowDefaultPathModal,
        defaultPathModalTableColumns,
        defaultPathModalTableLoading,
        defaultPathModalTableData,
        defaultPathModalCurrentSelectedDir,
        selectedDefaultPathShowName,
        defaultPathModalTableCustomRow,
        defaultPathModalTableRowClassName,
        onDefaultPathModalPreAction,
        onDefaultPathModalConfirm,
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
        if (selectedRows.value.length === 0) {
          message.warning("请选择数据");
          return;
        }
        // console.log("onBatchStart");
        transportStore.uploadingList
          .filter((i) => canResumeStatusKeys.includes(i.status))
          .forEach((i) => transportStore.resumeItem(i.uniqueId));
      };
      const onBatchPause = () => {
        if (selectedRows.value.length === 0) {
          message.warning("请选择数据");
          return;
        }
        // console.log("onBatchPause");
        transportStore.uploadingList
          .filter((i) => canPauseStatusKeys.includes(i.status))
          .forEach((i) => transportStore.pauseItem(i.uniqueId));
      };
      const onBatchCancel = () => {
        if (selectedRows.value.length === 0) {
          message.warning("请选择数据");
          return;
        }
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
        // console.log("onActivated");
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
        // console.log("onDeactivated");
        if (counterBarText) {
          clearInterval(counterBarText);
          startCount = 0;
        }
      });
      const calcRecordStatusTooltip = (record: UploadItem) => {
        if (
          ["calculating", "queueing", "pause", "cancel", "failed"].includes(
            record.status
          )
        ) {
          return "未连接";
        }
        // 剩下的状态是 sending receiving waiting successSend successReceive
        if (record.speed === 0 && record.status !== "waiting") return "连接中";
        // 连接的话返回对方浏览器信息
        return record.nfrAddr;
      };
      const calcRecordStatusColor = (record: UploadItem) => {
        if (
          ["calculating", "queueing", "pause", "cancel", "failed"].includes(
            record.status
          )
        ) {
          return "#ff4d4f"; //red
        }
        if (record.speed === 0 && record.status !== "waiting") return "#fadb14"; //yellow
        // 连接的话返回对方浏览器信息
        return "#52c41a"; //green
      };
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
        calcRecordStatusTooltip,
        calcRecordStatusColor,
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