<template>
  <div
    :style="{
      background: '#F0F2F5',
      height: '100%',
    }"
  >
    <!-- border: '1px solid blue', -->
    <!-- 这个为隐藏的作为选择文件用的 -->
    <input
      multiple
      class="hidden"
      type="file"
      id="transferFileInput"
      @change="onChangeMultipleUploadFile"
    />
    <div v-if="isShowSendCard" class="send mb-4">
      <!-- 未选择任何文件前 -->
      <div v-if="tableSend.length === 0">
        <div class="font-20 p-4 font-semibold">发送</div>
        <div
          class="
            relative
            flex
            items-center
            justify-center
            pb-12
            h-32
            cursor-pointer
          "
          @click="onSelectFiles"
        >
          <!-- 拖拽区域 -->
          <a-tooltip title="可拖拽文件至此">
            <div
              class="absolute inset-0"
              @dragover="onDragOver"
              @drop="onDrop"
            ></div>
          </a-tooltip>
          <PlusOutlined
            class="p-6 ant-color-blue-6"
            :style="{
              'border-radius': '4px',
              border: '1px dashed #1890ff',
              'font-size': '50px',
            }"
          />
        </div>
      </div>
      <!-- 选有文件后 -->
      <div v-else-if="receiveLink.length === 0 && sendReceiveCode.length === 0">
        <div class="flex items-center p-4">
          <div class="mr-2 cursor-pointer" @click="onSelectFiles">
            <PlusOutlined
              class="ant-color-blue-6"
              :style="{
                'font-size': '30px',
              }"
            />
          </div>
          <div class="flex-1">
            <div class="font-semibold font-20 mb-1">添加文件</div>
            <!-- <div class="text-gray-400">Total 1 files - 50mb</div> -->
            <div class="text-gray-400 font-12">
              {{
                `总共 ${totalSendInfo.count}个文件  -  ${totalSendInfo.showSize}`
              }}
            </div>
          </div>
          <a
            href="javascript:;"
            class="block font-12 text-gray-400 self-end pr-1"
            @click="onResetSend"
          >
            重置
          </a>
        </div>
        <!-- 发送文件表格 -->
        <div class="px-4 mb-4">
          <div
            class="relative rounded"
            :style="{
              'background-color': '#fafafa',
              height: '206px',
              border: '1px solid rgba(0,0,0,.12)',
              overflow: 'hidden',
              'overflow-y': 'auto',
            }"
          >
            <div class="py-1">
              <div
                v-for="item in tableSend"
                :key="item.uniqueId"
                class="
                  tableSendItemBox
                  flex
                  items-center
                  justify-between
                  px-2
                  h-6
                  cursor-pointer
                  hover:bg-white
                "
              >
                <div class="font-12">
                  {{ item.fileName }}
                </div>
                <div class="tableSendItemSize font-12 text-gray-400">
                  {{ formatBytes(item.fileSize) }}
                </div>
                <div
                  class="
                    tableSendItemDelete
                    px-1
                    rounded
                    block
                    hidden
                    flex
                    items-center
                  "
                  @click="onDeleteSendItem(item.uniqueId)"
                >
                  <DeleteOutlined class="text-gray-400 font-12" />
                </div>
              </div>
            </div>
            <!-- <XTableFiles
              disableSelect
              rowKey="uniqueId"
              :showHeader="false"
              :columns="columnsSend"
              :data="tableSend"
            >
              <template #name="{ record }">
                <div class="flex items-center justify-between">
                  <div class="font-12">
                    {{ record.fileName }}
                  </div>
                  <div class="font-12 text-gray-400">
                    {{ formatBytes(record.fileSize) }}
                  </div>
                </div>
              </template>
            </XTableFiles> -->
          </div>
        </div>
        <!-- 选择方式 -->
        <div class="px-4 mb-4 flex items-center justify-between text-gray-400">
          <a
            @click="onSetCurrentSendType('link')"
            href="javascript:;"
            class="
              btnSendType
              cursor-pointer
              rounded
              flex-1
              py-2
              text-center
              mr-6
            "
            :class="{
              activeBtnSendType: currentSendType === 'link',
            }"
          >
            <LinkOutlined class="mr-1" />
            Link
          </a>
          <a
            @click="onSetCurrentSendType('direct')"
            href="javascript:;"
            class="btnSendType cursor-pointer rounded flex-1 py-2 text-center"
            :class="{
              activeBtnSendType: currentSendType === 'direct',
            }"
          >
            <SendOutlined class="mr-1" />
            Direct
          </a>
        </div>
        <!-- 发送按钮 -->
        <div class="px-4 pb-6">
          <a-button
            block
            size="large"
            type="primary"
            :loading="sendBtnLoading"
            @click="onClickSendBtn"
          >
            发送
          </a-button>
        </div>
      </div>
      <!-- 生成有link 链接后 -->
      <div
        v-else-if="receiveLink.length > 0 || sendReceiveCode.length > 0"
        class="pb-6"
      >
        <template v-if="totalSendProgess === 0 && receiveLink.length > 0">
          <!-- 传输前 -->
          <div class="p-4 flex items-start">
            <a
              href="javascript:;"
              class="block BackIcon mt-1 mr-2 rounded px-1 py-0"
              @click="onBackReceiveLink"
            >
              <ArrowLeftOutlined class="font-12" />
            </a>
            <div>
              <div class="font-20 font-semibold mb-1">等待中...</div>
              <div class="text-gray-400 font-12">
                复制以下链接发送给对方,过期时间
                <span :style="{ color: '#FF2D55' }">{{ countdownText }}</span>
              </div>
            </div>
          </div>
          <div class="px-4 pt-2 pb-6 break-all">
            <div class="text-center px-5">
              <span :title="receiveLink"
                >{{ receiveLink.slice(0, 50) }}...</span
              >
              <a-button class="mb-2" type="link" @click="onCopyReceiveLink"
                >复制</a-button
              >
              <div>
                <XQrCode :url="receiveLink" :width="120" />
              </div>
            </div>
          </div>
        </template>
        <template v-if="totalSendProgess === 0 && sendReceiveCode.length > 0">
          <!-- 传输前 -->
          <div class="p-4 flex items-start">
            <a
              href="javascript:;"
              class="block BackIcon mt-1 mr-2 rounded px-1 py-0"
              @click="onBackReceiveCode"
            >
              <ArrowLeftOutlined class="font-12" />
            </a>
            <div>
              <div class="font-20 font-semibold mb-1">等待中...</div>
              <div class="text-gray-400 font-12">
                复制接收码发送给对方,过期时间
                <span :style="{ color: '#FF2D55' }">{{ countdownText }}</span>
              </div>
            </div>
          </div>
          <div class="px-4 py-4 break-all">
            <div class="flex items-center justify-center mb-2">
              <div
                v-for="num in sendReceiveCode"
                :key="num"
                class="bg-gray-100 mr-2 px-2 py-2 text-3xl"
              >
                {{ num }}
              </div>
            </div>
            <div class="text-center">
              <a-button type="link" @click="onCopyReceiveCode">复制</a-button>
            </div>
          </div>
        </template>
        <template v-else-if="totalSendProgess > 0 && totalSendProgess < 100">
          <!-- 传输中 -->
          <div class="p-4 flex items-start">
            <div class="w-full">
              <div class="font-20 font-semibold mb-5">发送中...</div>
              <div class="flex-1 relative w-full mb-4">
                <div
                  class="absolute z-50 left-0 right-0 text-center text-white"
                  :style="{
                    color: isTotalSendProgressBarTextWhite
                      ? '#FFF '
                      : '#3C6889',
                    height: '30px',
                    'line-height': '30px',
                  }"
                >
                  <span id="totalProgressBarText">
                    总进度: {{ `${totalSendProgess}%` }}
                  </span>
                </div>
                <a-progress
                  class="peerTransferProgressBar"
                  :showInfo="false"
                  :percent="totalSendProgess"
                />
              </div>
              <div
                class="text-gray-400 font-12 flex items-center justify-between"
              >
                <div>总共{{ tableSend.length }}个文件</div>
                <div>
                  <span class="ant-color-blue-6 font-semibold">{{
                    formatBytes(hadSendSize)
                  }}</span>
                  <span> / </span>
                  <span>{{ formatBytes(totalSendSize) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="totalSendProgess === 100">
          <!-- 传输完成 -->
          <div class="p-4 pb-0 flex items-start">
            <div class="w-full">
              <div class="font-20 font-semibold mb-5">传输完成</div>
              <div class="text-gray-400 font-12 mb-4">
                {{
                  `总共 ${totalSendInfo.count}个文件  -  ${totalSendInfo.showSize}`
                }}
              </div>
              <div>
                <a-button size="large" type="primary" block @click="onSendOk"
                  >OK</a-button
                >
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 生成有接收码后 -->
      <!-- <div v-else-if="sendReceiveCode.length > 0">有接收码的界面</div> -->
    </div>
    <div class="receive relative">
      <!-- nkn 状态 -->
      <div
        v-if="!isUserLoggedIn"
        class="absolute"
        :style="{
          top: '22px',
          right: '20px',
        }"
      >
        <img
          class="inline-block"
          :src="require(`@/assets/images/wifi_${nknStatusCount}.png`)"
          :style="{
            width: '14px',
            height: '14px',
          }"
        />
      </div>
      <template v-if="tableReceive.length === 0">
        <div class="font-20 p-4 font-semibold">接收</div>
        <div class="px-4 pb-6">
          <a-input
            placeholder="输入接收码"
            :disabled="receiveInputLoading"
            v-model:value="receiveInputCode"
          >
            <template #suffix>
              <a href="javascript:;" @click="onClickReceive">
                <!-- TODO loading -->
                <LoadingOutlined v-if="receiveInputLoading" />
                <DownloadOutlined v-else />
              </a>
            </template>
          </a-input>
        </div>
      </template>
      <template v-else-if="totalReceiveProgress < 100">
        <div class="font-20 p-4 font-semibold">接收中...</div>
        <div class="flex-1 relative w-full mb-4 px-4">
          <div
            class="absolute z-50 left-0 right-0 text-center text-white"
            :style="{
              color: isTotalReceiveProgressBarTextWhite ? '#FFF ' : '#3C6889',
              height: '30px',
              'line-height': '30px',
            }"
          >
            <span id="totalProgressBarText">
              总进度: {{ `${totalReceiveProgress}%` }}
            </span>
          </div>
          <a-progress
            class="peerTransferProgressBar"
            :showInfo="false"
            :percent="totalReceiveProgress"
          />
        </div>
        <div
          class="
            text-gray-400
            font-12
            flex
            items-center
            justify-between
            pb-6
            px-4
          "
        >
          <div>总共{{ totalReceiveCount }}个文件</div>
          <div>
            <span class="ant-color-blue-6 font-semibold">{{
              formatBytes(hadReceiveSize)
            }}</span>
            <span> / </span>
            <span>{{ formatBytes(totalReceiveSize) }}</span>
          </div>
        </div>
      </template>
      <template v-else-if="totalReceiveProgress === 100">
        <div class="font-20 p-4 font-semibold mb-5">接收完成</div>
        <div class="px-4 text-gray-400 font-12 mb-4">
          {{
            `总共 ${totalReceiveCount}个文件  -  ${formatBytes(
              totalReceiveSize
            )}`
          }}
        </div>
        <div class="px-4 pb-6">
          <a-button size="large" type="primary" block @click="onReceiveOk"
            >OK</a-button
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  DownloadOutlined,
  LoadingOutlined,
  PlusOutlined,
  CloseOutlined,
  DeleteOutlined,
  SendOutlined,
  LinkOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { XFileTypeIcon, XTableFiles, XQrCode } from "../../components";
