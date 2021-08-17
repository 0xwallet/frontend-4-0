<template>
  <div>
    <!-- 功能区 -->
    <div class="mb-3 flex items-center">
      <a-button
        class="mr-2"
        :disabled="uploadSuccessList.length === 0"
        @click="onBatchClear"
      >
        清除所有记录
      </a-button>
      <div v-if="uploadSuccessList.length > 0">
        共传输完成
        <span class="ant-color-blue-6">{{ uploadSuccessList.length }}</span>
        个文件!
      </div>
    </div>
    <XTableFiles
      rowKey="uniqueId"
      :disableSelect="true"
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
      <template #fileSize="{ record }">
        <div class="text-gray-400">
          {{ formatBytes(record.fileSize) }}
        </div>
      </template>
      <template #fileDir="{ record }">
        <div class="text-gray-400" title="路径全名">
          {{
            ["successPeerTransferSend", "successPeerTransferReceive"].includes(
              record.status
            )
              ? "本地路径"
              : fullNameToFileDir(record)
          }}
        </div>
      </template>
      <template #status="{ record }">
        <!-- success_upload -->
        <div v-if="record.isSecondUpload" class="flex items-center">
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_rocket.png" alt="" />
          </div>
          <div class="text-gray-400">极速秒传</div>
        </div>
        <div v-else-if="record.status === 'success'" class="flex items-center">
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_upload.png" alt="" />
          </div>
          <div class="text-gray-400">上传成功</div>
        </div>
        <div
          v-else-if="record.status === 'successUpdate'"
          class="flex items-center"
        >
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_upload.png" alt="" />
          </div>
          <div class="text-gray-400">更新成功</div>
        </div>
        <div
          v-else-if="record.status === 'successPeerTransferSend'"
          class="flex items-center"
        >
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_peerTransfer.png" alt="" />
          </div>
          <div class="text-gray-400">空投发送成功</div>
        </div>
        <div
          v-else-if="record.status === 'successPeerTransferReceive'"
          class="flex items-center"
        >
          <div class="w-3.5 h-3.5 mr-2">
            <img src="~@/assets/images/success_peerTransfer.png" alt="" />
          </div>
          <div class="text-gray-400">空投接收成功</div>
        </div>
      </template>
      <template #action="{ record }">
        <div class="flex items-center text-gray-600">
          <a
            class="flex-1"
            href="javascript:;"
            @click="onRecordOpenDir(record)"
            v-if="
              ![
                'successPeerTransferSend',
                'successPeerTransferReceive',
              ].includes(record.status)
            "
          >
            <a-tooltip title="打开所在文件夹">
              <FolderOutlined />
            </a-tooltip>
          </a>
          <a class="flex-1" href="javascript:;" @click="onRecordClear(record)">
            <a-tooltip title="清除记录">
              <ClearOutlined />
            </a-tooltip>
          </a>
        </div>
      </template>
    </XTableFiles>
  </div>
</template>

<script lang="ts">
import { useBaseStore, useTransportStore } from "@/store";
import {
  computed,
  createVNode,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";
import {
  FolderOutlined,
  ClearOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import XTableFiles from "@/components/XTableFiles.vue";
import XFileTypeIcon from "@/components/XFileTypeIcon.vue";
import { formatBytes, lastOfArray } from "@/utils";
import { UploadItem } from "@/store/transport";
import { useRouter } from "vue-router";
import { apiQueryFileByDir } from "@/apollo/api";
import { THistoryDirItem } from "@/pages/Metanet/components/FileItem.vue";
import { useLocalStorage } from "@vueuse/core";
import { Modal } from "ant-design-vue";

export default defineComponent({
  name: "TransportHistory",
  components: {
    XTableFiles,
    XFileTypeIcon,
    // ant icons
    FolderOutlined,
    ClearOutlined,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const transPortStore = useTransportStore();
    const baseStore = useBaseStore();
    // 测试用个
    // transPortStore.uploadHashMap["222"] = {
    //   fileHash: "222",
    //   fullName: ["fake.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 100,
    //   status: "success",
    //   description: "sdfs",
    //   speed: 500,
    // };
    // transPortStore.uploadHashMap["223"] = {
    //   fileHash: "223",
    //   fullName: ["fake.jpg"],
    //   fileType: "jpg",
    //   fileSize: 2000,
    //   progress: 100,
    //   status: "success",
    //   description: "sdfs",
    //   isSecondUpload: true,
    //   speed: 1028,
    // };
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
        title: "大小",
        slots: { customRender: "fileSize" },
        width: 100,
      },
      {
        title: "路径",
        slots: { customRender: "fileDir" },
        // width: 300,
      },
      {
        title: "状态",
        slots: { customRender: "status" },
        width: 150,
      },
      {
        title: t("metanet.action"),
        fixed: "right",
        width: 100,
        slots: { customRender: "action" },
      },
    ];
    const tableData = computed(() => {
      return transPortStore.uploadSuccessList;
    });
    /** 根据目录数组返回包含id 的对象 */
    async function checkFileFullNameIsExist(nameArr: string[]) {
      // console.log("checkFileFullNameIsExist", nameArr);
      const res = await apiQueryFileByDir({ fullName: nameArr.slice(0, -1) });
      if (res.err || !res.data) {
        return false;
      }
      const found = res.data.driveListFiles.find(
        (item) =>
          item &&
          item.fullName.length &&
          item.fullName.every((item, idx) => {
            // console.log("item,idx", item, idx, nameArr);
            return item === nameArr[idx];
          })
      );
      return !!found;
    }
    /** 打开到所在文件夹 */
    const onRecordOpenDir = async (record: UploadItem) => {
      // console.log("onRecordOpenDir", record);
      const fullName = record.fullName;
      let isFileExist = await checkFileFullNameIsExist(fullName);
      // console.log("folderArr", fullName, isFileExist);
      // // 找不到对应的文件夹(用户已经在文件夹列表中删除)
      if (!isFileExist) {
        Modal.confirm({
          icon: createVNode(ExclamationCircleOutlined),
          content: "文件已被删除,是否清除这条记录?",
          onOk: () => {
            transPortStore.clearItem(record.uniqueId);
          },
        });
      } else {
        // console.log("folderArr", folderArr);
        const windowId = baseStore.getNewOpenWindowId();
        const upperPath = fullName.slice(0, -1);
        router.push({
          name: "MetanetFile",
          query: {
            id: windowId,
            path: upperPath.length
              ? "~/" + fullName.slice(0, -1).join("/")
              : "~",
          },
        });
      }
    };
    /** 清除单项成功记录 */
    const onRecordClear = (record: UploadItem) => {
      // console.log("onRecordClear", record);
      transPortStore.clearItem(record.uniqueId);
    };
    /** 清除所有成功的记录 */
    const onBatchClear = () => {
      transPortStore.uploadSuccessList.forEach(({ uniqueId }) => {
        transPortStore.clearItem(uniqueId);
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