<template>
  <div
    :style="{
      background: '#F0F2F5',
      height: '100%',
      padding: 0,
    }"
  >
    <!-- 这个为隐藏的作为选择文件用的 -->
    <input
      multiple
      class="hidden"
      type="file"
      id="transferFileInput"
      @change="onChangeMultipleUploadFile"
    />
    <!-- send -->
    <section class="p-4 mb-4 rounded-xl bg-white">
      <!-- 功能区 height 32px-->
      <div class="relative h-8 flex items-center mb-3">
        <a-tooltip title="后退">
          <XLink
            class="inline-block px-1 mr-2"
            :disabled="sendCode.length === 0"
            @click="onSendBack"
          >
            <LeftCircleOutlined />
          </XLink>
        </a-tooltip>
        <a-tooltip title="清空发送列表">
          <XLink
            class="inline-block px-1 mr-2"
            :disabled="tableSendData.length === 0"
            @click="onClearTableSendData"
          >
            <CloseCircleOutlined />
          </XLink>
        </a-tooltip>
        <div
          class="
            flex-1
            mr-2
            px-3
            flex
            items-center
            h-address-bar
            bg-address-bar
            rounded-full
            truncate
          "
        >
          <a-tooltip title="接收链接">
            <XLink
              class="inline-block w-full truncate"
              :title="sendLink"
              @click="onCopySendLink"
            >
              {{ sendLink }}
            </XLink>
          </a-tooltip>
        </div>
        <div
          class="
            w-20
            text-center
            font-semibold
            h-address-bar
            rounded-full
            px-2
            bg-address-bar
          "
        >
          <a-tooltip title="接收码">
            <XLink @click="onCopySendCode">
              {{ sendCode }}
            </XLink>
          </a-tooltip>
        </div>
        <!-- <div class="w-20 h-address-bar rounded-full px-2 bg-address-bar">
          time
        </div> -->
      </div>
      <!-- 表格区 -->
      <XTableFiles
        rowKey="uniqueId"
        :columns="columnsSend"
        :data="tableSendData"
        v-model:selectedRows="tableSendSelectedRows"
        v-model:selectedRowKeys="tableSendSelectedRowKeys"
      >
        <template #name="{ record }">
          <!-- <div>55----{{ record }}</div> -->
          <div :title="record.fileName">
            <XFileTypeIcon class="w-6 h-6 mr-2" :type="record.fileType" />
            <span>{{ record.fileName }}</span>
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
              <!-- <template v-if="record.status === 'initSend'">
                <span>等待中</span>
              </template> -->
              <template v-if="record.status === 'queueing'">
                <span>等待中</span>
              </template>
              <template v-else-if="record.status === 'sending'">
                <span class="ant-color-blue-6">
                  <!-- {{ calcStatusText(record.status) }} -->
                  {{ formatBytes(record.speed) }}/S
                </span>
                <span v-if="record.speed > 0">
                  - {{ calcTimeLeftText(record) }}</span
                >
              </template>
              <template v-else-if="record.status === 'waiting'">
                <span>等待确认</span>
              </template>
              <template v-else-if="record.status === 'successSend'">
                <span>发送成功</span>
              </template>
              <template v-else-if="record.status === 'failed'">
                <span>任务失败</span>
              </template>
              <template v-else-if="record.status === 'pause'">
                <span>暂停</span>
              </template>
              <template v-else-if="record.status === 'cancel'">
                <span>取消</span>
              </template>
              <template v-else>
                <span></span>
              </template>
            </div>
          </div>
        </template>
        <template #action="{ record }">
          <div class="flex items-center text-gray-600">
            <!-- 开始 -->
            <XLink
              v-if="['pause', 'failed'].includes(record.status)"
              class="flex-1"
              @click="onSendRecordStart(record)"
            >
              <a-tooltip title="开始">
                <RightCircleOutlined />
              </a-tooltip>
            </XLink>
            <!-- 暂停 -->
            <XLink
              v-if="['queueing', 'sending'].includes(record.status)"
              class="flex-1"
              @click="onSendRecordPause(record)"
            >
              <a-tooltip title="暂停">
                <PauseOutlined />
              </a-tooltip>
            </XLink>
            <XLink class="flex-1" @click="onSendRecordCancel(record)">
              <a-tooltip title="取消">
                <CloseOutlined />
              </a-tooltip>
            </XLink>
          </div>
        </template>
      </XTableFiles>
      <!-- 拖拽添加文件区域 -->
      <div class="pt-6 text-center">
        <div
          class="
            mx-auto
            px-4
            w-80
            relative
            flex
            items-center
            justify-center
            cursor-pointer
          "
          @click="onSelectFiles"
        >
          <!-- 拖拽区域 -->
          <a-tooltip title="可拖拽文件至此">
            <div
              class="absolute inset-0"
              @dragenter="onDragEnter"
              @dragleave="onDragLeave"
              @dragover="onDragOver"
              @drop="onDrop"
            ></div>
          </a-tooltip>
          <div
            class="w-full text-center mb-6"
            :style="{
              'border-radius': '4px',
              border: '1px dashed #d9d9d9',
              'font-size': '50px',
            }"
            :class="{
              dashedBorder: isFileOverUploadZone,
            }"
          >
            <PlusOutlined class="p-6 ant-color-blue-6" />
          </div>
        </div>
      </div>
    </section>
    <!-- receive -->
    <section class="p-4 rounded-xl bg-white">
      <!-- 功能区 height 32px-->
      <div class="relative h-8 flex items-center mb-3">
        <!-- 开始/暂停 -->
        <a-tooltip title="下载选中">
          <XLink
            class="inline-block px-1 mr-2"
            :disabled="tableReceiveSelectedRows.length === 0"
            @click="onDownloadAllReceiveFiles"
          >
            <DownloadOutlined />
          </XLink>
        </a-tooltip>
        <!-- 取消 -->
        <a-tooltip title="清空接收列表">
          <XLink
            class="inline-block px-1 mr-2"
            :disabled="tableReceiveData.length === 0"
            @click="onClearTableReceiveData"
          >
            <CloseCircleOutlined />
          </XLink>
        </a-tooltip>
        <div
          class="
            flex-1
            px-3
            flex
            items-center
            h-address-bar
            bg-address-bar
            rounded-full
            truncate
          "
        >
          <template v-if="isTypeLink">
            <XLink class="truncate" :title="receiveLink">
              {{ receiveLink }}
            </XLink>
          </template>
          <div
            v-else
            class="absolute-center-x flex items-center"
            :style="{
              height: '24px',
              'border-bottom': '1px solid #d9d9d9',
            }"
          >
            <a-input
              class="receiveInputCode"
              v-model:value="receiveInputCode"
              :style="{
                background: 'transparent',
                height: '26px',
                border: 'none',
              }"
            >
            </a-input>
            <XLink
              :disabled="receiveInputCode.length === 0"
              @click="onReceiveConfirmCode"
            >
              <LoadingOutlined v-if="receiveInputLoading" class="px-2" />
              <RightCircleOutlined v-else class="px-2" />
            </XLink>
          </div>
        </div>
      </div>
      <!-- 接收表格区 -->
      <XTableFiles
        rowKey="uniqueId"
        :columns="columnsReceive"
        :data="tableReceiveData"
        v-model:selectedRows="tableReceiveSelectedRows"
        v-model:selectedRowKeys="tableReceiveSelectedRowKeys"
      >
        <template #name="{ record }">
          <!-- <div>55----{{ record }}</div> -->
          <div :title="record.fileName">
            <XFileTypeIcon class="w-6 h-6 mr-2" :type="record.fileType" />
            <span>{{ record.fileName }}</span>
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
              <!-- <template v-if="record.status === 'initSend'">
                <span>等待中</span>
              </template> -->
              <template v-if="record.status === 'queueing'">
                <span>等待中</span>
              </template>
              <template v-else-if="record.status === 'receiving'">
                <span class="ant-color-blue-6">
                  <!-- {{ calcStatusText(record.status) }} -->
                  {{ formatBytes(record.speed) }}/S
                </span>
                <span v-if="record.speed > 0">
                  - {{ calcTimeLeftText(record) }}</span
                >
              </template>
              <template v-else-if="record.status === 'successReceive'">
                <span>接收成功</span>
              </template>
              <template v-else-if="record.status === 'failed'">
                <span>任务失败</span>
              </template>
              <template v-else-if="record.status === 'pause'">
                <span>暂停</span>
              </template>
              <template v-else-if="record.status === 'cancel'">
                <span>取消</span>
              </template>
              <template v-else>
                <span></span>
              </template>
            </div>
          </div>
        </template>
        <template #action="{ record }">
          <div class="flex items-center text-gray-600">
            <XLink
              class="flex-1"
              @click="onReceiveRecordDownload(record)"
              :disabled="record.status !== 'successReceive'"
            >
              <a-tooltip title="下载">
                <DownloadOutlined />
              </a-tooltip>
            </XLink>
            <XLink class="flex-1" @click="onReceiveRecordCancel(record)">
              <a-tooltip title="删除">
                <CloseOutlined />
              </a-tooltip>
            </XLink>
          </div>
        </template>
      </XTableFiles>
    </section>
  </div>