import {
  useDelay,
  downloadFileByBlob,
  formatBytes,
  getFileType,
  getRandomNumStr,
  getRepeatlyClientDialFn,
  mergeUint8Array,
  readHeaderInSession,
  writeHeaderInSession,
} from "@/utils";
import { remove } from "lodash-es";
import { useBaseStore, useTransportStore, useUserStore } from "@/store";
import { useClipboard } from "@vueuse/core";
import { Channel } from "phoenix";
import { useRoute } from "vue-router";
import { classMultiClient, TMessageType, TSession } from "nkn";
import { getAnonymousMultiClient } from "@/apollo/nknConfig";
import { decode, encode } from "@msgpack/msgpack";
import dayjs from "dayjs";
import { MAX_MTU } from "@/constants";
import pLimit from "p-limit";

type TransferFile = {
  file?: File;
  uniqueId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  speed: number;
  status:
    | "queueing"
    | "sending"
    | "receiving"
    | "waiting" // 发送完后等待对方确认收到
    | "successSend"
    | "successReceive"
    | "failed";
};
type FileHeader = {
  fileName: string;
  fileSize: number;
  MIMEType: string;
};
/** channel shakehand message type */
type ChannelMsgType = {
  addr: string;
};
/** 根据文件名/大小 生成唯一key */
const makeUniqueId = (name: string, size: number) => `${name}-${size}`;
/** 创建-确认信息 */
const makeConfirmMessage = (uniqueId: string) => `received-${uniqueId}`;
/** map 状态对应的文字 */
const calcStatusText = (status: TransferFile["status"]) => {
  const mapText: { [key in TransferFile["status"]]: string } = {
    queueing: "等待发送",
    sending: "发送中",
    receiving: "接收中",
    waiting: "等待确认",
    successSend: "发送成功",
    successReceive: "接收成功",
    failed: "发送失败",
  };
  return mapText[status];
};
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
        console.log("匿名client节点满足", client);
        resolve(client);
        clearInterval(id);
        // 超过10s 还未ready 的话就重置client
      } else if (counter >= 10) {
        counter = 0;
        client = getAnonymousMultiClient();
        console.log("重置匿名client", client);
      }
    }, 1000);
  });
};
/** nkn client握手消息 */
const SHAKE_HAND = "shake_hand";
const RECEIVE_PREFIX = "totalReceive";
/** 总大小信息格式 */
const totalInfoGuard = {
  _encode(totalSize: number, totalCount: number) {
    return `${RECEIVE_PREFIX}:${totalCount}-${totalSize}`;
  },
  _decode(str: string) {
    const a = str.split(":")[1];
    const [count, size] = a.split("-");
    return { count: +count, size: +size };
  },
};
type SendType = "direct" | "link";

