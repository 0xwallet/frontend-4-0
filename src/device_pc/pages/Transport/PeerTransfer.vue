<template>
  <div
    :style="{
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
    <section class="p-4 pb-6 rounded-xl bg-white">
      <!-- 功能区 height 32px-->
      <div class="relative h-8 flex items-center mb-3">
        <a-tooltip title="添加文件">
          <!-- <XLink
            class="inline-block px-1 mr-2"
            :disabled="peerLink.length === 0 && peerCode.length === 0"
            @click="onResetStatus"
          >
            <LeftCircleOutlined />
          </XLink> -->
          <XLink @click="onSendAddFiles" :disabled="!isActionSend">
            <PlusSquareOutlined class="mr-2" />
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
            relative
          "
        >
          <!-- <XLink @click="onSendAddFiles">
            <PlusSquareOutlined class="mr-2" />
          </XLink> -->
          <span v-if="!peerLink" class="text-gray-400"> 拖拽添加文件 </span>
          <div
            class="
              absolute
              left-2
              inset-0
              z-50
              rounded-full
              flex
              items-center
              justify-between
              pr-2
            "
            :style="{
              border: '2px dashed transparent',
            }"
            :class="{
              dashedBorder: isFileOverUploadZone,
            }"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
          >
            <template v-if="peerLink">
              <a-popover title="空投链接二维码">
                <template #content>
                  <XQrCode :url="peerLink" :width="180" />
                </template>
                <XLink class="inline-block mr-2">
                  <QrcodeOutlined />
                </XLink>
              </a-popover>
              <XLink class="flex-1 truncate mr-2" @click="onCopyPeerLink">{{
                peerLink
              }}</XLink>
              <XLink class="inline-block" @click="onCopyPeerLink">
                <CopyOutlined />
              </XLink>
            </template>
          </div>
        </div>
        <div
          v-if="isUserLoggedIn"
          class="
            w-28
            text-center
            font-semibold
            h-address-bar
            rounded-full
            pl-2
            bg-address-bar
            flex
            items-center
            peerCodeWrap
            mr-2
          "
        >
          <div class="flex-1">
            <input
              maxlength="6"
              @keyup.enter="onReceiveConfirmPeerCode"
              v-model="peerCode"
              type="text"
              class="w-full bg-transparent peerCodeInput font-semibold"
              placeholder="六位空投码"
            />
          </div>
          <XLink v-if="peerLink" class="inline-block" @click="onCopyPeerCode">
            <CopyOutlined class="px-2" />
          </XLink>
          <XLink
            v-else
            :disabled="peerCode.length < 6"
            @click="onReceiveConfirmPeerCode"
          >
            <LoadingOutlined v-if="isCheckingPeerCode" class="px-2" />
            <RightCircleOutlined v-else class="px-2" />
          </XLink>
        </div>
        <!-- 发送端 显示添加文件剩余时间和 关闭按钮 -->
        <!-- <template v-if="isActionSend"> -->
        <div
          class="
            rounded-full
            h-address-bar
            bg-address-bar
            overflow-hidden
            flex
            items-center
            justify-between
          "
          :style="{
            transition: '.3s',
            'max-width': peerLink ? '200px' : '0px',
          }"
        >
          <a-tooltip title="倒计时过后或者传输过程中将不可以再修改文件">
            <span
              v-if="addFilesCountDownText"
              class="font-semibold ant-color-blue-6 ml-2"
              >{{ addFilesCountDownText }}</span
            >
          </a-tooltip>

          <XLink class="inline-block" @click="onResetStatus">
            <CloseCircleOutlined class="px-2" />
          </XLink>
        </div>
        <!-- </template> -->
        <!-- <a-tooltip :title="isBothConnected ? '双方已连接' : '双方未连接'">
          <XLink
            class="inline-block px-1 flex-center"
            @click="onClickConnectStatus"
          >
            <XSvgIcon
              class="text-gray-400"
              :class="{
                'ant-color-blue-6': isBothConnected,
              }"
              icon="swapLine"
              :size="16"
            />
          </XLink>
        </a-tooltip> -->
      </div>
      <!-- <div class="px-1 mb-3" v-if="addFilesCountDownText">
        <div>
          <InfoCircleFilled class="ant-color-blue-6" />
          <span class="text-gray-400 pl-2">
            添加文件剩余时间
            <span class="font-semibold ant-color-blue-6">{{
              addFilesCountDownText
            }}</span>
            , 倒计时过后或者传输过程中将不可以再修改文件
          </span>
        </div>
      </div> -->
      <XTableFiles
        rowKey="fileHash"
        :disableSelect="true"
        :columns="columns"
        :data="tableData"
      >
        <template #name="{ record }">
          <!-- <div>55----{{ record }}</div> -->
          <div :title="record.fileName" class="truncate">
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
              <template
                v-if="
                  [
                    'downloadUnstarted',
                    'downloading',
                    'successSend',
                    'successReceive',
                  ].includes(record.status)
                "
              >
                <span v-if="record.status === 'downloadUnstarted'"
                  >下载未开始</span
                >
                <span v-else-if="record.status === 'downloading'"
                  >下载进行中</span
                >
                <span v-else-if="record.status === 'successSend'"
                  >发送成功</span
                >
                <span v-else-if="record.status === 'successReceive'"
                  >接收成功</span
                >
              </template>
              <template v-else>
                <!-- 指示灯 -->
                <a-tooltip :title="calcRecordStatusTooltip(record)">
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
                <template v-if="record.status === 'queueing'">
                  <span>传输未开始</span>
                </template>
                <template v-else-if="record.status === 'calculating'">
                  <span>计算文件摘要中...</span>
                </template>
                <!-- send -->
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
                  <!-- <span>等待确认</span> -->
                  <span>传输完成</span>
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
                <!-- receive -->
                <template v-else-if="record.status === 'receiving'">
                  <span class="ant-color-blue-6">
                    <!-- {{ calcStatusText(record.status) }} -->
                    {{ formatBytes(record.speed) }}/S
                  </span>
                  <span v-if="record.speed > 0">
                    - {{ calcTimeLeftText(record) }}</span
                  >
                </template>
                <!-- <template v-else-if="record.status === 'successReceive'">
                  <span>下载成功</span>
                </template> -->
                <template v-else>
                  <span>其他状态</span>
                </template>
              </template>
            </div>
          </div>
        </template>
        <template #action="{ record }">
          <div class="flex items-center text-gray-600">
            <template v-if="isActionSend">
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
                v-if="['sending'].includes(record.status)"
                class="flex-1"
                @click="onSendRecordPause(record)"
              >
                <a-tooltip title="暂停">
                  <PauseOutlined />
                </a-tooltip>
              </XLink>
              <XLink class="flex-1" @click="onSendRecordCancel(record)">
                <a-tooltip title="取消">
                  <DeleteOutlined class="text-red-500" />
                </a-tooltip>
              </XLink>
            </template>
            <template v-else>
              <!-- <XLink
                class="flex-1"
                @click="onReceiveRecordDownload(record)"
                :disabled="record.status !== 'successReceive'"
              >
                <a-tooltip title="下载">
                  <DownloadOutlined />
                </a-tooltip>
              </XLink> -->
              <XLink
                v-if="['successReceive', 'failed'].includes(record.status)"
                class="flex-1"
                @click="onReceiveRecordCancel(record)"
              >
                <a-tooltip title="删除">
                  <DeleteOutlined class="text-red-500" />
                </a-tooltip>
              </XLink>
            </template>
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
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  XLink,
  XTableFiles,
  XFileTypeIcon,
  XSvgIcon,
  XQrCode,
} from "../../components";
import {
  LeftCircleOutlined,
  PlusSquareOutlined,
  LoadingOutlined,
  RightCircleOutlined,
  InfoCircleFilled,
  ThunderboltFilled,
  DownloadOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  PauseOutlined,
  CopyOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import {
  countDown,
  countDownSeconds,
  getFileDigest,
  getFileType,
  getRandomNumStr,
  getRepeatlyClientDialFn,
  mergeUint8Array,
  promiseChecker,
  readHeaderInSession,
  useDelay,
  writeHeaderInSession,
  formatBytes,
  downloadFileByBlob,
  calcPercent,
  cacheFn,
} from "@/utils";
import { classMultiClient, TMessageType, TSession } from "nkn";
import { getAnonymousMultiClient } from "@/apollo/nknConfig";
import { useTransportStore, useUserStore } from "@/store";
import { once, pick, remove, throttle } from "lodash-es";
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
import { decode, encode } from "@msgpack/msgpack";
import { MAX_MTU } from "@/constants";
import { useClipboard, useLocalStorage } from "@vueuse/core";
import dayjs from "dayjs";
import pLimit from "p-limit";
import { useRoute, useRouter } from "vue-router";
import Bowser from "bowser";
import streamSaver from "streamsaver";

type PeerFileItem = {
  file?: File;
  fileHash: string; // 用来双方校验文件完整性
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  speed: number;
  status:
    | "calculating" // 计算 hash 中
    | "queueing"
    | "sending"
    | "receiving"
    | "pause" // 暂停
    | "cancel" // 取消
    | "waiting" // 发送完后等待对方确认收到
    | "downloadUnstarted" // 下载未开始
    | "downloading" // 下载中
    | "downloadFinished" // 下载已完成
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
  HEART_BEAT: "heart_beat",
  DEVICE: "device",
  DOWNLOAD_UNSTART: "download_unstart",
  DOWNLOADING: "downloading",
  DOWNLOAD_FINISHED: "download_finished",
  FAKE_FILEHASH: "fake_filehash",
};
/**计算剩余时间 */
const calcTimeLeftText = (record: PeerFileItem) => {
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
/** 获取节点准备好的nkn client */
const getReadyAnonymousMultiClient = () => {
  return new Promise<classMultiClient>((resolve, reject) => {
    // 10s 2个节点, 不然就重置
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
/** 创建-确认信息 */
// const makeConfirmMessage = (fileHash: string) => `received-${fileHash}`;
/** 创建-开始下载信息 */
// const makeDownloadUnstartMessage = (fileHash: string) =>
//   `downloadUnstart-${fileHash}`;
// /** 创建-下载中信息 */
// const makeDownloadingMessage = (fileHash: string) => `downloading-${fileHash}`;
// /** 创建-下载完成信息 */
// const makeDownloadFinishedMessage = (fileHash: string) =>
//   `downloadFinished-${fileHash}`;
// /** 设置个 假的默认的fileHash 填充 */
// const makeFakeFileHash = (fileName: string, fileSize: number) =>
//   `${fileName}-${fileSize}`;
const makePrefixMsg = (prefix: string, content: string) =>
  `${prefix}-${content}`;
/** 创建设备信息 */
const makeDeviceInfo = () => {
  const { browser, os } = Bowser.parse(window.navigator.userAgent);
  return `${os.name} ${browser.name} Browser`;
};
/** 创建nkn的设备信息 */
const makeNknDeviceMsg = () => {
  return `${CHANNEL_MSG.DEVICE}+${makeDeviceInfo()}`;
};
/** 判断record传输状态 */
const isStatus = (sArr: PeerFileItem["status"][], record: PeerFileItem) => {
  return sArr.includes(record.status);
};
// const LIMIT_SIZE = 20 * 1024 * 1024;
const mbBytes = (mb: number) => mb * 1024 * 1024;
/** 计算文件分片的大小 */
const calcChunkSize = (totalSize: number) => {
  if (totalSize < mbBytes(50)) return mbBytes(5);
  if (totalSize < mbBytes(100)) return mbBytes(10);
  return mbBytes(20);
};
const cacheCalcChunkSize = (size: number) => {
  const cache: { [key: string]: number } = {};
  return cache[size] || (cache[size] = calcChunkSize(size));
};
export default defineComponent({
  components: {
    XLink,
    XTableFiles,
    XFileTypeIcon,
    XSvgIcon,
    XQrCode,
    //
    LeftCircleOutlined,
    PlusSquareOutlined,
    LoadingOutlined,
    RightCircleOutlined,
    InfoCircleFilled,
    ThunderboltFilled,
    DownloadOutlined,
    PauseOutlined,
    CloseOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    DeleteOutlined,
    QrcodeOutlined,
  },
  setup() {
    const { t } = useI18n();
    const userStore = useUserStore();
    const transportStore = useTransportStore();
    const [route, router] = [useRoute(), useRouter()];
    const isUserLoggedIn = computed(() => userStore.isLoggedIn);
    const columns = [
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
    const nknStatusCount = ref(0);
    let nknClient: classMultiClient;
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
    const removeNknClientMsgListener = (fn: (m: TMessageType) => void) => {
      remove(nknClient?.eventListeners?.message ?? [], (v) => v === fn);
    };
    /** 对方设备信息 */
    const remoteDeviceInfo = ref("");
    const calcRecordStatusTooltip = (record: PeerFileItem) => {
      if (
        isStatus(
          ["calculating", "queueing", "pause", "cancel", "failed"],
          record
        )
      ) {
        return "未连接";
      }
      // 剩下的状态是 sending receiving waiting successSend successReceive
      if (!isBothConnected.value) return "未连接";
      if (record.speed === 0) return "连接中";
      // 连接的话返回对方浏览器信息
      return remoteDeviceInfo.value;
    };
    const calcRecordStatusColor = (record: PeerFileItem) => {
      if (
        isStatus(
          ["calculating", "queueing", "pause", "cancel", "failed"],
          record
        )
      ) {
        return "#ff4d4f";
      }
      // 剩下的状态是 sending receiving waiting successSend successReceive
      if (!isBothConnected.value) return "#ff4d4f";
      if (record.speed === 0) return "#fadb14";
      // 连接的话返回对方浏览器信息
      return "#52c41a";
    };
    let currentReceiveRemoteAddr = "";
    const sendFileLimit = pLimit(2);
    // 同一时间 dial 同个地址会有bug , 这里得锁住1个 dial 并发
    const dialLimit = pLimit(1);
    // 存放 计算hash 的 promise 数组
    const calcHashPromiseArr: Promise<void[]>[] = [];
    /** 计算列表中每个文件的摘要 */
    const calcFileListDigest = (list: PeerFileItem[]) => {
      const task = Promise.all(
        list.map(async (i) => {
          if (!i.file) return;
          const { fileName, fileSize } = i;
          const fileHashStr = await getFileDigest(i.file);
          setTableItem(
            (v) => v.fileName === fileName && v.fileSize === fileSize,
            { fileHash: fileHashStr, status: "queueing" }
          );
          console.log(`${fileName}文件的摘要为:${fileHashStr}`);
        })
      ).finally(() => remove(calcHashPromiseArr, (v) => v === task));
      calcHashPromiseArr.push(task);
    };
    // 读取接收方的offset --start 10 秒后会超时
    const readOffsetFromMessage = (fileHash: string, waitTime = 10_000) => {
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
          const [msgFileHash, offset] = msgObj.payload.split("-");
          if (msgFileHash === fileHash) {
            console.log("收到接收方offset消息推送", offset);
            clearTimeout(timer);
            removeNknClientMsgListener(handleConfirmOffset);
            resolve(+offset);
            // console.timeEnd("[性能] 接收offset时间");
          }
        };
        nknClient?.onMessage(handleConfirmOffset);
      });
    };
    /** 设置表格项的进度/速度/状态 */
    // const setTableItemProgressSpeedStatus = (
    //   fileHash: string,
    //   progress: number,
    //   speed: number,
    //   status: PeerFileItem["status"]
    // ) => {
    //   // 防止push 的过程idx 变了, 所以得重新查找
    //   const idx = tableData.value.findIndex((i) => i.fileHash === fileHash);
    //   if (idx !== -1) {
    //     tableData.value[idx].progress = progress;
    //     tableData.value[idx].speed = speed;
    //     tableData.value[idx].status = status;
    //   }
    // };
    /** 设置表格里对象的数据 */
    const setTableItem = (
      fn: (item: PeerFileItem) => boolean,
      obj: Partial<PeerFileItem>
    ) => {
      const idx = tableData.value.findIndex(fn);
      if (idx !== -1) Object.assign(tableData.value[idx], obj);
    };
    /** 发送一个文件 */
    const onSendOneFile = async (remotAddr: string, item: PeerFileItem) => {
      if (!item.file) return;
      if (!nknClient) return;
      // console.log("准备dial-", remotAddr);
      const repeatlyDial = getRepeatlyClientDialFn(nknClient, remotAddr);
      const session = await dialLimit(() => repeatlyDial());
      if (!session) {
        message.warning("session 握手失败");
        console.log("session 握手失败");
        item.status = "failed";
        item.file = undefined; // 清空文件缓存 不允许再次操作
        return;
      }
      // console.log("session", session);
      item.status = "sending";
      const header: FileHeader = {
        fileName: item.file.name,
        fileSize: item.file.size,
        fileHash: item.fileHash,
        MIMEType: item.file.type,
      };
      await writeHeaderInSession(session, encode(header));
      // while fileSize MAX_MTU
      let startLen = await readOffsetFromMessage(item.fileHash);
      const startTime = dayjs();
      // 计算速度前的长度
      const beginCalcSpeedStartLen = startLen;
      let diffSeconds = 0;
      let toSetBytesPerSecond = 0;
      // const fileBuffer = await item.file.arrayBuffer();
      // const maxSendLength = fileBuffer.byteLength;
      const maxSendLength = item.file.size;
      const getItemCurSendStatus = () => item.status;
      while (startLen <= maxSendLength) {
        // console.log("getItemCurSendStatus", getItemCurSendStatus);
        // 检测取消状态
        if (getItemCurSendStatus() === "cancel") {
          await session.close();
          // 发送取消信息
          nknClient.send(remotAddr, `cancel/${item.fileHash}`);
        }
        // 检测暂停状态
        if (getItemCurSendStatus() === "pause") {
          await session.close();
          // 发送暂停信息
          nknClient.send(remotAddr, `pause/${item.fileHash}`);
        }

        if (session.isClosed) {
          console.error("session closed");
          return;
        }
        const toWriteBlob = await item.file
          .slice(startLen, Math.min(startLen + MAX_MTU, maxSendLength))
          .arrayBuffer();
        const toWriteChunk = new Uint8Array(toWriteBlob);
        await session.write(toWriteChunk);
        startLen += MAX_MTU;
        // 设置进度 start
        const toSetProgressVal = calcPercent(startLen, maxSendLength);
        if (toSetProgressVal < 100) {
          const curDiffSeconds = dayjs().diff(startTime, "second");
          if (curDiffSeconds > diffSeconds) {
            toSetBytesPerSecond =
              (startLen - beginCalcSpeedStartLen) /
              dayjs().diff(startTime, "second");
            diffSeconds = curDiffSeconds;
          }
          // 如果不是暂停/取消 状态,继续设置进度和发送状态
          if (!["pause", "cancel"].includes(getItemCurSendStatus())) {
            // setTableItemProgressSpeedStatus(
            //   item.fileHash,
            //   toSetProgressVal,
            //   toSetBytesPerSecond,
            //   "sending"
            // );
            setTableItem((v) => v.fileHash === item.fileHash, {
              progress: toSetProgressVal,
              speed: toSetBytesPerSecond,
              status: "sending",
            });
          }
        } else {
          // setTableItemProgressSpeedStatus(item.fileHash, 99, 0, "waiting");
          setTableItem((v) => v.fileHash === item.fileHash, {
            progress: 99,
            speed: 0,
            status: "waiting",
          });
          // session.close(); // 发送完后关闭这个session
        }
        // 设置进度 end
      }
      const downloadUnstartMessage = makePrefixMsg(
        CHANNEL_MSG.DOWNLOAD_UNSTART,
        item.fileHash
      );
      const handleDownloadUnstartMessage = (message: TMessageType) => {
        if (message.payload === downloadUnstartMessage) {
          console.log("收到下载未开始信息", message);
          // setTableItemProgressSpeedStatus(item.fileHash, 100, 0, "successSend");
          setTableItem((v) => v.fileHash === item.fileHash, {
            progress: 100,
            speed: 0,
            status: "downloadUnstarted",
          });
          // 写进历史
          // 清空文件节省内存
          item.file = undefined;
          removeNknClientMsgListener(handleDownloadUnstartMessage);
        }
      };
      nknClient.onMessage(handleDownloadUnstartMessage);
      const downloadingMessage = makePrefixMsg(
        CHANNEL_MSG.DOWNLOADING,
        item.fileHash
      );
      const handleDownloadingMessage = (message: TMessageType) => {
        if (message.payload === downloadingMessage) {
          console.log("收到下载进行中信息", message);
          // setTableItemProgressSpeedStatus(item.fileHash, 100, 0, "successSend");
          setTableItem((v) => v.fileHash === item.fileHash, {
            progress: 100,
            speed: 0,
            status: "downloading",
          });
          removeNknClientMsgListener(handleDownloadingMessage);
        }
      };
      nknClient.onMessage(handleDownloadUnstartMessage);
      const downloadFinishedMessage = makePrefixMsg(
        CHANNEL_MSG.DOWNLOAD_FINISHED,
        item.fileHash
      );
      const handleDownloadFinishedMessage = (message: TMessageType) => {
        if (message.payload === downloadFinishedMessage) {
          console.log("收到下载已经完成信息", message);
          // setTableItemProgressSpeedStatus(item.fileHash, 100, 0, "successSend");
          setTableItem((v) => v.fileHash === item.fileHash, {
            progress: 100,
            speed: 0,
            status: "successSend",
          });
          // 如果全部都发送完毕就清除状态
          if (tableData.value.every((i) => i.status === "successSend")) {
            onFinishedSendFilesClear();
          }
          if (userStore.isLoggedIn)
            transportStore.makePeerTransferSuccessItem(
              "send",
              item.fileName,
              item.fileSize
            );
          removeNknClientMsgListener(handleDownloadFinishedMessage);
        }
      };
      nknClient.onMessage(handleDownloadFinishedMessage);
      // handleConfirmMessage --start
      // const confirmMessage = makeConfirmMessage(item.fileHash);
      // /** 删除client 里的监听释放内存 */
      // const handleConfirmMessage = (message: TMessageType) => {
      //   if (message.payload === confirmMessage) {
      //     console.log("收到确认信息", message);
      //     // setTableItemProgressSpeedStatus(item.fileHash, 100, 0, "successSend");
      //     setTableItem((v) => v.fileHash === item.fileHash, {
      //       progress: 100,
      //       speed: 0,
      //       status: "successSend",
      //     });
      //     // 写进历史

      //     // 如果全部都发送完毕就清除状态
      //     if (tableData.value.every((i) => i.status === "successSend")) {
      //       onFinishedSendFilesClear();
      //     }
      //     if (userStore.isLoggedIn)
      //       transportStore.makePeerTransferSuccessItem(
      //         "send",
      //         item.fileName,
      //         item.fileSize
      //       );
      //     // 清空文件节省内存
      //     item.file = undefined;
      //     removeNknClientMsgListener(handleConfirmMessage);
      //   }
      // };
      // nknClient.onMessage(handleConfirmMessage);
      // handleConfirmMessage --end
    };
    let stopSendChannel: () => void;
    /** 清除发送端channel */
    const clearSendChannel = () => {
      if (stopSendChannel) {
        stopSendChannel();
      }
    };
    initClientStatus.then(() => {
      // console.log("clientReady", nknClient);
    });
    /** 发送完所有文件后重置发送端状态 */
    const onFinishedSendFilesClear = () => {
      // console.log("onFinishedSendFilesClear was called");
      clearSendChannel();
      stopAddFilesCoutDown();
      clearNknClientEvent();
      peerLink.value = "";
      peerCode.value = "";
      isBothConnected.value = false;
    };
    /** 发送完所有文件后重置接收端状态 */
    const onFinishedReceiveFilesClear = () => {
      // console.log("onFinishedReceiveFilesClear was called");
      clearReceiveChannel();
      clearNknClientEvent();
      peerLink.value = "";
      peerCode.value = "";
      isBothConnected.value = false;
    };

    const onMakeSendReady = async () => {
      console.log("onMakeSendReady");
      if (!nknClient) {
        message.warning("请等待 NKN 节点就绪");
        return;
      }
      const handleShakeHandMessage = async ({
        payload,
        src,
      }: {
        payload: string;
        src: string;
      }) => {
        // 注册 当前的接收端目标地址
        if (payload === CHANNEL_MSG.SHAKE_HAND) {
          currentReceiveRemoteAddr = src;
          isBothConnected.value = true;
          heartBeatController.listen();
          console.log("收到接收方发来的消息,即将发送文件", payload);
          if (calcHashPromiseArr.length) {
            const hide = message.loading("等待全部文件摘要计算完毕...", 0);
            await Promise.all(calcHashPromiseArr);
            hide();
          }
          stopAddFilesCoutDown();
          Promise.all(
            tableData.value.map((item) => {
              // console.log("handleShakeHandMessage", item, src);
              // 注册该文件的目标远程地址, 方便单文件操作-开始 的调用
              return sendFileLimit(() => onSendOneFile(src, item));
            })
          );
        }
      };
      nknClient.onMessage(handleShakeHandMessage);
      const handleDeviceMessage = async ({
        payload,
        src,
      }: {
        payload: string;
        src: string;
      }) => {
        // makeNknDeviceMsg
        const [msgPrefix, deviceInfo] = payload.split("+");
        if (msgPrefix === CHANNEL_MSG.DEVICE) {
          console.log("收到接收方设备信息:", deviceInfo);
          remoteDeviceInfo.value = deviceInfo;
          // removeNknClientMsgListener(handleDeviceMessage);
          return makeNknDeviceMsg();
        }
      };
      nknClient.onMessage(handleDeviceMessage);
      const transferUrl = location.href.match(/^.*peerTransfer/g)?.[0];
      const myAddr = nknClient.addr;
      peerLink.value = `${transferUrl}?addr=${myAddr}`;
      const { socket } = userStore;
      if (!socket) return;
      peerCode.value = getRandomNumStr(6);
      const sendChannel = socket.channel(`airdrop:${peerCode.value}`);
      sendChannel.join();
      const ref1 = sendChannel.on(
        CHANNEL_MSG.SHAKE_HAND,
        async (data: ChannelMsgType) => {
          console.log("channel-shakehand", data);
          // 确认空投码之后回一个地址信息
          sendChannel.push(CHANNEL_MSG.CONFIRM_CODE, {
            addr: myAddr,
          });
          await useDelay(1000);
          handleShakeHandMessage({
            payload: CHANNEL_MSG.SHAKE_HAND,
            src: data.addr,
          });
          // sendchannel 直到手动取消/文件完全发送完 才销毁
          // sendChannel.off(CHANNEL_MSG.SHAKE_HAND, ref1);
          // sendChannel.leave();
        }
      );
      stopSendChannel = () => {
        sendChannel.off(CHANNEL_MSG.SHAKE_HAND);
        sendChannel.leave();
      };
    };
    /** 是否是发送端 */
    const isActionSend = ref(true);
    /** 双方是否连接状态 */
    const isBothConnected = ref(false);
    const tableData = ref<PeerFileItem[]>([]);
    /** 空投链接 */
    const peerLink = ref("");
    /** 空投码 */
    const peerCode = ref("");
    const onCopyPeerLink = () => {
      if (peerLink.value) {
        useClipboard({ read: false })
          .copy(peerLink.value)
          .then(() => message.success(t("metanet.copySuccess")));
      }
    };
    const onCopyPeerCode = () => {
      if (peerCode.value) {
        useClipboard({ read: false })
          .copy(peerCode.value)
          .then(() => message.success(t("metanet.copySuccess")));
      }
    };
    /** 是否正在校验空投码 */
    const isCheckingPeerCode = ref(false);
    const addFilesCountDownText = ref("");
    let stopAddFilesCountDownTimer: () => void;
    const countDownAddFiles = () => {
      stopAddFilesCountDownTimer = countDownSeconds(
        5 * 60,
        "mm:ss",
        (v) => (addFilesCountDownText.value = v),
        () => (addFilesCountDownText.value = "")
      );
    };
    /** 停止添加文件计时 */
    const stopAddFilesCoutDown = () => {
      stopAddFilesCountDownTimer && stopAddFilesCountDownTimer();
      addFilesCountDownText.value = "";
    };
    /** 清除 nknclient 的监听 */
    const clearNknClientEvent = () => {
      nknClient.eventListeners.connect.length = 0;
      nknClient.eventListeners.message.length = 0;
      nknClient.eventListeners.session.length = 0;
      // 清除原来的session Map 修复二次发送读取buf错误的bug
      nknClient.sessions.clear();
    };
    // 如果是一开开页面有缓存,此时是接收端,然后删除了文件, 重置为发送状态
    watch(
      () => tableData.value,
      (newVal) => {
        if (newVal.length === 0 && !peerLink.value && !peerCode.value) {
          isActionSend.value = true;
        }
      },
      { deep: true }
    );
    /** 重置状态 */
    const onResetStatus = () => {
      // 判断是发送的重置还是接收的重置
      console.log("onResetStatus");
      if (!peerLink.value && !peerCode.value) {
        return;
      }
      // 1.如果是发送端
      if (isActionSend.value) {
        Modal.confirm({
          icon: createVNode(ExclamationCircleOutlined),
          title: "该空投支持断点续传, 请确认是否重置状态?",
          onOk: () => {
            return new Promise<void>((resolve) => {
              remoteAddr = "";
              clearSendChannel();
              stopAddFilesCoutDown();
              clearNknClientEvent();
              tableData.value.forEach((item) => (item.status = "cancel"));
              tableData.value.length = 0;
              peerLink.value = "";
              peerCode.value = "";
              isBothConnected.value = false;
              resolve();
            });
          },
        });
        // 2.如果是接收端
      } else {
        Modal.confirm({
          icon: createVNode(ExclamationCircleOutlined),
          title: "是否重置状态?",
          onOk: () => {
            return new Promise<void>((resolve) => {
              remoteAddr = "";
              clearReceiveChannel();
              clearNknClientEvent();
              // 全部设置取消状态
              tableData.value.forEach((item) => {
                item.status = "cancel";
              });
              // 全部删除 idb 缓存
              delMany(tableData.value.map((i) => i.fileHash)).then(() =>
                resolve()
              );
              tableData.value.length = 0;
              peerLink.value = "";
              peerCode.value = "";
              isBothConnected.value = false;
            });
          },
        });
      }
    };
    /** 点击状态 */
    const onClickConnectStatus = () => {
      console.log("onClickConnectStatus");
    };
    /** 判断是否能够添加文件 */
    const isCanAddFiles = () => {
      // 1.接收状态不可添加文件
      if (isActionSend.value === false) return false;
      // 2. 如果是第一次添加文件
      if (tableData.value.length === 0) {
        return true;
        // 3.如果在添加文件倒计时内
      } else if (addFilesCountDownText.value) {
        return true;
      } else {
        // 4.如果过了添加文件倒计时
        return false;
      }
    };
    // 拖拽 --start
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
        if (!isUserLoggedIn.value) {
          message.warning("请先登录再使用发送功能");
          router.push({
            name: "Login",
            query: {
              redirect: route.fullPath,
            },
          });
          return;
        }
        // 判断是否上一次完成的任务没有清除
        if (tableData.value.length && !peerLink.value) {
          tableData.value.length = 0;
        }
        isActionSend.value === true;
        if (isCanAddFiles() === false) {
          message.warning("已过调整文件时间,此时不能再调整文件");
          return;
        }
        if (!addFilesCountDownText.value) {
          stopAddFilesCoutDown();
          countDownAddFiles();
        }
        const files = event.dataTransfer?.files;
        if (!files) return;
        const fileArr: PeerFileItem[] = [...files].map((i) => ({
          file: i,
          fileName: i.name,
          fileSize: i.size,
          fileHash: makePrefixMsg(i.name, i.size.toString()),
          fileType: getFileType({ isDir: false, fileName: i.name }),
          progress: 0,
          speed: 0,
          // status: "queueing" as PeerFileItem["status"],
          status: "calculating" as PeerFileItem["status"],
        }));
        calcFileListDigest(fileArr);
        // 去掉已经加入的文件
        const noSameFileArr = fileArr.filter(
          (i) => !tableData.value.some((e) => e.fileHash === i.fileHash)
        );
        // 如果是第一次的添加文件, 直接生成link 和码
        if (tableData.value.length === 0 && peerCode.value.length === 0) {
          onMakeSendReady();
        }
        // tableData.value.push(...noSameFileArr);
        tableData.value = tableData.value.concat(noSameFileArr);
      };
      return {
        isFileOverUploadZone,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
      };
    }
    // 拖拽 --end
    // 表格项 action --start
    const onSendRecordStart = (record: PeerFileItem) => {
      console.log("onSendRecordStart");
      sendFileLimit(() => onSendOneFile(currentReceiveRemoteAddr, record));
    };
    /** 表格项-发送端-暂停 */
    const onSendRecordPause = (record: PeerFileItem) => {
      console.log("onSendRecordPause");
      if (isStatus(["queueing", "sending"], record)) {
        record.status = "pause";
        console.log("设置暂停后的record.status", record.status);
        // 这里设置为 pause ,发送那边会根据这个去关闭session
      }
    };
    /** 表格项-发送端-取消 */
    const onSendRecordCancel = (record: PeerFileItem) => {
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
              remove(tableData.value, (v) => v.fileHash === record.fileHash);
              if (tableData.value.length === 0) onFinishedSendFilesClear();
              resolve();
            });
          },
        });
      } else {
        // 2 直接取消
        remove(tableData.value, (v) => v.fileHash === record.fileHash);
        if (tableData.value.length === 0) onFinishedSendFilesClear();
      }
    };
    /** 表格项-接收端-下载 */
    const onReceiveRecordDownload = async (record: PeerFileItem) => {
      console.log("onReceiveRecordDownload");
      if (record.progress !== 100) {
        message.warning("文件未接收完整");
        return;
      }
      const { fileHash, fileName, fileSize } = record;
      const totalChunks = Math.ceil(fileSize / cacheCalcChunkSize(fileSize));
      const fileStream = streamSaver.createWriteStream(fileName, {
        size: fileSize, // (optional filesize) Will show progress
      });
      let startCounter = 1;
      const writer = fileStream.getWriter();
      while (startCounter <= totalChunks) {
        const buf = await get(`${totalChunks}*${startCounter++}*${fileHash}`);
        await writer.write(buf);
      }
      await writer.close();
      // const fileBuffer = await get(fileHash);
      // if (fileBuffer) {
      //   downloadFileByBlob(
      //     new File([fileBuffer], fileName, {
      //       type: record.file?.type,
      //     }),
      //     fileName
      //   );
      // }
    };
    /** 根据 fileHash 找出并删除 idb 中相关的文件 */
    const delIdbFilesByHash = async (fileHash: string) => {
      const idbAllKeys = (await keys()) as unknown as string[];
      const shouldDelKeys = idbAllKeys.filter((key) => key.includes(fileHash));
      await delMany(shouldDelKeys);
    };
    /** 表格项-接收端-取消 */
    const onReceiveRecordCancel = (record: PeerFileItem) => {
      console.log("onReceiveRecordCancel");
      if (
        isStatus(
          ["successReceive", "failed", "queueing", "cancel", "pause"],
          record
        )
      ) {
        const fileHash = record.fileHash;
        delIdbFilesByHash(fileHash);
        // del(fileHash).catch((e) => console.log(e));
        remove(tableData.value, (v) => v.fileHash === record.fileHash);
        if (tableData.value.length === 0) onFinishedReceiveFilesClear();
      }
    };
    // 表格项 action --end
    const onChangeMultipleUploadFile = async (e: Event) => {
      console.log("onChangeMultipleUploadFile");
      // 判断是否上一次完成的任务没有清除
      if (tableData.value.length && !peerLink.value) {
        tableData.value.length = 0;
      }
      if (!addFilesCountDownText.value) {
        stopAddFilesCoutDown();
        countDownAddFiles();
      }
      const input = e.target as HTMLInputElement;
      if (!input.files?.length) return;
      isActionSend.value = true;
      const fileArr: PeerFileItem[] = [...input.files].map((i) => ({
        file: i,
        fileHash: makePrefixMsg(i.name, i.size.toString()),
        fileName: i.name,
        fileSize: i.size,
        fileType: getFileType({ isDir: false, fileName: i.name }),
        progress: 0,
        speed: 0,
        status: "calculating" as PeerFileItem["status"], // 首次加入文件设置为等待中
      }));
      calcFileListDigest(fileArr);
      // console.log("fileArr", fileArr);
      // 去掉已经加入的文件
      const noSameFileArr = fileArr.filter(
        (i) => !tableData.value.some((e) => e.fileHash === i.fileHash)
      );
      // 如果是第一次的添加文件 如果还未生成 接收链接 和 接收码
      if (tableData.value.length === 0 && peerCode.value.length === 0) {
        onMakeSendReady();
      }
      tableData.value.push(...noSameFileArr);
      // 清空input 的缓存
      input.value = "";
    };
    const storegeReceiveData = useLocalStorage(
      "tableReceiveData",
      [] as unknown as Omit<
        PeerFileItem,
        "file" | "progress" | "speed" | "status"
      >[]
    );
    const getIdbItemLen = async (
      sameHashIdbKeyList: string[],
      fileSize: number
    ) => {
      let maxCounter = 0;
      let maxCounterName = "";
      for (const idbName of sameHashIdbKeyList) {
        const [total, counter] = idbName.split("*");
        if (+counter > maxCounter) {
          maxCounter = +counter;
          maxCounterName = idbName;
        }
      }
      const lastOneLen = (await get(maxCounterName)).length;
      return (maxCounter - 1) * cacheCalcChunkSize(fileSize) + lastOneLen;
    };
    // 如果有indexDB数据的文件缓存
    if (storegeReceiveData.value.length) {
      // 检测到有缓存, 切换成接收端模式
      keys()
        .then((keyList) => {
          const fileIdbNameList = keyList as unknown as string[];
          // console.log("fileIdbNameList", fileIdbNameList);
          const hasDataList = storegeReceiveData.value.filter((item) =>
            fileIdbNameList.some((e) => e.includes(item.fileHash))
          );
          console.log("hasDataList", hasDataList);
          if (hasDataList.length) {
            isActionSend.value = false;
            storegeReceiveData.value = hasDataList;
            Promise.all(
              storegeReceiveData.value.map<Promise<PeerFileItem>>(
                async (item) => {
                  const sameHashIdbKeyList = fileIdbNameList.filter((i) =>
                    i.includes(item.fileHash)
                  );
                  const totalIdbLen = await getIdbItemLen(
                    sameHashIdbKeyList,
                    item.fileSize
                  );
                  const progress = calcPercent(totalIdbLen, item.fileSize);
                  return {
                    ...item,
                    file: new File(["0"], item.fileName),
                    progress,
                    speed: 0,
                    status: progress === 100 ? "successReceive" : "queueing",
                  };
                }
              )
            ).then((list) => {
              tableData.value.push(...list);
              if (list.some((e) => e.progress < 100)) {
                message.info("检测到上次传输的文件缓存,您可以继续接收", 3);
              }
            });
          } else {
            // 没有 idb 缓存的话说明文件已经下载, 清空 localStorage
            storegeReceiveData.value.length = 0;
          }
        })
        .catch((e) => console.log("idb-keys()-err", e));
    }
    let globalHeartBeatSendTimer: number;
    let globalHeartBeatListenTimer: number;
    onUnmounted(() => {
      clearTimeout(globalHeartBeatSendTimer);
      clearTimeout(globalHeartBeatListenTimer);
    });
    const heartBeatController = {
      // 2s 间隔 timeout 10s
      send(remoteAddr: string) {
        console.log("启动心跳发送");
        // const reply = await nknClient.send(remoteAddr,CHANNEL_MSG.HEART_BEAT,{responseTimeout:10_000})
        let unReceiveCount = 1;
        globalHeartBeatSendTimer = window.setInterval(() => {
          nknClient
            .send(remoteAddr, CHANNEL_MSG.HEART_BEAT, {
              responseTimeout: 4_000,
            })
            .then((reply) => {
              console.log("收到心跳回复");
              isBothConnected.value = true;
            })
            .catch(() => {
              unReceiveCount++;
              if (unReceiveCount > 24) {
                console.log("心跳发送没有回应");
                // no heartBeat respoonse , remote offline
                isBothConnected.value = false;
                clearInterval(globalHeartBeatSendTimer);
                unReceiveCount = 0;
              }
            });
        }, 5_000);
      },
      listen() {
        console.log("启动心跳监听");
        const heartBeatHandler = (msgObj: TMessageType) => {
          if (msgObj.payload === CHANNEL_MSG.HEART_BEAT) {
            console.log("监听到 heartBeat");
            // 10s 后未更新视为断线
            isBothConnected.value = true;
            clearTimeout(globalHeartBeatListenTimer);
            globalHeartBeatListenTimer = window.setTimeout(() => {
              // 如果这里运行, 说明已经超时
              isBothConnected.value = false;
              // 如果此时有任务进行中
              if (tableData.value.some((i) => i.status === "sending")) {
                Modal.info({
                  // content: "对方似乎已断开, 下次打开相同链接或输入相同空投码可断点续传",
                  title: "对方似乎已断开",
                  content: "下次打开相同链接或输入相同空投码可断点续传",
                  onOk() {
                    console.log("ok");
                  },
                });
                // 把正在发送的设为取消状态
                tableData.value.forEach((item, idx) => {
                  if (item.status === "sending") {
                    item.status = "cancel";
                  }
                });
                // 清除旧的 session
                [...nknClient.sessions.values()].forEach((i) => i.close());
                useDelay(300).then(() => nknClient.sessions.clear());
              }
              // TODO 需要 remove 这个 handler 吗?
            }, 60_000 * 2);
            return CHANNEL_MSG.HEART_BEAT;
          }
        };
        nknClient.onMessage(heartBeatHandler);
      },
    };
    /** 发送端添加文件 */
    const onSendAddFiles = () => {
      if (!isUserLoggedIn.value) {
        message.warning("请先登录再使用发送功能");
        router.push({
          name: "Login",
          query: {
            redirect: route.fullPath,
          },
        });
        return;
      }
      // 判断是否上一次完成的任务没有清除
      if (tableData.value.length && !peerLink.value) {
        tableData.value.length = 0;
      }
      isActionSend.value === true;
      if (isCanAddFiles() === false) {
        message.warning("已过调整文件时间,此时不能再调整文件");
        return;
      }
      document.getElementById("transferFileInput")?.click();
    };
    // TODO check this
    let remoteAddr = route.query.addr as string;
    // 链接方式打开页面的提示
    let stopLinkConnectingMsg: null | (() => void);
    /** 接收端发送设备信息 */
    const receiveSendDeviceInfo = (addr: string) => {
      console.log("call-receiveSendDeviceInfo", makeNknDeviceMsg());
      nknClient.send(addr, makeNknDeviceMsg()).then((val) => {
        const sendSideDeviceMsg = val as unknown as string;
        const [msgPrefix, deviceInfo] = sendSideDeviceMsg.split("+");
        console.log("收到发送方设备信息:", deviceInfo);
        remoteDeviceInfo.value = deviceInfo;
      });
    };
    const handleReceiveFile = async (
      type: "link" | "code",
      remoteAddr?: string
    ) => {
      if (type === "link") await initClientStatus;
      // console.log("client-listen");
      // 发送回去消息,告诉接收方准备好了
      if (type === "link" && remoteAddr) {
        console.log("sendmsg-to-sendclient");
        await nknClient.send(remoteAddr, CHANNEL_MSG.SHAKE_HAND, {
          noReply: true,
        });
        // 发送 接收端的设备信息
        receiveSendDeviceInfo(remoteAddr);
      }
      // 必须要listen 才能onSession
      nknClient.listen();
      await useDelay(500);
      listenNknPauseOrCancel();
      // const session = await nknClient.dial(remoteAddr);
      // console.log("session---------", session);
      // 一个session 只用来发送一个文件
      const handleSession = async (session: TSession) => {
        console.log("handleSession was called");
        // 这里取消掉连接提示
        if (stopLinkConnectingMsg) {
          stopLinkConnectingMsg();
          stopLinkConnectingMsg = null;
        }
        isBothConnected.value = true;
        if (!nknClient) {
          console.log("handleSession-error-noNknClient", nknClient);
          return;
        }
        // 这里第二次读取会出错
        const headerUint8Array = await readHeaderInSession(session);
        const headerObj = decode(headerUint8Array) as FileHeader;
        console.log("读取文件头部信息", headerObj);
        const itemToPush: PeerFileItem = reactive({
          file: new File(["0"], headerObj.fileName, {
            type: headerObj.MIMEType,
          }),
          fileName: headerObj.fileName,
          fileSize: headerObj.fileSize,
          fileHash: headerObj.fileHash,
          fileType: getFileType({
            isDir: false,
            fileName: headerObj.fileName,
          }),
          progress: 0,
          speed: 0,
          status: "queueing",
        });
        // 如果列表中已经有了就替换, 否则就push
        const foundIdx = tableData.value.findIndex(
          (i) => i.fileHash === itemToPush.fileHash
        );
        if (foundIdx !== -1) {
          // 更新未缓存的进度
          itemToPush.progress = tableData.value[foundIdx].progress;
          tableData.value[foundIdx] = itemToPush;
        } else {
          tableData.value.push(itemToPush);
        }
        // 保存这次列表到 storage 中
        storegeReceiveData.value = tableData.value.map((item) =>
          pick(item, ["fileHash", "fileName", "fileSize", "fileType"])
        );
        // console.log(headerObj);
        const maxReceiveLength = headerObj.fileSize;
        const fileHash = headerObj.fileHash;
        let startLen = 0;
        // 如果有缓存, 取出上一次的长度
        const fileIdbNameList = (await keys()) as unknown as string[];
        const sameHashIdbKeyList = fileIdbNameList.filter((i) =>
          i.includes(itemToPush.fileHash)
        );
        if (sameHashIdbKeyList.length) {
          startLen = await getIdbItemLen(
            sameHashIdbKeyList,
            itemToPush.fileSize
          );
        }
        console.log("startLen", startLen);
        // 发送offset信息
        await nknClient.send(session.remoteAddr, `${fileHash}-${startLen}`);
        const dbLimit = pLimit(1);
        let bufBox = new Uint8Array(0);
        const chunkSize = cacheCalcChunkSize(maxReceiveLength);
        let totalChunks = Math.ceil(maxReceiveLength / chunkSize);
        // let chunkCounter = 1;
        let chunkCounter = Math.ceil(startLen / chunkSize) + 1; // 接着上次的counter
        const updateFileDb = async (buf: Uint8Array) => {
          bufBox = mergeUint8Array(bufBox, buf); // pass
          if (bufBox.length >= chunkSize) {
            // await update(fileHash, (val) => mergeUint8Array(val, bufBox));
            // bufBox = new Uint8Array(0);
            const temp = bufBox.slice(0, chunkSize);
            bufBox = bufBox.slice(chunkSize);
            // await update(fileHash, (val) => mergeUint8Array(val, temp));
            try {
              const toSetKey = `${totalChunks}*${chunkCounter++}*${fileHash}`;
              // console.log("toSetKey-temp", toSetKey, temp);
              await set(toSetKey, temp);
            } catch (error) {
              console.log("updateFileDb-err", error);
            }
            // bufBox = new Uint8Array(0);
            // bufBox = bufBox.slice(LIMIT_SIZE);
          }
        };
        // const cacheMergeRoundedBuf = async (r: Uint8Array) => {
        //   dbLimit(() => updateFileDb(r));
        // };
        const startTime = dayjs();
        // 计算速度前的长度
        const beginCalcSpeedStartLen = startLen;
        let diffSeconds = 0;
        let toSetBytesPerSecond = 0;
        /** 未读取正确长度的buffer */
        // const unFullyReadObj: { [key: string]: Uint8Array } = {
        // '0-100':new Uint8Array(0)
        // };
        // const errorReadLenPromiseArr = [];
        // const getItemCurReceiveStatus = () => itemToPush.status;
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
            dbLimit(() => updateFileDb(roundRead));
            startLen += roundRead.length;
            if (startLen > maxReceiveLength) {
              startLen = maxReceiveLength;
            }
          } catch (error) {
            // session 读取出错的时候先保存
            console.error("session-read-error,save file db first", error);
            // dbLimit(() => {
            //   if (bufBox.length) {
            //     return update(fileHash, (val) => mergeUint8Array(val, bufBox));
            //   }
            // });
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
          const toSetProgressVal = calcPercent(startLen, maxReceiveLength);
          // console.log("toSetProgressVal", toSetProgressVal);
          if (toSetProgressVal < 100) {
            const curDiffSeconds = dayjs().diff(startTime, "second");
            if (curDiffSeconds > diffSeconds) {
              toSetBytesPerSecond =
                (startLen - beginCalcSpeedStartLen) /
                dayjs().diff(startTime, "second");
              diffSeconds = curDiffSeconds;
            }
            // 如果不是暂停/取消 状态,继续设置进度和接收状态
            if (!["pause", "cancel"].includes(itemToPush.status)) {
              // setTableItemProgressSpeedStatus(
              //   fileHash,
              //   toSetProgressVal,
              //   toSetBytesPerSecond,
              //   "receiving"
              // );
              setTableItem((v) => v.fileHash === fileHash, {
                progress: toSetProgressVal,
                speed: toSetBytesPerSecond,
                status: "receiving",
              });
            }
          } else {
            await dbLimit(() => null);
            // setTableItemProgressSpeedStatus(fileHash, 100, 0, "successReceive");
            setTableItem((v) => v.fileHash === fileHash, {
              progress: 100,
              speed: 0,
              // status: "successReceive",
              status: "downloadUnstarted",
            });
            session.close(); // 接收完这个文件后关闭这个session
          }
        }
        // 这里要等待上一个dblimit tick
        await dbLimit(() => null);
        // 接收完毕 再检查一次有没有未合并的
        if (bufBox.length) {
          // console.log("还剩的buf", bufBox);
          console.time("last-update");
          // const beforeLastUpdate = await get(fileHash);
          await dbLimit(() =>
            // update(fileHash, (val) => mergeUint8Array(val, bufBox))
            set(`${totalChunks}*${chunkCounter++}*${fileHash}`, bufBox)
          );
          // const afterLastUpdate = await get(fileHash);
          console.timeEnd("last-update");
        }
        // 发送准备下载信息
        await nknClient.send(
          session.remoteAddr,
          makePrefixMsg(CHANNEL_MSG.DOWNLOAD_UNSTART, fileHash)
        );
        await useDelay(300);
        // 发送下载中信息
        await nknClient.send(
          session.remoteAddr,
          makePrefixMsg(CHANNEL_MSG.DOWNLOADING, fileHash)
        );
        setTableItem((v) => v.fileHash === fileHash, {
          progress: 100,
          speed: 0,
          // status: "successReceive",
          status: "downloading",
        });
        // 一个文件接收完成后, 下载这个文件, 然后删除idb缓存
        await onReceiveRecordDownload(itemToPush);
        if (userStore.isLoggedIn)
          transportStore.makePeerTransferSuccessItem(
            "receive",
            headerObj.fileName,
            headerObj.fileSize
          );
        await useDelay(1000);
        // 发送下载完成信息
        await nknClient.send(
          session.remoteAddr,
          makePrefixMsg(CHANNEL_MSG.DOWNLOAD_FINISHED, fileHash)
        );
        setTableItem((v) => v.fileHash === fileHash, {
          progress: 100,
          speed: 0,
          status: "successReceive",
        });
        // 如果全部都发送完毕就清除接收端状态
        if (tableData.value.every((i) => i.status === "successReceive")) {
          onFinishedReceiveFilesClear();
        }
        // .then(() => {
        //   delIdbFilesByHash(fileHash);
        // });
        delIdbFilesByHash(fileHash);
        // TODO 发回去校验hash
        // 发送-确认信息
        // await nknClient.send(session.remoteAddr, makeConfirmMessage(fileHash));
      };
      nknClient.onSession(handleSession);
    };
    const listenNknPauseOrCancel = () => {
      // 开启nkn对 暂停/取消 的监听
      const handlePauseOrCancelMessage = (msgObj: TMessageType) => {
        console.log("接收 nknMessage 中对暂停的监听:", msgObj);
        // TODO 发送端也发送fileHash
        const [status, fileHash] = msgObj.payload.split("/");
        if (["pause", "cancel"].includes(status)) {
          const found = tableData.value.find((i) => i.fileHash === fileHash);
          if (found) found.status = status as PeerFileItem["status"];
        }
      };
      nknClient?.onMessage(handlePauseOrCancelMessage);
    };
    if (remoteAddr) {
      // 如果是链接模式
      isActionSend.value = false;
      peerLink.value = window.location.href;
      stopLinkConnectingMsg = message.loading("正连接中", 0);
      initClientStatus.then(() => {
        heartBeatController.send(remoteAddr);
        handleReceiveFile("link", remoteAddr);
      });
    }
    let stopReceiveChannel: () => void;
    /** 清除接收端 channel */
    const clearReceiveChannel = () => {
      if (stopReceiveChannel) {
        stopReceiveChannel();
      }
    };
    const onReceiveConfirmPeerCode = () => {
      if (!userStore.isLoggedIn) {
        message.warning("请登录再使用接收码功能");
        return;
      }
      if (!nknClient) {
        message.warning("请等待 NKN 节点就绪");
        return;
      }
      if (peerCode.value.length < 6) {
        // message.warning("请输入6位空投码");
        return;
      }
      console.log("输入的接收码是:", peerCode.value);
      const { socket } = userStore;
      if (!socket) return;
      isCheckingPeerCode.value = true;
      const receiveChannel = socket.channel(`airdrop:${peerCode.value}`);
      receiveChannel.join();
      const addrMsg: ChannelMsgType = { addr: nknClient.addr };
      receiveChannel.push(CHANNEL_MSG.SHAKE_HAND, addrMsg);
      // 对方发送消息过来就确认接收码没问题, 否则是错误的接收码, timeOut 3s
      const [isCodeOkPromise, wrapper] = promiseChecker(3_000);
      const ref2 = receiveChannel.on(
        CHANNEL_MSG.CONFIRM_CODE,
        (data: ChannelMsgType) => {
          receiveSendDeviceInfo(data.addr);
          console.log("receiveChannel 收到的data", data);
          // console.log(data, "receiveCode is valid");
          heartBeatController.send(data.addr);
          handleReceiveFile("code");
          wrapper.isOk = true;
          receiveChannel.off(CHANNEL_MSG.CONFIRM_CODE, ref2);
          // receiveChannel.leave();
          stopReceiveChannel = () => receiveChannel.leave();
        }
      );
      isCodeOkPromise
        .then(() => {
          console.log("code is ok, receiving");
          // 切换成接收端模式
          isActionSend.value = false;
          isCheckingPeerCode.value = false;
          isBothConnected.value = true;
        })
        .catch(() => {
          console.log("code is wrong, cancel listen receive");
          isCheckingPeerCode.value = false;
          message.warning("接收码错误");
        });
    };
    return {
      columns,
      isUserLoggedIn,
      isBothConnected,
      isActionSend,
      isCheckingPeerCode,
      tableData,
      peerLink,
      peerCode,
      calcRecordStatusTooltip,
      calcRecordStatusColor,
      onCopyPeerLink,
      onCopyPeerCode,
      onResetStatus,
      onClickConnectStatus,
      addFilesCountDownText,
      ...useDropUpload(),
      onSendRecordStart,
      onSendRecordPause,
      onSendRecordCancel,
      onReceiveRecordDownload,
      onReceiveRecordCancel,
      onChangeMultipleUploadFile,
      onSendAddFiles,
      onReceiveConfirmPeerCode,
      //
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
.peerCodeWrap {
  border: 2px solid transparent;
  transition: 0.2s;
}
.peerCodeInput {
  &:focus {
    outline: none;
  }
}
.peerCodeWrap {
  &:focus-within {
    background-color: white;
    border-color: #1890ff;
  }
}
// 名称列的圆角
// :deep(.ant-table-thead > tr > th:nth-of-type(1)) {
//   border-radius: 10px 0 0 10px !important;
// }
// .ant-table-placeholder {
//   border-top: none;
// }
input::placeholder {
  font-weight: normal;
}
.dashedBorder {
  // border: 2px dashed #1890ff;
  border-color: #1890ff !important;
}
</style>