</template>

<script lang="ts">
import {
  computed,
  createVNode,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from "vue";
import {
  LeftCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  CloseOutlined,
  ReloadOutlined,
  LoadingOutlined,
  RightCircleOutlined,
  PauseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { XTableFiles, XFileTypeIcon } from "../../components";
import { useI18n } from "vue-i18n";
import {
  downloadFileByBlob,
  formatBytes,
  getFileSHA256,
  getFileType,
  getRandomNumStr,
  getRepeatlyClientDialFn,
  mergeUint8Array,
  promiseChecker,
  readHeaderInSession,
  useDelay,
  writeHeaderInSession,
} from "@/utils";
import { useRoute, useRouter } from "vue-router";
import { useClipboard, useLocalStorage } from "@vueuse/core";
import { message, Modal } from "ant-design-vue";
import { useTransportStore, useUserStore } from "@/store";
import { classMultiClient, TMessageType, TSession } from "nkn";
import { getAnonymousMultiClient } from "@/apollo/nknConfig";
import pLimit from "p-limit";
import { pick, remove, throttle } from "lodash-es";
import { decode, encode } from "@msgpack/msgpack";
import dayjs from "dayjs";
import { MAX_MTU } from "@/constants";
import {
  get,
  set,
  update,
  getMany,
  setMany,
  del,
  delMany,
  entries,
  values,
  clear,
  keys,
} from "idb-keyval";
import { Channel } from "phoenix";

type TransferFile = {
  file?: File;
  uniqueId: string;
  fileHash: string; // 用来双方校验文件完整性
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  speed: number;
  status:
    | "queueing"
    | "sending"
    | "receiving"
    | "pause" // 暂停
    | "cancel" // 取消
    | "waiting" // 发送完后等待对方确认收到
    | "successSend"
    | "successReceive"
    | "failed";
};
/** channel shakehand message type */
type ChannelMsgType = {
  addr: string;
};
type FileHeader = {
  fileName: string;
  fileSize: number;
  fileHash: string;
  MIMEType: string;
};
/** channel 信息类型 */
const CHANNEL_MSG = {
  SHAKE_HAND: "shake_hand",
  CONFIRM_CODE: "confirm_code",
  PAUSE: "pause",
  CANCEL: "cancel",
};
const RECEIVE_PREFIX = "totalReceive";
/** 获取节点准备好的nkn client */
const getReadyAnonymousMultiClient = () => {
  return new Promise<classMultiClient>((resolve, reject) => {
    // 10s 4个节点, 不然就重置
    let client = getAnonymousMultiClient();
    let counter = 0;
    let id = setInterval(() => {
      counter += 1;
      if (client.readyClientIDs().length >= 2) {
        counter = 0;
        console.log("匿名client节点满足");
        resolve(client);
        clearInterval(id);
        // 超过10s 还未ready 的话就重置client
      } else if (counter >= 10) {
        counter = 0;
        client = getAnonymousMultiClient();
        console.log("重置匿名client");
      }
    }, 1000);
  });
};
/**计算剩余时间 */
const calcTimeLeftTextFn = (record: TransferFile) => {
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
/** 根据文件名/大小 生成唯一key */
const makeUniqueId = (name: string, size: number) => `${name}-${size}`;
/** 创建-确认信息 */
const makeConfirmMessage = (uniqueId: string) => `received-${uniqueId}`;
/** 判断record传输状态 */
const isStatus = (sArr: TransferFile["status"][], record: TransferFile) => {
  return sArr.includes(record.status);
};

export default defineComponent({
  components: {
    LeftCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    PlusOutlined,
    CloseOutlined,
    ReloadOutlined,
    LoadingOutlined,
    RightCircleOutlined,
    PauseOutlined,
    //
    XTableFiles,
    XFileTypeIcon,
  },
  setup() {
    const { t } = useI18n();
    const [route, router] = [useRoute(), useRouter()];
    const userStore = useUserStore();
    const transportStore = useTransportStore();
    let nknClient: null | classMultiClient = null;
    const nknStatusCount = ref(0);
    const isUserLoggedIn = computed(() => userStore.isLoggedIn);
    /** 统一的获取client 接口(区分登录/未登录) */
    const initMultiClient = async () => {
      if (nknClient) return nknClient;
      if (isUserLoggedIn.value) {
        nknClient = await userStore.getStoreMultiClient();
      } else {
        nknClient = await getReadyAnonymousMultiClient();
      }
      return nknClient;
    };
    const initClientStatus = initMultiClient().then((client) => {
      nknStatusCount.value = client?.readyClientIDs().length ?? 0;
    });
    /** 移除 nknClient 的message listener */
    const removeNknClientMsgListener = (fn: (...args: any[]) => any) => {
      remove(nknClient?.eventListeners.message ?? [], (v) => v === fn);
    };
    /** 是否双方正在连接中 */
    let isBothConnected = false;
    let sendChannel: Channel;
    /** 当前的发送的目标地址 */
    let currentReceiveRemoteAddr: string;
    function useSend() {
      const columnsSend = [
        // 文件名/ 大小/ 状态/ 操作
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
        },
        {
          title: t("metanet.size"),
          dataIndex: "fileSize",
          slots: { customRender: "fileSize" },
          width: 180,
        },
        {
          title: "状态",
          slots: { customRender: "status" },
          width: 250,
        },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 100,
          slots: { customRender: "action" },
        },
      ];
      const tableSendData = reactive<TransferFile[]>([]);
      const tableSendSelectedRows = ref<TransferFile[]>([]);
      const tableSendSelectedRowKeys = ref([]);
      const sendLink = ref("");
      const sendCode = ref("");
      const onCopySendLink = () => {
        const text = sendLink.value;
        if (text.length) {
          useClipboard({ read: false })
            .copy(text)
            .then(() => {
              message.success(t("metanet.copySuccess"));
            });
        }
      };
      const onCopySendCode = () => {
        const text = sendCode.value;
        if (text.length) {
          useClipboard({ read: false })
            .copy(text)
            .then(() => {
              message.success(t("metanet.copySuccess"));
            });
        }
      };
      /** 重新发送单个 */
      const onSendRecordResend = (record: TransferFile) => {
        console.log("onSendRecordResend");
      };
      /** 开始单个 */
      const onSendRecordStart = (record: TransferFile) => {
        console.log("onSendRecordStart");
        sendFileLimit(() => onSendOneFile(currentReceiveRemoteAddr, record));
      };
      /** 暂停单个 */
      const onSendRecordPause = (record: TransferFile) => {
        console.log("onSendRecordPause", record.status);
        if (isStatus(["queueing", "sending"], record)) {
          record.status = "pause";
          console.log("设置暂停后的record.status", record.status);
          // 这里设置为 pause ,发送那边会根据这个去关闭session
        }
      };
      /** 取消单个 */
      const onSendRecordCancel = (record: TransferFile) => {
        console.log("onSendRecordCancel");
        // 1 如果正在传输过程,提示
        // waiting?
        if (isStatus(["sending"], record)) {
          Modal.confirm({
            icon: createVNode(ExclamationCircleOutlined),
            title: "任务正在传输中，是否取消?",
            onOk: () => {
              return new Promise<void>((resolve) => {
                // 设置为取消状态,发送暂停信息给接收端
                record.status = "cancel";
                remove(tableSendData, (v) => v.uniqueId === record.uniqueId);
                resolve();
              });
            },
          });
        } else {
          // 2 直接取消
          remove(tableSendData, (v) => v.uniqueId === record.uniqueId);
        }
      };
      /** 清空发送文件列表 */
      const onClearTableSendData = () => {
        // 1. 如果有传输中的任务
        if (tableSendData.some((i) => i.status === "sending")) {
          message.warning("有任务正在接收中");
        } else {
          // 2.
          tableSendData.forEach(onSendRecordCancel);
          tableSendData.length = 0;
        }
      };
      const onSelectFiles = () => {
        if (!nknClient) {
          message.warning("请等待nkn节点就绪");
          return;
        }
        // 这个去触发 onChangeMultipleUploadFile
        document.getElementById("transferFileInput")?.click();
      };
      /** 倒计时 */
      const countdownText = ref("");
      const resetClientListener: (() => void)[] = [];
      /** 后退,取消表格中的任务 和 清除生成的链接和接收码 */
      const onSendBack = () => {
        const clearSendReadyStatus = () => {
          sendLink.value = "";
          sendCode.value = "";
          sendChannel?.leave();
        };
        //1.有任务
        if (tableSendData.length) {
          Modal.confirm({
            icon: createVNode(ExclamationCircleOutlined),
            title: "表格中有任务，是否返回默认状态?",
            onOk: async () => {
              // 取消表格中的每一项
              tableSendData.map((i) => {
                i.status = "cancel";
              });
              await useDelay(1000);
              tableSendData.length = 0;
              clearSendReadyStatus();
            },
          });
        } else {
          //2.没任务
          clearSendReadyStatus();
        }
      };
      /** 发送一个文件 */
      const onSendOneFile = async (remotAddr: string, item: TransferFile) => {
        if (!item.file) return;
        if (!nknClient) return;
        const repeatlyDial = getRepeatlyClientDialFn(nknClient, remotAddr);
        const session = await repeatlyDial();
        if (!session) {
          message.warning("session 握手失败");
          console.log("session 握手失败");
          item.status = "failed";
          item.file = undefined; // 清空文件缓存 不允许再次操作
          return;
        }
        console.log("session", session);
        item.status = "sending";
        // console.log("session", session);
        const header: FileHeader = {
          fileName: item.file.name,
          fileSize: item.file.size,
          fileHash: item.fileHash,
          MIMEType: item.file.type,
        };
        const uniqueId = makeUniqueId(item.file.name, item.file.size);
        await writeHeaderInSession(session, encode(header));
        // while fileSize MAX_MTU
        let startLen = 0;
        // 读取接收方的offset --start 10 秒后会超时
        const readOffsetFromMessage = (waitTime = 10_000) => {
          // console.time("[性能] 接收offset时间");
          return new Promise<number>((resolve) => {
            const timer = setTimeout(() => {
              // 相当于一个错误
              console.log("等待offset 信息超时");
              removeNknClientMsgListener(handleConfirmOffset);
              resolve(0);
            }, waitTime);
            const handleConfirmOffset = (msgObj: TMessageType) => {
              // hash 和 offset
              // console.log("msgObj", msgObj);
              const [fileHash, offset] = msgObj.payload.split("-");
              if (fileHash === item.fileHash) {
                console.log("收到接收方offset消息推送", offset);
                resolve(+offset);
                // console.timeEnd("[性能] 接收offset时间");
                clearTimeout(timer);
                removeNknClientMsgListener(handleConfirmOffset);
              }
            };
            nknClient?.onMessage(handleConfirmOffset);
          });
        };
        const offsetRes = await readOffsetFromMessage();
        startLen = offsetRes;

        // 读取接收方的offset --end
        const startTime = dayjs();
        let diffSeconds = 0;
        let toSetBytesPerSecond = 0;
        const fileBuffer = await item.file.arrayBuffer();
        const errorLenMessageHandler = (msgObj: TMessageType) => {
          console.log("errorLenMessageHandler-msg", msgObj);
          if (msgObj.payload.startsWith("errorReadlen")) {
            const [e, start, end] = msgObj.payload.split("-");
            console.log(
              "发送端收到接收端发的errorLen信息-回应buffer",
              msgObj.payload,
              start,
              end,
              fileBuffer.slice(+start, +end)
            );
            return new Uint8Array(fileBuffer.slice(+start, +end));
          }
        };
        nknClient.onMessage(errorLenMessageHandler);
        // console.log("fileBuffer", fileBuffer);
        const maxSendLength = fileBuffer.byteLength;
        const setItemProgressSpeedStatus = (
          progress: number,
          speed: number,
          status: TransferFile["status"]
        ) => {
          // 防止push 的过程idx 变了, 所以得重新查找
          const idx = tableSendData.findIndex((i) => i.uniqueId === uniqueId);
          if (idx !== -1) {
            tableSendData[idx].progress = progress;
            tableSendData[idx].speed = speed;
            tableSendData[idx].status = status;
          }
        };
        const getItemCurSendStatus = () => item.status;
        while (startLen <= maxSendLength) {
          // console.log("getItemCurSendStatus", getItemCurSendStatus);
          // 检测取消状态
          if (getItemCurSendStatus() === "cancel") {
            await session.close();
            // 发送取消信息
            // 登录状态下用 channel 发
            sendChannel.push(CHANNEL_MSG.CANCEL, { uniqueId: item.uniqueId });
            // 非登录状态下用 nkn 发
            nknClient.send(remotAddr, `cancel/${item.uniqueId}`);
          }
          // 检测暂停状态
          if (getItemCurSendStatus() === "pause") {
            await session.close();
            // 发送暂停信息
            // 登录状态下用 channel 发
            sendChannel.push(CHANNEL_MSG.PAUSE, { uniqueId: item.uniqueId });
            // 非登录状态下用 nkn 发
            nknClient.send(remotAddr, `pause/${item.uniqueId}`);
          }

          if (session.isClosed) {
            console.error("session closed");
            return;
          }
          const toWriteChunk = new Uint8Array(
            fileBuffer.slice(
              startLen,
              Math.min(startLen + MAX_MTU, maxSendLength)
            )
          );
          // console.log("正在传的chunk开始长度", startLen);
          await session.write(toWriteChunk);
          startLen += MAX_MTU;
          // 设置进度 start
          const toSetProgressVal = Math.floor((startLen / maxSendLength) * 100);
          if (toSetProgressVal < 100) {
            const curDiffSeconds = dayjs().diff(startTime, "second");
            if (curDiffSeconds > diffSeconds) {
              toSetBytesPerSecond =
                startLen / dayjs().diff(startTime, "second");
              diffSeconds = curDiffSeconds;
            }
            // 如果不是暂停/取消 状态,继续设置进度和发送状态
            if (!["pause", "cancel"].includes(getItemCurSendStatus())) {
              setItemProgressSpeedStatus(
                toSetProgressVal,
                toSetBytesPerSecond,
                "sending"
              );
            }
          } else {
            setItemProgressSpeedStatus(99, 0, "waiting");
          }
          // 设置进度 end
        }
        const confirmMessage = makeConfirmMessage(uniqueId);
        /** 删除client 里的监听释放内存 */
        const handleConfirmMessage = (message: TMessageType) => {
          console.log("收到确认信息", message);
          if (message.payload === confirmMessage) {
            setItemProgressSpeedStatus(100, 0, "successSend");
            if (userStore.isLoggedIn)
              transportStore.makePeerTransferSuccessItem(
                "send",
                item.fileName,
                item.fileSize
              );
            // 清空文件节省内存
            item.file = undefined;
            removeNknClientMsgListener(handleConfirmMessage);
          }
        };
        nknClient.onMessage(handleConfirmMessage);
        removeNknClientMsgListener(errorLenMessageHandler);
      };
      const sendFileLimit = pLimit(2);

      const onClickSendBtn = async () => {
        console.log("call-onClickSendBtn");
        if (!nknClient) {
          message.warning("请等待nkn节点就绪");
          return;
        }
        let lock = false;
        // sendBtnLoading.value = true;
        // await useDelay(300);
        // sendBtnLoading.value = false;
        // countdown -start
        countdownText.value = "10:00";
        let duration = 60 * 10 - 1; // 10mins - 1s
        /** link or 验证码 过期倒计时 */
        const timerCountdown = window.setInterval(() => {
          let minutes = ((duration / 60) | 0) + "";
          let seconds = (duration % 60 | 0) + "";
          // 转换一位到两位显示  9=>09
          minutes = +minutes < 10 ? "0" + minutes : minutes;
          seconds = +seconds < 10 ? "0" + seconds : seconds;
          countdownText.value = `${minutes}:${seconds}`;
          if (--duration < 0) {
            lock = true; // 超时加锁,onMessage 监听不能再用了
            clearInterval(timerCountdown);
          }
        }, 1000);
        resetClientListener.push(() => clearInterval(timerCountdown));
        // countdown -end
        const handleShakeHandMessage = async ({
          payload,
          src,
        }: {
          payload: string;
          src: string;
        }) => {
          if (lock) {
            // 因为没有off 方法, 这里设置了防止重复接收message , 只能用一次
            return;
          }
          // 注册 当前的接收端目标地址
          currentReceiveRemoteAddr = src;
          if (payload === CHANNEL_MSG.SHAKE_HAND) {
            clearInterval(timerCountdown);
            console.log("收到接收方发来的消息,即将发送文件总大小消息", payload);
            // await nknClient?.send(
            //   src,
            //   totalInfoGuard._encode(
            //     totalSendSize.value,
            //     tableSend.value.length
            //   ),
            //   {
            //     noReply: true,
            //   }
            // );
            lock = true;
            Promise.all(
              tableSendData.map((item) => {
                // 注册该文件的目标远程地址, 方便单文件操作-开始 的调用
                sendFileLimit(() => onSendOneFile(src, item));
              })
            ).finally(() => {
              removeNknClientMsgListener(handleShakeHandMessage);
            });
          }
        };
        nknClient.onMessage(handleShakeHandMessage);
        resetClientListener.push(() => {
          removeNknClientMsgListener(handleShakeHandMessage);
        });
        //
        const transferUrl = location.href.match(/^.*peerTransfer/g)?.[0];
        const myAddr = nknClient.addr;
        sendLink.value = `${transferUrl}?addr=${myAddr}`;
        const { socket } = userStore;
        if (!socket) return;
        sendCode.value = getRandomNumStr(6);
        sendChannel = socket.channel(`airdrop:${sendCode.value}`);
        sendChannel.join();
        const ref1 = sendChannel.on(
          CHANNEL_MSG.SHAKE_HAND,
          async (data: ChannelMsgType) => {
            console.log("channel-shakehand", data);
            sendChannel.push(CHANNEL_MSG.CONFIRM_CODE, {
              msg: "code is ok",
            });
            await useDelay(1000);
            handleShakeHandMessage({
              payload: CHANNEL_MSG.SHAKE_HAND,
              src: data.addr,
            });
            sendChannel.off(CHANNEL_MSG.SHAKE_HAND, ref1);
            // sendChannel.leave();
          }
        );
      };
      const onChangeMultipleUploadFile = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        const fileArr: TransferFile[] = await Promise.all(
          [...input.files].map(async (i) => ({
            file: i,
            fileHash: await getFileSHA256(i),
            fileName: i.name,
            fileSize: i.size,
            uniqueId: makeUniqueId(i.name, i.size),
            fileType: getFileType({ isDir: false, fileName: i.name }),
            progress: 0,
            speed: 0,
            status: "queueing" as TransferFile["status"], // 首次加入文件设置为等待中
          }))
        );
        // 去掉已经加入的文件
        const noSameFileArr = fileArr.filter(
          (i) => !tableSendData.some((e) => e.uniqueId === i.uniqueId)
        );
        // 如果是第一次的添加文件 如果还未生成 接收链接 和 接收码
        if (tableSendData.length === 0 && sendCode.value.length === 0) {
          onClickSendBtn();
        }
        tableSendData.push(...noSameFileArr);
        // 清空input 的缓存
        input.value = "";
        // 如果有 当前接收端地址的, 立刻开始发送新加入的文件
        if (currentReceiveRemoteAddr) {
          noSameFileArr.forEach((item) => {
            sendFileLimit(() => onSendOneFile(currentReceiveRemoteAddr, item));
          });
        }
      };
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
        const fileArr: TransferFile[] = await Promise.all(
          [...files].map(async (i) => ({
            file: i,
            fileName: i.name,
            fileSize: i.size,
            fileHash: await getFileSHA256(i),
            uniqueId: makeUniqueId(i.name, i.size),
            fileType: getFileType({ isDir: false, fileName: i.name }),
            progress: 0,
            speed: 0,
            status: "queueing" as TransferFile["status"],
          }))
        );
        // 去掉已经加入的文件
        const noSameFileArr = fileArr.filter(
          (i) => !tableSendData.some((e) => e.uniqueId === i.uniqueId)
        );
        // 如果是第一次的添加文件, 直接生成link 和码
        if (tableSendData.length === 0 && sendCode.value.length === 0) {
          onClickSendBtn();
        }
        tableSendData.push(...noSameFileArr);
        // 如果有文件正在发送, 立刻开始发送新加入的文件
        if (currentReceiveRemoteAddr) {
          noSameFileArr.forEach((item) => {
            sendFileLimit(() => onSendOneFile(currentReceiveRemoteAddr, item));
          });
        }
      };
      return {
        columnsSend,
        tableSendData,
        tableSendSelectedRows,
        tableSendSelectedRowKeys,
        sendLink,
        sendCode,
        onSendBack,
        onCopySendLink,
        onCopySendCode,
        onSendRecordResend,
        onSendRecordStart,
        onSendRecordPause,
        onSendRecordCancel,
        onClearTableSendData,
        onSelectFiles,
        onChangeMultipleUploadFile,
        isFileOverUploadZone,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
      };
    }
    function useReceive() {
      const columnsReceive = [
        // 文件名/ 大小/ 状态/ 操作
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
        },
        {
          title: t("metanet.size"),
          dataIndex: "fileSize",
          slots: { customRender: "fileSize" },
          width: 180,
        },
        {
          title: "状态",
          slots: { customRender: "status" },
          width: 250,
        },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 100,
          slots: { customRender: "action" },
        },
      ];
      const receiveLink = ref("");
      const tableReceiveData = reactive<TransferFile[]>([]);
      const storegeReceiveData = useLocalStorage(
        "tableReceiveData",
        [] as unknown as Omit<
          TransferFile,
          "file" | "progress" | "speed" | "status"
        >[]
      );
      const getStorageItemProgress = async (fileHash: string) => {
        const found = await get(fileHash);
        return found?.length ?? 0;
      };
      // 如果有indexDB数据的文件缓存
      if (storegeReceiveData.value.length) {
        keys().then((fileHashList) => {
          const hasDataList = storegeReceiveData.value.filter((item) =>
            fileHashList.includes(item.fileHash)
          );
          if (hasDataList.length) {
            storegeReceiveData.value = hasDataList;
            Promise.all(
              storegeReceiveData.value.map<Promise<TransferFile>>(
                async (item) => {
                  const storageItemLen = await getStorageItemProgress(
                    item.fileHash
                  );
                  const progress = Math.floor(
                    (storageItemLen / item.fileSize) * 100
                  );
                  // console.log(
                  //   "progress",
                  //   progress,
                  //   storageItemLen,
                  //   item.fileSize
                  // );
                  return {
                    ...item,
                    file: new File(["0"], item.fileName),
                    progress,
                    speed: 0,
                    status: progress === 100 ? "successReceive" : "queueing",
                  };
                }
              )
            ).then((list) => tableReceiveData.push(...list));
          }
        });
      }
      const tableReceiveSelectedRows = ref<TransferFile[]>([]);
      const tableReceiveSelectedRowKeys = ref([]);
      /** 下载全部接收文件 */
      const onDownloadAllReceiveFiles = () => {
        // 找出全部接收完的
        const canDownLoadData = tableReceiveSelectedRows.value.filter(
          (i) => i.status === "successReceive"
        );
        if (canDownLoadData.length) {
          canDownLoadData.forEach(onReceiveRecordDownload);
        }
      };
      const onClearTableReceiveData = () => {
        console.log("onClearTableReceiveData");
        // 1. 如果有传输中的任务
        if (tableReceiveData.some((i) => i.status === "receiving")) {
          message.warning("有任务正在接收中");
        } else {
          // 2.
          tableReceiveData.forEach(onReceiveRecordCancel);
          tableReceiveData.length = 0;
        }
      };
      const onReceiveRecordDownload = async (record: TransferFile) => {
        console.log("onReceiveRecordDownload");
        if (record.progress !== 100) {
          message.warning("文件未接收完整");
          return;
        }
        const fileHash = record.fileHash;
        const fileBuffer = await get(fileHash);
        if (fileBuffer) {
          downloadFileByBlob(
            new File([fileBuffer], record.fileName, {
              type: record.file?.type,
            }),
            record.fileName
          );
        }
      };
      const onReceiveRecordCancel = (record: TransferFile) => {
        console.log("onReceiveRecordCancel");
        if (
          isStatus(
            ["successReceive", "failed", "queueing", "cancel", "pause"],
            record
          )
        ) {
          const fileHash = record.fileHash;
          del(fileHash);
          remove(tableReceiveData, (v) => v.uniqueId === record.uniqueId);
        }
      };
      /** link 模式还是输入码模式 */
      const isTypeLink = ref(false);
      const remoteAddr = route.query.addr as string;
      isTypeLink.value = !!remoteAddr;
      const receiveInputCode = ref("");
      const receiveInputLoading = ref(false);
      const handleReceiveFile = async (
        type: "link" | "code",
        remoteAddr?: string
      ) => {
        receiveInputLoading.value = true;
        if (type === "link") await initClientStatus;
        if (!nknClient) return;
        // console.log("client-listen");
        // 发送回去消息,告诉接收方准备好了
        if (type === "link" && remoteAddr) {
          console.log("sendmsg-to-sendclient");
          await nknClient.send(remoteAddr, CHANNEL_MSG.SHAKE_HAND, {
            noReply: true,
          });
        }
        // 必须要listen 才能onSession
        nknClient.listen();
        await useDelay(500);
        // const session = await nknClient.dial(remoteAddr);
        // console.log("session---------", session);
        // 一个session 只用来发送一个文件
        const handleSession = async (session: TSession) => {
          console.log("handleSession was called");
          if (!nknClient) {
            console.log("handleSession-error-noNknClient", nknClient);
            return;
          }
          const headerUint8Array = await readHeaderInSession(session);
          const headerObj = decode(headerUint8Array) as FileHeader;
          let toDownloadFile: File | null = null;
          console.log("读取文件头部信息", headerObj);
          const uniqueId = makeUniqueId(headerObj.fileName, headerObj.fileSize);
          const itemToPush: TransferFile = reactive({
            file: new File(["0"], headerObj.fileName, {
              type: headerObj.MIMEType,
            }),
            fileName: headerObj.fileName,
            fileSize: headerObj.fileSize,
            fileHash: headerObj.fileHash,
            uniqueId,
            fileType: getFileType({
              isDir: false,
              fileName: headerObj.fileName,
            }),
            progress: 0,
            speed: 0,
            status: "queueing",
          });
          // 如果列表中已经有了就替换, 否则就push
          const foundIdx = tableReceiveData.findIndex(
            (i) => i.fileHash === itemToPush.fileHash
          );
          if (foundIdx !== -1) {
            // 更新未缓存的进度
            itemToPush.progress = tableReceiveData[foundIdx].progress;
            tableReceiveData[foundIdx] = itemToPush;
          } else {
            tableReceiveData.push(itemToPush);
          }
          // 保存这次列表到 storage 中
          storegeReceiveData.value = tableReceiveData.map((item) =>
            pick(item, [
              "uniqueId",
              "fileHash",
              "fileName",
              "fileSize",
              "fileType",
            ])
          );
          // console.log(headerObj);
          const maxReceiveLength = headerObj.fileSize;
          const fileHash = headerObj.fileHash;
          const dbKeys = await keys();
          let startLen = 0;
          if (!dbKeys.includes(fileHash)) {
            set(fileHash, new Uint8Array(0));
          } else {
            // 如果有缓存, 取出上一次的长度
            startLen = (await get(fileHash)).length;
          }
          console.log("startLen", startLen);
          // 发送offset信息
          await nknClient.send(session.remoteAddr, `${fileHash}-${startLen}`);
          const dbLimit = pLimit(1);
          const LIMIT_SIZE = 5 * 1024 * 1024;
          let bufBox = new Uint8Array(0);
          const updateFileDb = async (buf: Uint8Array) => {
            bufBox = mergeUint8Array(bufBox, buf); // pass
            if (bufBox.length >= LIMIT_SIZE) {
              await update(fileHash, (val) => mergeUint8Array(val, bufBox));
              bufBox = new Uint8Array(0);
            }
          };
          // const cacheMergeRoundedBuf = async (r: Uint8Array) => {
          //   dbLimit(() => updateFileDb(r));
          // };
          const startTime = dayjs();
          let diffSeconds = 0;
          let toSetBytesPerSecond = 0;
          /** 未读取正确长度的buffer */
          // const unFullyReadObj: { [key: string]: Uint8Array } = {
          // '0-100':new Uint8Array(0)
          // };
          // const errorReadLenPromiseArr = [];
          const getItemCurReceiveStatus = () => itemToPush.status;
          while (startLen < maxReceiveLength) {
            // pause cancel 状态检测?
            if (session.isClosed) {
              console.error("session closed");
              return;
            }
            // 这次循环要读取的长度
            const toReadLength =
              startLen + MAX_MTU <= maxReceiveLength
                ? MAX_MTU
                : maxReceiveLength - startLen;
            try {
              let roundRead = await session.read(toReadLength);
              // 如果长度不一致, 取已经读取的长度
              // if (toReadLength !== roundRead.length) {
              // console.error(
              //   "读取后的长度与预计长度不一致!",
              //   toReadLength,
              //   roundRead.length,
              //   roundRead
              // );
              // 本次读取的buf的长度与预计的不一致
              // 要求message 重发
              // const key = `${startLen}-${startLen + toReadLength}`;
              // unFullyReadObj[key] = new Uint8Array(0);
              // roundRead = new Uint8Array(toReadLength);
              // const p = nknClient
              //   .send(session.remoteAddr, `errorReadlen-${key}`, {
              //     responseTimeout: 10_000,
              //     noReply: false,
              //   })
              //   .then((replyMsg) => {
              //     console.log(
              //       "发送长度错误的信息后,收到的回应信息",
              //       replyMsg
              //     );
              //     unFullyReadObj[key] = replyMsg as unknown as Uint8Array;
              //   });
              // errorReadLenPromiseArr.push(p);
              // }
              // console.log("roundRead", roundRead);
              // cacheMergeRoundedBuf(roundRead);
              dbLimit(() => updateFileDb(roundRead));
              startLen += roundRead.length;
              if (startLen > maxReceiveLength) {
                startLen = maxReceiveLength;
              }
            } catch (error) {
              // session 读取出错的时候先保存
              console.error("session-read-error,save file db first", error);
              dbLimit(() => {
                if (bufBox.length) {
                  return update(fileHash, (val) =>
                    mergeUint8Array(val, bufBox)
                  );
                }
              });
            }

            // fileBuffer = mergeUint8Array(fileBuffer, roundRead);
            // console.log(
            //   "已经写入的array-正在接收的chunk长度",
            //   fileBuffer,
            //   roundRead
            // );
            // startLen += MAX_MTU;
            // startLen += roundRead.length;
            // if (startLen > maxReceiveLength) {
            //   startLen = maxReceiveLength;
            // }
            // 设置进度 start
            const setItemProgressSpeedStatus = (
              progress: number,
              speed: number,
              status: TransferFile["status"]
            ) => {
              // 防止push 的过程idx 变了, 所以得重新查找
              const idx = tableReceiveData.findIndex(
                (i) => i.uniqueId === uniqueId
              );
              if (idx !== -1) {
                tableReceiveData[idx].progress = progress;
                tableReceiveData[idx].speed = speed;
                tableReceiveData[idx].status = status;
              }
            };
            const toSetProgressVal = Math.floor(
              (startLen / maxReceiveLength) * 100
            );
            // console.log("toSetProgressVal", toSetProgressVal);
            if (toSetProgressVal < 100) {
              const curDiffSeconds = dayjs().diff(startTime, "second");
              if (curDiffSeconds > diffSeconds) {
                toSetBytesPerSecond =
                  startLen / dayjs().diff(startTime, "second");
                diffSeconds = curDiffSeconds;
              }
              // 如果不是暂停/取消 状态,继续设置进度和接收状态
              if (!["pause", "cancel"].includes(getItemCurReceiveStatus())) {
                setItemProgressSpeedStatus(
                  toSetProgressVal,
                  toSetBytesPerSecond,
                  "receiving"
                );
              }
            } else {
              await dbLimit(() => null);
              setItemProgressSpeedStatus(100, 0, "successReceive");
              if (userStore.isLoggedIn)
                transportStore.makePeerTransferSuccessItem(
                  "receive",
                  headerObj.fileName,
                  headerObj.fileSize
                );
            }
          }
          // 这里要等待上一个dblimit tick
          await dbLimit(() => null);
          // 等待处理错误长度的promise
          // await Promise.allSettled(errorReadLenPromiseArr);
          // const unkeys = Object.keys(unFullyReadObj);
          // 合并不完整接收的部分
          // console.log("unFullyReadObj", unFullyReadObj);
          // if (unkeys.length) {
          // const hasValKeys = Object.keys(unFullyReadObj).filter(
          //   (k) => unFullyReadObj[k]
          // );
          // console.log("hasValKeys", hasValKeys);
          // for (const key of hasValKeys) {
          //   const [start, end] = key.split("-");
          //   const uint8 = unFullyReadObj[key];
          //   dbLimit(() =>
          //     update(fileHash, (v) => {
          //       v.set(uint8, +start);
          //       return v;
          //     })
          //   );
          // }
          // // 这里要等待上一个dblimit tick
          // await dbLimit(() => null);
          // await update<Uint8Array>(fileHash, (val) => {
          //   if (val) {
          //     unkeys.forEach((key) => {
          //       const [e, start, end] = key.split("-");
          //       console.log("val-start-end", val, unFullyReadObj[key], start);
          //       // val.set(unFullyReadObj[key], +start);
          //       // TODO 这里不应该?+start应该肯定有值+start +
          //       const uint8 = unFullyReadObj[key];
          //       if (uint8) {
          //         val.set(uint8, +start);
          //       }
          //     });
          //   }
          //   return val || new Uint8Array(0);
          // });
          // }
          // 接收完毕 再检查一次有没有未合并的
          if (bufBox.length) {
            // console.log("还剩的buf", bufBox);
            console.time("last-update");
            const beforeLastUpdate = await get(fileHash);
            await dbLimit(() =>
              update(fileHash, (val) => mergeUint8Array(val, bufBox))
            );
            const afterLastUpdate = await get(fileHash);
            console.timeEnd("last-update");
          }
          // TODO 发回去校验hash
          // 发送-确认信息
          await nknClient.send(
            session.remoteAddr,
            makeConfirmMessage(uniqueId)
          );
          receiveInputLoading.value = false;
          // toDownloadFile = new File([fileBuffer], headerObj.fileName, {
          //   type: headerObj.MIMEType,
          // });
          // downloadFileByBlob(toDownloadFile, headerObj.fileName);
          // toDownloadFile = null;
        };
        nknClient.onSession(handleSession);
      };
      if (remoteAddr) {
        // 如果是链接模式
        receiveLink.value = window.location.href;
        initClientStatus.then(() => {
          handleReceiveFile("link", remoteAddr);
          // 开启nkn对 暂停/取消 的监听
          const handlePauseOrCancelMessage = (msgObj: TMessageType) => {
            console.log("接收 nknMessage 中对暂停的监听:", msgObj);
            const [status, uniqueId] = msgObj.payload.split("/");
            if (["pause", "cancel"].includes(status)) {
              const found = tableReceiveData.find(
                (i) => i.uniqueId === uniqueId
              );
              if (found) found.status = status as TransferFile["status"];
            }
          };
          nknClient?.onMessage(handlePauseOrCancelMessage);
          console.log("nknClient", nknClient?.eventListeners);
        });
      }
      const onReceiveConfirmCode = () => {
        if (!userStore.isLoggedIn) {
          message.warning("请登录再使用接收码功能");
          return;
        }
        if (!receiveInputCode.value.length) {
          message.warning("请输入接收码");
          return;
        }
        if (receiveInputLoading.value) {
          return;
        }
        if (!nknClient) {
          message.warning("请等待nkn节点就绪");
          return;
        }
        console.log("输入的接收码是:", receiveInputCode.value);
        const { socket } = userStore;
        if (!socket) return;
        receiveInputLoading.value = true;
        const receiveChannel = socket.channel(
          `airdrop:${receiveInputCode.value}`
        );
        receiveChannel.join();
        const addrMsg: ChannelMsgType = { addr: nknClient.addr };
        receiveChannel.push(CHANNEL_MSG.SHAKE_HAND, addrMsg);
        // 对方发送消息过来就确认接收码没问题, 否则是错误的接收码
        const [isCodeOkPromise, wrapper] = promiseChecker();
        const ref2 = receiveChannel.on(
          CHANNEL_MSG.CONFIRM_CODE,
          (data: ChannelMsgType) => {
            // console.log(data, "receiveCode is valid");
            handleReceiveFile("code");
            wrapper.isOk = true;
            receiveChannel.off(CHANNEL_MSG.CONFIRM_CODE, ref2);
            // receiveChannel.leave();
          }
        );
        // 监听取消
        const refCancel = receiveChannel.on(
          CHANNEL_MSG.CANCEL,
          ({ uniqueId }: { uniqueId: string }) => {
            console.log("接收 channel 中对取消的监听:", uniqueId);
            const found = tableReceiveData.find((i) => i.uniqueId === uniqueId);
            if (found) found.status = "cancel";
          }
        );
        // 监听暂停
        const refPause = receiveChannel.on(
          CHANNEL_MSG.PAUSE,
          ({ uniqueId }: { uniqueId: string }) => {
            console.log("接收 channel 中对暂停的监听:", uniqueId);
            const found = tableReceiveData.find((i) => i.uniqueId === uniqueId);
            if (found) found.status = "pause";
          }
        );
        // TODO clear 监听,防止内存泄漏
        isCodeOkPromise
          .then(() => {
            console.log("code is ok, receiving");
          })
          .catch(() => {
            console.log("code is wrong, cancel listen receive");
            receiveInputLoading.value = false;
            message.warning("接收码错误");
          });
      };
      return {
        columnsReceive,
        tableReceiveData,
        tableReceiveSelectedRows,
        tableReceiveSelectedRowKeys,
        onDownloadAllReceiveFiles,
        onClearTableReceiveData,
        onReceiveRecordDownload,
        onReceiveRecordCancel,
        isTypeLink,
        receiveLink,
        receiveInputCode,
        receiveInputLoading,
        onReceiveConfirmCode,
      };
    }

    return {
      ...useSend(),
      ...useReceive(),
      formatBytes,
      calcTimeLeftText,
    };
  },
});
</script>

<style lang="less" scoped>
.bg-address-bar {
  background-color: #f7f7f8;
}
.h-address-bar {
  height: 28px;
  line-height: 28px;
}
.receiveInputCode:focus {
  border-bottom: 1px solid blue;
  box-shadow: none;
}
</style>