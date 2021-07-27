<template>
  <div class="pb-4">
    <input
      multiple
      class="hidden"
      type="file"
      id="sendFile"
      @change="onInputFileChange"
    />
    <div class="h-full">
      <div
        :style="{
          'background-color': '#e6f7ff',
          'border-radius': '2px',
          border: '1px solid #91d5ff',
          'font-size': '12px',
        }"
        class="mb-2 py-1 px-3 ant-alert-info flex items-center"
      >
        <InfoCircleOutlined class="ant-color-blue-6 mr-1" />
        适用于大文件传输场景
      </div>
      <a-row class="mb-2" type="flex">
        <a-radio-group v-model:value="actionType">
          <a-radio value="send">发送文件</a-radio>
          <a-radio value="receive">接收文件</a-radio>
        </a-radio-group>
      </a-row>
      <a-row class="mb-2" type="flex" align="middle">
        <a-input disabled addon-before="您的地址" v-model:value="localAddr">
          <template #addonAfter>
            <a href="javascript:;" @click="onCopyMyAddr">复制</a>
          </template>
        </a-input>
      </a-row>
      <a-row v-show="actionType === 'send'" class="mb-2" type="flex">
        <a-input addon-before="对方地址" v-model:value="remotAddr">
          <!-- <template #addonAfter>
            <a href="javascript:;" @click="onCopyMyAddr">复制</a>
          </template> -->
        </a-input>
      </a-row>
      <div
        :style="{
          border: '1px solid #d9d9d9',
          'border-radius': '2px',
        }"
      >
        <div
          :style="{
            padding: '0 11px',
            height: '32px',
            'line-height': '32px',
            'background-color': '#fafafa',
            'border-bottom': '1px solid #d9d9d9',
          }"
        >
          {{ actionType === "send" ? "发送文件列表" : "接收文件列表" }}
          <a-button
            v-if="actionType === 'send'"
            class="ml-2"
            size="small"
            type="primary"
            @click="onSelectFile"
            >选择文件</a-button
          >
          <!-- <a-button
            v-if="actionType === 'send'"
            class="ml-2"
            size="small"
            type="danger"
            @click="onTestShakeHand"
            >握手测试</a-button
          > -->
          <a-button
            :disabled="tableDataOfSend.length === 0"
            :loading="loadingOfSend"
            v-if="actionType === 'send'"
            class="ml-2"
            size="small"
            type="primary"
            @click="onSendFileList"
            >开始发送</a-button
          >
        </div>
        <!-- 表格 发送文件列表 -->
        <TableFiles
          v-show="actionType === 'send'"
          disableSelect
          rowKey="uniqueId"
          :showHeader="false"
          :columns="columns"
          :data="tableDataOfSend"
        >
          <template #name="{ record }">
            <!-- <div>55----{{ record }}</div> -->
            <div :title="record.fileName">
              <XFileTypeIcon class="w-6 h-6 mr-2" :type="record.fileType" />
              <span>{{ record.fileName }}</span>
            </div>
          </template>
          <template #fileInfo="{ record }">
            <div class="text-gray-400">
              {{ formatBytes(record.fileSize) }}
            </div>
          </template>
          <template #speed="{ record }">
            <div class="text-gray-400">
              {{ `${formatBytes(record.speed)} / s` }}
            </div>
          </template>
          <template #uploadProgressBar="{ record }">
            <a-progress
              :percent="record.progress"
              :showInfo="false"
            ></a-progress>
          </template>
          <template #statusText="{ record }">
            <div class="text-gray-400">
              {{ calcStatusText(record.status) }}
            </div>
          </template>
          <template #action="{ record }">
            <a
              v-if="
                !['sending', 'receiving', 'waiting'].includes(record.status)
              "
              href="javascript:;"
              @click="onRecordSendClear(record)"
            >
              <CloseOutlined />
            </a>
          </template>
        </TableFiles>
        <!-- 表格 接收文件列表 -->
        <TableFiles
          v-show="actionType === 'receive'"
          disableSelect
          rowKey="uniqueId"
          :showHeader="false"
          :columns="columns"
          :data="tableDataOfReceive"
        >
          <template #name="{ record }">
            <!-- <div>55----{{ record }}</div> -->
            <div :title="record.fileName">
              <XFileTypeIcon class="w-6 h-6 mr-2" :type="record.fileType" />
              <span>{{ record.fileName }}</span>
            </div>
          </template>
          <template #fileInfo="{ record }">
            <div class="text-gray-400">
              {{ formatBytes(record.fileSize) }}
            </div>
          </template>
          <template #speed="{ record }">
            <div class="text-gray-400">
              {{ `${formatBytes(record.speed)} / s` }}
            </div>
          </template>
          <template #uploadProgressBar="{ record }">
            <a-progress
              :percent="record.progress"
              :showInfo="false"
            ></a-progress>
          </template>
          <template #statusText="{ record }">
            <div class="text-gray-400">
              {{ calcStatusText(record.status) }}
            </div>
          </template>
          <template #action="{ record }">
            <a
              v-if="
                !['sending', 'receiving', 'waiting'].includes(record.status)
              "
              href="javascript:;"
              @click="onRecordReceiveClear(record)"
            >
              <CloseOutlined />
            </a>
          </template>
        </TableFiles>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useUserStore } from "@/store";