export default defineComponent({
  components: {
    DownloadOutlined,
    LoadingOutlined,
    PlusOutlined,
    CloseOutlined,
    DeleteOutlined,
    SendOutlined,
    LinkOutlined,
    ArrowLeftOutlined,
    XFileTypeIcon,
    XTableFiles,
    XQrCode,
  },
  setup() {
    const userStore = useUserStore();
    const baseStore = useBaseStore();
    const transportStore = useTransportStore();
    const route = useRoute();
    let nknClient: null | classMultiClient = null;
    const nknStatusCount = ref(0);
    /** 统一的获取client 接口(区分登录/未登录) */
    const initMultiClient = async () => {
      if (nknClient) return nknClient;
      if (userStore.isLoggedIn) {
        nknClient = await userStore.getMultiClient();
      } else {
        nknClient = await getReadyAnonymousMultiClient();
      }
      return nknClient;
    };
    const initClientStatus = initMultiClient().then((client) => {
      nknStatusCount.value = client?.readyClientIDs().length ?? 0;
    });
    const isUserLoggedIn = computed(() => userStore.isLoggedIn);
    /** 发送文件 */
    function useSend() {
      const currentSendType = ref<SendType>("link");
      /** link 方式的url */
      const receiveLink = ref("");
      /** 生成的接收码 */
      const sendReceiveCode = ref("");
      const sendBtnLoading = ref(false);
      /** 倒计时 */
      const countdownText = ref("");
      const columnsSend = [
        {
          title: "name",
          slots: { customRender: "name" },
        },
      ];
      const tableSend = ref<TransferFile[]>([]);
      const totalSendInfo = computed(() => {
        const count = tableSend.value.length;
        if (count === 0) return { count, showSize: "0" };
        const totalSize = tableSend.value.reduce(
          (a, b) => (a += b.fileSize),
          0
        );
        const showSize = formatBytes(totalSize);
        return { count, showSize };
      });
      const totalSendProgessNoPercent = computed(() => {
        if (tableSend.value.length === 0) return 0;
        const list = tableSend.value;
        return (
          list.reduce((a, b) => (a += b.progress), 0) / (list.length * 100)
        );
      });
      /** 发送总进度 */
      const totalSendProgess = computed(() => {
        return Math.floor(totalSendProgessNoPercent.value * 100);
      });
      /** 要发文件总大小 */
      const totalSendSize = computed(() => {
        const list = tableSend.value;
        if (!list.length) return 0;
        return list.reduce((a, b) => (a += b.fileSize), 0);
      });
      /** 已发文件大小 */
      const hadSendSize = computed(() => {
        return totalSendSize.value * (+totalSendProgess.value / 100);
      });
      const isTotalSendProgressBarTextWhite = ref(false);
      // z总宽度-左右边距
      const totalSendProgressBarWidth = 268;
      watch(
        () => totalSendProgess.value,
        (newVal) => {
          const currentPercentWidth =
            totalSendProgressBarWidth * (newVal / 100);
          isTotalSendProgressBarTextWhite.value = currentPercentWidth > 168;
        }
      );
      const onDragOver = (event: DragEvent) => {
        event.preventDefault();
      };
      const onDrop = async (event: DragEvent) => {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (!files) return;
        const fileArr: TransferFile[] = [...files].map((i) => ({
          file: i,
          fileName: i.name,
          fileSize: i.size,
          uniqueId: makeUniqueId(i.name, i.size),
          fileType: getFileType({ isDir: false, fileName: i.name }),
          progress: 0,
          speed: 0,
          status: "queueing",
        }));
        // 去掉已经加入的文件
        const noSameFileArr = fileArr.filter(
          (i) => !tableSend.value.some((e) => e.uniqueId === i.uniqueId)
        );
        tableSend.value.push(...noSameFileArr);
      };
      const onCopyReceiveLink = () => {
        const text = receiveLink.value;
        useClipboard({ read: false })
          .copy(text)
          .then(() => message.success("复制成功"));
      };
      const onBackReceiveLink = () => {
        receiveLink.value = "";
        sendReceiveCode.value = "";
        resetClientListener.forEach((removeFn) => removeFn());
      };
      const onBackReceiveCode = () => {
        sendReceiveCode.value = "";
        receiveLink.value = "";
        resetClientListener.forEach((removeFn) => removeFn());
      };
      const onCopyReceiveCode = () => {
        const text = sendReceiveCode.value;
        useClipboard({ read: false })
          .copy(text)
          .then(() => message.success("复制成功"));
      };
      /** 选择完文件点确认后生成的6位码 */
      const sendCode = ref("");
      const onSelectFiles = () => {
        // 这个去触发 onChangeMultipleUploadFile
        document.getElementById("transferFileInput")?.click();
      };
      const onChangeMultipleUploadFile = (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        const fileArr: TransferFile[] = [...input.files].map((i) => ({
          file: i,
          fileName: i.name,
          fileSize: i.size,
          uniqueId: makeUniqueId(i.name, i.size),
          fileType: getFileType({ isDir: false, fileName: i.name }),
          progress: 0,
          speed: 0,
          status: "queueing",
        }));
        // 去掉已经加入的文件
        const noSameFileArr = fileArr.filter(
          (i) => !tableSend.value.some((e) => e.uniqueId === i.uniqueId)
        );
        tableSend.value.push(...noSameFileArr);
        // 清空input 的缓存
        input.value = "";
      };
      /** 发送成功的ok点击 */
      const onSendOk = () => {
        onResetSend();
      };
      /** 重置 */
      const onResetSend = () => {
        console.log("click-onResetSend");
        // TODO如果正在发送中,提示是否取消发送
        tableSend.value.length = 0;
        currentSendType.value = "link";
        receiveLink.value = "";
        sendReceiveCode.value = "";
        resetClientListener.forEach((removeFn) => removeFn());
        resetClientListener.length = 0;
        // 再清空下message 的listener数组
        if (nknClient) nknClient.eventListeners.message.length = 0;
        const elInput = document.getElementById(
          "transferFileInput"
        ) as HTMLInputElement;
        if (elInput) elInput.value = "";
      };
      const onDeleteSendItem = (uniqueId: string) => {
        remove(tableSend.value, (v) => v.uniqueId === uniqueId);
      };
      const onSetCurrentSendType = (type: SendType) => {
        if (type === "direct" && !userStore.isLoggedIn) {
          baseStore.changeIsShowLoginModal(true);
          return;
        }
        currentSendType.value = type;
      };
      const resetClientListener: (() => void)[] = [];
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
          MIMEType: item.file.type,
        };
        const uniqueId = makeUniqueId(item.file.name, item.file.size);
        await writeHeaderInSession(session, encode(header));
        // while fileSize MAX_MTU
        let startLen = 0;
        const startTime = dayjs();
        let diffSeconds = 0;
        let toSetBytesPerSecond = 0;
        const fileBuffer = await item.file.arrayBuffer();
        // console.log("fileBuffer", fileBuffer);
        const maxSendLength = fileBuffer.byteLength;
        const setItemProgressSpeedStatus = (
          progress: number,
          speed: number,
          status: TransferFile["status"]
        ) => {
          item.progress = progress;
          item.speed = speed;
          item.status = status;
        };
        while (startLen <= maxSendLength) {
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
            setItemProgressSpeedStatus(
              toSetProgressVal,
              toSetBytesPerSecond,
              "sending"
            );
          } else {
            setItemProgressSpeedStatus(98, 0, "waiting");
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
            if (nknClient) {
              remove(
                nknClient.eventListeners.message,
                (v) => v === confirmMessage
              );
            }
          }
        };
        nknClient.onMessage(handleConfirmMessage);
      };
      const onClickSendBtn = async () => {
        if (!nknClient) {
          message.warning("请等待nkn节点就绪");
          return;
        }
        let lock = false;
        sendBtnLoading.value = true;
        await useDelay(300);
        sendBtnLoading.value = false;
        const limit = pLimit(2);
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
          console.log("payload---", payload, src);
          if (lock) {
            // 因为没有off 方法, 这里设置了防止重复接收message , 只能用一次
            return;
          }
          if (payload === SHAKE_HAND) {
            clearInterval(timerCountdown);
            console.log("收到接收方发来的消息,即将发送文件总大小消息", payload);
            await nknClient?.send(
              src,
              totalInfoGuard._encode(
                totalSendSize.value,
                tableSend.value.length
              ),
              {
                noReply: true,
              }
            );
            lock = true;
            Promise.all(
              tableSend.value.map((item) => {
                limit(() => onSendOneFile(src, item));
              })
            ).finally(() => {
              remove(
                nknClient?.eventListeners.message ?? [],
                (v) => v === handleShakeHandMessage
              );
            });
          }
        };
        nknClient.onMessage(handleShakeHandMessage);
        resetClientListener.push(() => {
          if (nknClient) {
            remove(
              nknClient.eventListeners.message,
              (v) => v === handleShakeHandMessage
            );
          }
        });
        //
        if (currentSendType.value === "link") {
          const transferUrl = location.href.match(/^.*peerTransfer/g)?.[0];
          const myAddr = nknClient.addr;
          receiveLink.value = `${transferUrl}?addr=${myAddr}`;
        } else {
          const { socket } = userStore;
          if (!socket) return;
          sendReceiveCode.value = getRandomNumStr(6);
          const sendChannel = socket.channel(
            `airdrop:${sendReceiveCode.value}`
          );
          sendChannel.join();
          const ref1 = sendChannel.on(SHAKE_HAND, (data: ChannelMsgType) => {
            console.log("channel-shakehand", data);
            handleShakeHandMessage({
              payload: SHAKE_HAND,
              src: data.addr,
            });
            sendChannel.off(SHAKE_HAND, ref1);
            sendChannel.leave();
          });
        }
      };
      return {
        currentSendType,
        receiveLink,
        sendReceiveCode,
        countdownText,
        sendBtnLoading,
        columnsSend,
        tableSend,
        totalSendInfo,
        sendCode,
        totalSendProgess,
        totalSendSize,
        hadSendSize,
        isTotalSendProgressBarTextWhite,
        onDragOver,
        onDrop,
        onCopyReceiveLink,
        onBackReceiveLink,
        onBackReceiveCode,
        onCopyReceiveCode,
        onSelectFiles,
        onChangeMultipleUploadFile,
        onSendOk,
        onResetSend,
        onDeleteSendItem,
        onSetCurrentSendType,
        onClickSendBtn,
      };
    }
    /** 接收文件 */
    function useReceive() {
      const tableReceive = ref<TransferFile[]>([]);
      const receiveInputLoading = ref(false);
      const receiveInputCode = ref("");
      const isShowSendCard = ref(true);
      const onClickReceive = () => {
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
        receiveChannel.push(SHAKE_HAND, addrMsg);
        useDelay(10_000).then(() => receiveChannel.leave());
        handleReceiveFile("code");
      };
      /** 接收总大小 */
      const totalReceiveSize = ref(0);
      /** 接收总多少个文件 */
      const totalReceiveCount = ref(0);
      /** 接收总进度 */
      const totalReceiveProgressNoPercent = computed(() => {
        const list = tableReceive.value;
        if (!list.length) return 0;
        return (
          list.reduce((a, b) => (a += b.progress), 0) /
          (totalReceiveCount.value * 100)
        );
      });
      const totalReceiveProgress = computed(() => {
        return Math.floor(totalReceiveProgressNoPercent.value * 100);
      });

      /** 总共接收了多少数据 */
      const hadReceiveSize = computed(() => {
        return totalReceiveSize.value * totalReceiveProgressNoPercent.value;
      });
      const isTotalReceiveProgressBarTextWhite = ref(false);
      // z总宽度-左右边距
      const totalReceiveProgressBarWidth = 268;
      watch(
        () => totalReceiveProgress.value,
        (newVal) => {
          const currentPercentWidth =
            totalReceiveProgressBarWidth * (newVal / 100);
          isTotalReceiveProgressBarTextWhite.value = currentPercentWidth > 168;
        }
      );
      const onReceiveOk = () => {
        tableReceive.value.length = 0;
        totalReceiveSize.value = 0;
        totalReceiveCount.value = 0;
        receiveInputLoading.value = false;
        receiveInputCode.value = "";
        // 再清空下session监听的数组
        if (nknClient) nknClient.eventListeners.session.length = 0;
      };
      // 如果当前是未登录的, 自动nkn  ?
      // 未登录状态 -start
      const handleReceiveFile = async (
        type: "link" | "code",
        remoteAddr?: string
      ) => {
        receiveInputLoading.value = true;
        if (type === "link") await initClientStatus;
        if (!nknClient) return;
        // 必须要listen 才能onSession
        nknClient.listen();
        console.log("client-listen");
        // 发送回去消息,告诉接收方准备好了
        if (type === "link" && remoteAddr) {
          await nknClient.send(remoteAddr, SHAKE_HAND, { noReply: true });
        }
        const handleFileTotalMsg = (msgObj: TMessageType) => {
          if (msgObj.payload.includes(RECEIVE_PREFIX)) {
            const { count, size } = totalInfoGuard._decode(msgObj.payload);
            totalReceiveSize.value = size;
            totalReceiveCount.value = count;
            console.log(`收到文件总量信息:总共${count}个文件,${size}`);
            if (nknClient) {
              remove(
                nknClient.eventListeners.message,
                (v) => v === handleFileTotalMsg
              );
            }
          }
        };
        nknClient.onMessage(handleFileTotalMsg);
        await useDelay(500);
        // const session = await nknClient.dial(remoteAddr);
        // console.log("session---------", session);
        // 一个session 只用来发送一个文件
        const handleSession = async (session: TSession) => {
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
            uniqueId,
            fileType: getFileType({
              isDir: false,
              fileName: headerObj.fileName,
            }),
            progress: 0,
            speed: 0,
            status: "queueing",
          });
          tableReceive.value.push(itemToPush);
          // console.log(headerObj);
          const maxReceiveLength = headerObj.fileSize;
          let fileBuffer = new Uint8Array(0);
          let startLen = 0;
          const startTime = dayjs();
          let diffSeconds = 0;
          let toSetBytesPerSecond = 0;
          while (startLen <= maxReceiveLength) {
            if (session.isClosed) {
              console.error("session closed");
              return;
            }
            const toReadLength =
              startLen < maxReceiveLength
                ? MAX_MTU
                : startLen - maxReceiveLength;
            const roundRead = await session.read(toReadLength);
            fileBuffer = mergeUint8Array(fileBuffer, roundRead);
            // console.log(
            //   "已经写入的array-正在接收的chunk长度",
            //   fileBuffer,
            //   roundRead
            // );
            startLen += MAX_MTU;
            // 设置进度 start
            const setItemProgressSpeedStatus = (
              progress: number,
              speed: number,
              status: TransferFile["status"]
            ) => {
              // 防止push 的过程idx 变了, 所以得重新查找
              const idx = tableReceive.value.findIndex(
                (i) => i.uniqueId === uniqueId
              );
              if (idx !== -1) {
                tableReceive.value[idx].progress = progress;
                tableReceive.value[idx].speed = speed;
                tableReceive.value[idx].status = status;
              }
            };
            const toSetProgressVal = Math.floor(
              (startLen / maxReceiveLength) * 100
            );
            if (toSetProgressVal < 100) {
              const curDiffSeconds = dayjs().diff(startTime, "second");
              if (curDiffSeconds > diffSeconds) {
                toSetBytesPerSecond =
                  startLen / dayjs().diff(startTime, "second");
                diffSeconds = curDiffSeconds;
              }
              setItemProgressSpeedStatus(
                toSetProgressVal,
                toSetBytesPerSecond,
                "receiving"
              );
            } else {
              setItemProgressSpeedStatus(100, 0, "successReceive");
              if (userStore.isLoggedIn)
                transportStore.makePeerTransferSuccessItem(
                  "receive",
                  headerObj.fileName,
                  headerObj.fileSize
                );
            }
          }
          // 发送-确认信息
          await nknClient.send(
            session.remoteAddr,
            makeConfirmMessage(uniqueId),
            {
              noReply: true,
            }
          );
          receiveInputLoading.value = false;
          toDownloadFile = new File([fileBuffer], headerObj.fileName, {
            type: headerObj.MIMEType,
          });
          downloadFileByBlob(toDownloadFile, headerObj.fileName);
          toDownloadFile = null;
          remove(nknClient.eventListeners.session, (v) => v === handleSession);
        };
        nknClient.onSession(handleSession);
        // client.onMessage((message) => {
        //   console.log("message", message);
        // });
      };
      const remoteAddr = route.query.addr as string;
      if (remoteAddr) {
        console.log("检测到路由有link, 开始监听文件接收");
        // link 模式不显示发送卡
        isShowSendCard.value = false;
        const hideLoadingMsg = message.loading("连接nkn网络中...", 0);
        initClientStatus.then(() => {
          hideLoadingMsg();
          message.success("连接nkn网络成功");
        });
        handleReceiveFile("link", remoteAddr);
      }
      return {
        tableReceive,
        receiveInputLoading,
        receiveInputCode,
        isShowSendCard,
        onClickReceive,
        totalReceiveCount,
        totalReceiveSize,
        totalReceiveProgress,
        hadReceiveSize,
        onReceiveOk,
        isTotalReceiveProgressBarTextWhite,
      };
    }
    return {
      isUserLoggedIn,
      nknStatusCount,
      ...useSend(),
      ...useReceive(),
      calcStatusText,
      formatBytes,
    };
  },
});
</script>

<style lang="less" scoped>
.send,
.receive {
  width: 300px;
  border-radius: 4px;
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.08),
    0 44px 32px 0 rgba(0, 0, 0, 0.25);
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}
::-webkit-scrollbar {
  width: 6px;
  height: 166px;
}
/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track {
  display: none;
}
/*定义滑块
 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.2);
}
.BackIcon {
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
.btnSendType {
  &:hover {
    background: #fafafa;
  }
}
.activeBtnSendType {
  color: #1890ff;
  background: #fafafa;
}
.tableSendItemDelete {
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
.tableSendItemBox {
  &:hover {
    .tableSendItemSize {
      display: none;
      color: blue;
    }
    .tableSendItemDelete {
      display: block;
    }
  }
}
.peerTransferProgressBar {
  :deep(.ant-progress-inner) {
    height: 30px;
    line-height: 30px;
  }
  :deep(.ant-progress-bg) {
    height: 30px !important;
    line-height: 30px !important;
  }
}
</style>