import { useClipboard } from "@vueuse/core";
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { InfoCircleOutlined, CloseOutlined } from "@ant-design/icons-vue";
import XFileTypeIcon from "@/components/XFileTypeIcon.vue";
import TableFiles from "../components/TableFiles.vue";
import {
  getFileType,
  formatBytes,
  getRepeatlyClientDialFn,
  writeHeaderInSession,
  readHeaderInSession,
  mergeUint8Array,
  downloadFileByBlob,
} from "@/utils";
import { classMultiClient, TMessageType, TSession } from "nkn";
import { decode, encode } from "@msgpack/msgpack";
import dayjs from "dayjs";
import { MAX_MTU } from "@/constants";
import pLimit from "p-limit";
import { remove, uniqueId } from "lodash-es";
type ActionType = "send" | "receive";
type FileItem = {
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
/** 根据文件名/大小 生成唯一key */
const makeUniqueId = (name: string, size: number) => `${name}-${size}`;
/** 创建-确认信息 */
const makeConfirmMessage = (uniqueId: string) => `received-${uniqueId}`;
/** map 状态对应的文字 */
const calcStatusText = (status: FileItem["status"]) => {
  const mapText: { [key in FileItem["status"]]: string } = {
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
const columns = [
  {
    title: "name",
    slots: { customRender: "name" },
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
    title: "action",
    slots: { customRender: "action" },
    width: 50,
  },
];

export default defineComponent({
  components: {
    InfoCircleOutlined,
    CloseOutlined,
    XFileTypeIcon,
    TableFiles,
  },
  setup() {
    const { t } = useI18n();
    const userStore = useUserStore();
    const localAddr = ref<string>("");
    const remotAddr = ref<string>("");
    const actionType = ref<ActionType>("send");
    const loadingOfSend = ref(false);
    const tableDataOfSend = reactive<FileItem[]>([]);
    const tableDataOfReceive = reactive<FileItem[]>([]);

    async function useMultiClient() {
      const client = await userStore.getMultiClient();
      if (!client) return;
      console.log("useMultiClient");
      localAddr.value = client.addr;
      client.listen();
      // 一个session 只用来发送一个文件
      client.onSession(async (session) => {
        // console.log("session", session);
        // session.read(10).then((data) => console.log(data));
        // session.read(10).then((data) => console.log(data));
        // session.read(1000).then((data) => console.log(data));
        const headerUint8Array = await readHeaderInSession(session);
        const headerObj = decode(headerUint8Array) as FileHeader;
        let toDownloadFile: File | null = null;
        console.log("读取文件头部信息", headerObj);
        const uniqueId = makeUniqueId(headerObj.fileName, headerObj.fileSize);
        const itemToPush: FileItem = {
          file: new File(["0"], headerObj.fileName, {
            type: headerObj.MIMEType,
          }),
          fileName: headerObj.fileName,
          fileSize: headerObj.fileSize,
          uniqueId,
          fileType: getFileType({ isDir: false, fileName: headerObj.fileName }),
          progress: 0,
          speed: 0,
          status: "queueing",
        };
        tableDataOfReceive.push(itemToPush);
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
            startLen < maxReceiveLength ? MAX_MTU : startLen - maxReceiveLength;
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
            status: FileItem["status"]
          ) => {
            // 防止push 的过程idx 变了, 所以得重新查找
            const idx = tableDataOfReceive.findIndex(
              (i) => i.uniqueId === uniqueId
            );
            if (idx !== -1) {
              tableDataOfReceive[idx].progress = progress;
              tableDataOfReceive[idx].speed = speed;
              tableDataOfReceive[idx].status = status;
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
          }
        }
        // 发送-确认信息
        client.send(session.remoteAddr, makeConfirmMessage(uniqueId));
        toDownloadFile = new File([fileBuffer], headerObj.fileName, {
          type: headerObj.MIMEType,
        });
        downloadFileByBlob(toDownloadFile, headerObj.fileName);
        toDownloadFile = null;
      });
      // client.onMessage((message) => {
      //   console.log("message", message);
      // });
    }
    useMultiClient();
    const onCopyMyAddr = () => {
      useClipboard({ read: false })
        .copy(localAddr.value)
        .then(() => message.success(t("metanet.copySuccess")));
    };
    const onSelectFile = () => {
      document.getElementById("sendFile")?.click();
    };
    const onTestShakeHand = async () => {
      if (!remotAddr.value.length) {
        message.warning("请输入对方地址");
        return;
      }
      const client = await userStore.getMultiClient();
      if (!client) return;
      client.send(remotAddr.value, "hello,what").catch((e) => {
        message.warning("握手失败");
        console.log("sendmsg-error", e);
      });
      // client.listen();
      // console.log("begin-dial", client);
      const session = await client?.dial(remotAddr.value);
      console.log("session", session);
    };
    const onInputFileChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (!input.files?.length) return;
      // tableDataOfSend.length = 0;
      const fileArr: FileItem[] = [...input.files].map((i) => ({
        file: i,
        fileName: i.name,
        fileSize: i.size,
        uniqueId: makeUniqueId(i.name, i.size),
        fileType: getFileType({ isDir: false, fileName: i.name }),
        progress: 0,
        speed: 0,
        status: "queueing",
      }));
      console.log("fileArr", fileArr);
      tableDataOfSend.push(...fileArr);
      // 清空input 的缓存
      input.value = "";
    };
    const checkRemoteArr = () => remotAddr.value.length > 0;
    const onSendFileList = async () => {
      if (!checkRemoteArr()) {
        message.warning("请输入对方地址");
        return;
      }
      console.log("onSendFileList", tableDataOfSend);
      const limit = pLimit(2);
      loadingOfSend.value = true;
      const canSendList = tableDataOfSend
        // 还有file 文件的
        .filter(
          // 过滤掉状态为 已经成功的 / 等待确认的
          (i) => i.file && !["successSend", "waiting"].includes(i.status)
        );
      console.log("canSendList", canSendList);
      if (canSendList.length) {
        await Promise.all(
          canSendList.map((item) => {
            item.status = "queueing";
            return limit(() => onSendOneFile(item));
          })
        );
      }
      loadingOfSend.value = false;
      // console.log("filelist-发送完毕");
    };
    const onSendOneFile = async (item: FileItem) => {
      if (!item.file) return;
      const fileName = item.file.name;
      const client = await userStore.getMultiClient();
      if (!client) return;
      const repeatlyDial = getRepeatlyClientDialFn(client, remotAddr.value);
      const session = await repeatlyDial();
      if (!session) {
        message.warning("session 握手失败");
        console.log("session 握手失败");
        // const idx = tableDataOfSend.findIndex(
        //   (i) => i.file && i.file.name === fileName
        // );
        // if (idx !== -1) {
        //   tableDataOfSend[idx].status = "failed";
        //   tableDataOfSend[idx].file = undefined; // 清空文件缓存 不允许再次操作
        // }
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
        status: FileItem["status"]
      ) => {
        // 防止push 的过程idx 变了, 所以得重新查找
        // const idx = tableDataOfSend.findIndex((i) => i.uniqueId === uniqueId);
        // if (idx !== -1) {
        //   tableDataOfSend[idx].progress = progress;
        //   tableDataOfSend[idx].speed = speed;
        //   tableDataOfSend[idx].status = status;
        // }
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
            toSetBytesPerSecond = startLen / dayjs().diff(startTime, "second");
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
      const clearConfirmListener = () =>
        remove(client.eventListeners.message, (v) => v === confirmMessage);
      const handleConfirmMessage = (message: TMessageType) => {
        console.log("received-remote-message", message);
        if (message.payload === confirmMessage) {
          setItemProgressSpeedStatus(100, 0, "successSend");
          // 清空文件节省内存
          // const idx = tableDataOfSend.findIndex((i) => i.uniqueId === uniqueId);
          // if (idx !== -1) {
          //   tableDataOfSend[idx].file = undefined;
          // }
          item.file = undefined;
          clearConfirmListener();
        }
      };
      client.onMessage(handleConfirmMessage);
      setTimeout(() => {
        clearConfirmListener();
        // 超时还未确认的话就当取消
        // const idx = tableDataOfSend.findIndex((i) => i.uniqueId === uniqueId);
        // if (idx !== -1) {
        //   if (tableDataOfSend[idx].status !== "successSend") {
        //     tableDataOfSend[idx].status = "failed";
        //     // 清空文件节省内存
        //     tableDataOfSend[idx].file = undefined;
        //   }
        // }
        if (item.status !== "successSend") {
          item.status = "failed";
          item.file = undefined;
        }
      }, 30000);
      // client.eventListeners
    };

    /** 删除发送item */
    const onRecordSendClear = (record: FileItem) => {
      remove(tableDataOfSend, (v) => v.uniqueId === record.uniqueId);
    };
    /** 删除接收item */
    const onRecordReceiveClear = (record: FileItem) => {
      remove(tableDataOfReceive, (v) => v.uniqueId === record.uniqueId);
    };
    // File
    // lastModified: 1626790643596
    // lastModifiedDate: Tue Jul 20 2021 22:17:23 GMT+0800 (中国标准时间) {}
    // name: "31995417527941.jpg"
    // size: 1048576
    // type: "image/jpeg"
    // webkitRelativePath: ""
    return {
      localAddr,
      remotAddr,
      actionType,
      onCopyMyAddr,
      onSelectFile,
      onTestShakeHand,
      onInputFileChange,
      calcStatusText,
      onSendFileList,
      columns,
      loadingOfSend,
      tableDataOfSend,
      tableDataOfReceive,
      formatBytes,
      onRecordSendClear,
      onRecordReceiveClear,
    };
  },
});
</script>

<style lang="less" scoped>
/* #f0f0f0 */
</style>