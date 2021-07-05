<template>
  <div>
    <!-- 功能区 -->
    <div class="relative flex items-center mb-3">
      <!-- 这个为隐藏的作为选择文件用的 -->
      <input
        multiple
        class="hidden"
        type="file"
        id="singleInput"
        @change="onChangeMultipleUploadFile"
      />
      <!-- 下拉 - 上传 -->
      <a-dropdown class="mr-2">
        <template #overlay>
          <a-menu @click="onClickDropDownMenuUpload">
            <a-menu-item key="file">{{ $t("metanet.uploadFile") }}</a-menu-item>
            <a-menu-item key="folder">{{
              $t("metanet.uploadFolder")
            }}</a-menu-item>
          </a-menu>
        </template>
        <a-button type="primary">
          <CloudUploadOutlined />
          {{ $t("metanet.uploadButton") }}
        </a-button>
      </a-dropdown>
      <!-- 下拉 - 新建 -->
      <a-dropdown class="mr-2">
        <template #overlay>
          <a-menu @click="onClickDropDownMenuCreate">
            <a-menu-item key="file">{{ $t("metanet.createFile") }}</a-menu-item>
            <a-menu-item key="folder">{{
              $t("metanet.createFolder")
            }}</a-menu-item>
            <a-menu-item key="import">{{
              $t("metanet.createByImport")
            }}</a-menu-item>
          </a-menu>
        </template>
        <a-button type="primary">
          <FolderAddOutlined />
          {{ $t("metanet.create") }}
        </a-button>
      </a-dropdown>
      <!-- 刷新按钮 -->
      <a-button class="mr-2" @click="onRefreshTableData">
        <SyncOutlined :spin="tableLoading" />
        {{ $t("metanet.refresh") }}
      </a-button>

      <!-- 处理选中数据按钮集合 -->
      <!-- TODO 分享多个? -->
      <!-- 下载 删除 重命名 复制到 移动到 -->
      <a-button-group class="mr-2" v-show="selectedRows.length">
        <a-button type="danger" @click="onBatchDelete">
          <!-- <DeleteOutlined /> -->
          {{ $t("metanet.delete") }}
        </a-button>
        <!-- 选中有文件夹的话禁用下载按钮(因为还没有下载文件夹功能) -->
        <!-- <DownloadOutlined /> -->
        <!-- <a-button
          @click="onDownloadBatch"
          :disabled="selectedRows.some((i) => i.isDir)"
        >
          {{ $t("metanet.downloadButton") }}
        </a-button> -->
        <a-button @click="onDownload" :disabled="selectedRows.length > 1">
          <!-- 选中多个的时候禁用重命名 -->
          {{ $t("metanet.rename") }}
        </a-button>
        <a-button @click="onDownload">
          {{ $t("metanet.buttonCopyTo") }}
        </a-button>
        <a-button @click="onDownload">
          {{ $t("metanet.buttonMoveTo") }}
        </a-button>
      </a-button-group>
      <!-- 临时加的显示进度抽屉的按钮 -->
      <div class="absolute right-1 cursor-pointer">
        <a-tooltip title="nknClient状态">
          <a-dropdown>
            <a-tag color="#3b5999">
              <template #icon>
                <GlobalOutlined />
              </template>
              <span class="inline-block w-16 text-center">
                {{ nknClientConnectStatusShowText }}
              </span>
            </a-tag>
            <template #overlay>
              <a-menu>
                <a-menu-item class="text-xs" @click="onResetNknMultiClient">
                  重置Client
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-tooltip>

        <a-tooltip :title="$t('metanet.uploadStatusInfo')">
          <div class="inline-block" @click="onToggleIsShowProgressDrawer">
            <InfoCircleOutlined />
          </div>
        </a-tooltip>
      </div>
    </div>
    <a-breadcrumb class="pl-2 mb-1">
      <template #separator>></template>
      <template v-if="historyDir.length > 1">
        <a-breadcrumb-item
          v-for="hItem in historyDir.slice(0, -1)"
          :key="hItem.id"
        >
          <a
            @click="onClickHistoryDirUpperLevel(hItem)"
            style="color: #1890ff"
            >{{ hItem.name }}</a
          >
        </a-breadcrumb-item>
      </template>
      <a-breadcrumb-item>{{
        historyDir[historyDir.length - 1].name
      }}</a-breadcrumb-item>
    </a-breadcrumb>
    <TableFiles
      rowKey="id"
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      v-model:selectedRows="selectedRows"
      v-model:selectedRowKeys="selectedRowKeys"
    >
      <template #name="{ record }">
        <!-- 空白就是blank 文件夹就是folder -->
        <XFileTypeIcon class="w-6 h-6" :type="record.fileType" />
        <a
          href="javascript:void(0)"
          class="ml-2"
          :title="record.fullName[0]"
          @click="onClickTableItemName(record)"
        >
          <!-- <a-tooltip :title="record.fullName[0]"> -->
          {{ record.fullName[0] }}
          <!-- </a-tooltip> -->
        </a>
      </template>
      <template #hash="{ record }">
        <TdHash v-if="record && record.hash" :hash="record.hash" />
      </template>
      <template #action="{ record }">
        <!-- <a-button-group size="small">
          <a-button @click="onDownload(record)">
            {{ $t("metanet.downloadButton") }}
          </a-button>
          <a-button type="danger">{{ $t("metanet.delButton") }}</a-button>
        </a-button-group> -->
        <a-dropdown placement="bottomRight">
          <div class="text-center">
            <!-- <a href="javascript:void(0)" class="ant-color-blue">...</a> -->
            <EllipsisOutlined />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.shareButton") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.publish") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.send") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onDownload(record)"
              >
                {{ $t("metanet.downloadButton") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.moveButton") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.copyButton") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.rename") }}
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center text-red-500"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.delButton") }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </TableFiles>
    <!-- 上传进度 抽屉 -->
    <a-drawer
      id="uploadDrawer"
      height="auto"
      :wrapStyle="{
        width: '520px',
        left: 'auto',
        right: '40px',
      }"
      :drawerStyle="{
        'max-height': '400px',
        overflow: 'hidden',
        'overflow-y': 'scroll',
      }"
      :headerStyle="{
        padding: '8px 12px',
        'background-color': '#F7F7F8',
      }"
      :bodyStyle="{
        padding: '12px',
      }"
      placement="bottom"
      :closable="true"
      :mask="false"
      :visible="isShowProgressDrawer"
      @close="onCloseProgressDrawer"
    >
      <template #title>
        <!-- <a-button type="primary">fuck u</a-button> -->
        <!-- 一个circle 总体进度 -->
        <!-- TODO 根据情况变动背景颜色? -->
        <div
          class="
            inline-block
            w-16
            text-center
            py-1
            rounded-2xl
            bg-blue-400
            text-white
          "
          :style="{
            'background-color': '#1890FF',
          }"
        >
          {{ uploadTaskTotalProgress }}%
        </div>
        <a-tooltip :title="$t('metanet.uploadDrawerClearAll')">
          <a-button
            class="ml-4"
            shape="circle"
            size="small"
            @click="onRemoveTaskList"
          >
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </a-tooltip>
      </template>
      <div v-for="taskItem in uploadTaskList" :key="taskItem.id">
        <div class="flex items-center">
          <!-- icon/name/size/status -->
          <XFileTypeIcon class="w-6 h-6 mr-2" :type="taskItem.fileType" />
          <div
            :style="{
              'max-width': '275px',
              'text-overflow': 'ellipsis',
              overflow: 'hidden',
              'white-space': 'nowrap',
            }"
            :title="taskItem.fileName"
          >
            {{ taskItem.fileName }}
          </div>
          <div class="flex-1 ml-4 text-xs text-gray-400">
            | &nbsp; {{ taskItem.fileSize }}
            <a-tooltip :title="$t('metanet.uploadDrawerClearItem')">
              <DeleteOutlined @click="onRemoveTaskItem(taskItem)" />
            </a-tooltip>
          </div>
          <div
            :class="{
              'ant-color-uploading': taskItem.status === 'uploading',
              'ant-color-success': taskItem.status === 'success',
              'ant-color-failed': taskItem.status === 'failed',
            }"
          >
            {{ transformStatusText(taskItem.status) }}
          </div>
        </div>
        <!-- progress -->
        <!-- status	状态，可选: success exception normal active -->
        <a-progress
          :strokeWidth="3"
          :showInfo="false"
          :percent="taskItem.progress"
          :status="
            taskItem.status === 'failed'
              ? 'exception'
              : taskItem.progress < 100
              ? 'active'
              : 'success'
          "
        />
      </div>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  createVNode,
  computed,
  watch,
  reactive,
  onUnmounted,
} from "vue";
import {
  DownOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  FolderAddOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EllipsisOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";
import TableFiles from "./TableFiles.vue";
import { XFileTypeIcon } from "@/components";
import { useI18n } from "vue-i18n";
import {
  apiBatchDelete,
  apiGetPreviewToken,
  apiQueryFileByDir,
  apiUploadSingle,
  TFileItem,
  TFileList,
} from "@/apollo/api";
import dayjs from "dayjs";
import { assign } from "lodash-es";
import { message, Modal } from "ant-design-vue";
import { useUserStore } from "@/store";
import { useDelay } from "@/hooks";
import { formatBytes, getFileSHA256, getFileType } from "@/utils";
import TdHash from "./TdHash.vue";
import {
  FILE_TYPE_MAP,
  MAX_UPLOAD_SIZE,
  NKN_SUB_CLIENT_COUNT,
} from "@/constants";
import pLimit from "p-limit";

type THistoryDirItem = {
  id: string;
  name: string;
};
type TUploadTaskItem = {
  fileHash: string; // 文件的id
  fileName: string; // 文件名称
  fileType: string;
  fileSize: string;
  progress: number;
  status: "uploading" | "success" | "failed";
};
function sortByDirType(a: TFileItem, b: TFileItem) {
  return a.isDir ? (b.fullName[0] === "..." ? 1 : -1) : 1;
}
export default defineComponent({
  components: {
    // icon
    // DownOutlined,
    CloudUploadOutlined,
    SyncOutlined,
    FolderAddOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    GlobalOutlined,
    InfoCircleOutlined,
    // DownloadOutlined,
    //
    TableFiles,
    XFileTypeIcon,
    TdHash,
  },
  setup() {
    const { t } = useI18n();
    const selectedRows = ref<TFileItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    /** 按钮功能集合 */
    function useToolSet() {
      const onClickDropDownMenuCreate = ({
        key,
      }: {
        key: "file" | "folder";
      }) => {
        console.log("onClickDropDownMenuCreate", key);
      };
      const onClickDropDownMenuUpload = ({
        key,
      }: {
        key: "file" | "folder";
      }) => {
        console.log("onClickDropDownMenuUpload", key);
        // 点击文件
        if (key === "file") {
          document.getElementById("singleInput")?.click();
          // 选择完文件后会触发 onChangeMultipleUploadFile
        } else {
          // 点击文件夹
        }
      };
      // 批量删除
      const onBatchDelete = () => {
        const len = selectedRows.value.length;
        if (!len) {
          message.warning(t("metanet.errorPleaseSelect"));
          return;
        }
        Modal.confirm({
          // title: "Do you Want to delete these items?",
          title: `${t("metanet.delContent1")} ${len} ${t("metanet.items")} ${t(
            "metanet.delContent2"
          )}?`,
          icon: createVNode(ExclamationCircleOutlined),
          // content: createVNode(
          //   "div",
          //   { style: "color:red;" },
          //   "Some descriptions"
          // ),
          onOk: async () => {
            const [res, err] = await apiBatchDelete({
              ids: selectedRows.value.map((i) => i.id),
              space: "PRIVATE",
            });
            if (err || !res) return;
            const { driveDeleteFiles: deletedCount } = res.data;
            if (deletedCount === len) {
              // 全部删除成功
              message.success(t("metanet.deleted"));
            } else if (deletedCount > 0) {
              // 选中的其中部分删除失败
              message.error(t("metanet.errorDeletePartFail"));
            } else {
              // 选中的全部删除失败
              message.error(t("metanet.errorDeleteFail"));
            }
            getAndSetTableDataFn(curFolderId.value);
          },
          onCancel() {
            console.log("Cancel");
          },
          // class: 'test',
        });
      };
      /** 批量下载 */
      const onDownloadBatch = () => {
        const rows = selectedRows.value;
        if (rows.some((v) => v.isDir)) {
          // TODO 国际化
          message.warning("无法下载文件夹");
          return;
        }
        console.log("todo");
        // Modal.confirm({
        //   title: `是否下载选中的${rows.length}个文件?`,
        //   icon: createVNode(ExclamationCircleOutlined),
        //   onOk: async () => {
        //     const [res, err] = await apiGetPreviewToken();
        //     if (err || !res) return;
        //     const token = res.data.drivePreviewToken;
        //     let startWait = 100;
        //     rows.map(({ user, space, id: fileId, fullName }) => {
        //       const url = `https://drive-s.owaf.io/download/${
        //         user.id
        //       }/${space.toLowerCase()}/${fileId}/${
        //         fullName.slice(-1)[0]
        //       }?token=${token}`;
        //       const el = document.createElement("a");
        //       el.href = url;
        //       useDelay(++startWait).then(() => {
        //         el.click();
        //         el.remove();
        //       });
        //     });
        //   },
        // });
      };
      // TODO input 上传成功后清除文件?
      // 文件对话框选完文件后就会触发这个函数
      const onChangeMultipleUploadFile = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        const sizeCanUploadFiles = [...input.files].filter((file) => {
          if (file.size > MAX_UPLOAD_SIZE) {
            message.warning(t("metanet.errorUploadSizeLimit"));
            return false;
          } else {
            return true;
          }
        });
        if (!sizeCanUploadFiles.length) {
          input.value = "";
          return;
        }
        try {
          const resOfAll = await Promise.all(
            sizeCanUploadFiles.map(onUploadSingleFile)
          );
          console.log("resOfAll", resOfAll);
        } catch (error) {
          console.log("上传文件错误", error);
        }
        input.value = "";
      };
      // 并发管理器 只允许两个文件同时上传
      const limitUploadFiles = pLimit(2);
      /** 上传单个文件 */
      const onUploadSingleFile = async (file: File) => {
        // input.files[0] =>file
        // lastModified: 1623572088894
        // lastModifiedDate: Sun Jun 13 2021 16:14:48 GMT+0800 (中国标准时间) {}
        // name: "record.md"
        // size: 1916
        // type: ""
        // webkitRelativePath: ""
        // 弹出上传drawer
        isShowProgressDrawer.value = true;
        const fileName = file.name;
        const fileHash = await getFileSHA256(file);
        const taskItem: TUploadTaskItem = reactive({
          fileHash,
          fileName,
          fileSize: formatBytes(+file.size),
          fileType: getFileType({
            isDir: false,
            fileName,
          }),
          progress: 0,
          status: "uploading",
        });
        const setTaskItemProgress = (v: number) => {
          // console.log("setTaskItemProgress", v);
          taskItem.progress = v;
          if (v === 100) taskItem.status = "success";
        };
        uploadTaskList.value.push(taskItem);
        // TODO 上传完后清除?
        // const [res, err] = await apiUploadSingle({
        const [res, err] = await limitUploadFiles(() =>
          apiUploadSingle({
            // File: new Uint8Array(await file.arrayBuffer()),
            SourceFile: file,
            // 上传到不同的文件夹就要带上其名称在前面 (除了root)
            FullName: [
              ...historyDir.value.slice(1).map((i) => i.name),
              fileName,
            ],
            FileSize: file.size,
            UserId: useUserStore().id,
            Space: "PRIVATE",
            Description: "",
            Action: "drive",
            SetProgress: setTaskItemProgress,
          })
        );
        if (err) {
          taskItem.status = "failed";
          return;
        }
        if (res?.data.startsWith("秒传成功")) {
          message.success(t("metanet.uploadSuccess"));
          setTaskItemProgress(100);
          taskItem.status = "success";
          getAndSetTableDataFn(curFolderId.value);
          return;
        }
        // 处理秒传
        // 同步添加新的事件监听 然后解除监听
        const hide = message.loading(
          `上传${fileName}成功,等待websocket 返回确认信息`,
          0
        );
        let timer: number;
        const { channel } = useUserStore();
        if (!channel) throw Error("no channel");
        // console.log("channel", channel);
        let removeListener = channel.on(
          "file_uploaded",
          (fileUploadInfo: {
            // full_name: ["testTrace.go"]
            // hash: "1e926583a18c6a0a8e26372a5055c9ec748d983c1458c43d125154a74eee7b83"
            // id: "zrEK5LckpjNr2bsRJoT6p0"
            // space: 2
            full_name: string[];
            hash: string;
            id: string;
            space: number;
          }) => {
            // console.log("包括remove的listen", fileUploadInfo);
            if (fileUploadInfo.hash === fileHash) {
              useDelay().then(() => {
                clearTimeout(timer);
                message.success(t("metanet.uploadSuccess"));
                setTaskItemProgress(100);
                taskItem.status = "success";
                getAndSetTableDataFn(curFolderId.value);
                // console.log("getAndSetTableDataFn", getAndSetTableDataFn);
                channel.off("file_uploaded", removeListener);
                hide();
              });
            }
          }
        );
        // 设置超时
        timer = window.setTimeout(() => {
          channel.off("file_uploaded", removeListener);
          hide();
          clearTimeout(timer);
          // TODO 国际化提示
          message.warn(t("metanet.errorUpload"));
          taskItem.status = "failed";
          // getAndSetTableDataFn(curFolderId.value);
        }, 60000);
        // 重新刷新数据?
        if (err) console.error(err);
        // console.log("writestream---", res, input);
      };
      return {
        onClickDropDownMenuCreate,
        onClickDropDownMenuUpload,
        onBatchDelete,
        onDownloadBatch,
        onChangeMultipleUploadFile,
      };
    }
    /** action 里对record的操作 */
    function useActions() {
      const onRecordShare = () => {
        console.log("share");
      };
      // const onRecordShare = () => {};
      // const onRecordShare = () => {};
      // const onRecordShare = () => {};
      // const onRecordShare = () => {};
      // const onRecordShare = () => {};
      // const onRecordShare = () => {};
      // const onRecordShare = () => {};
      return { onRecordShare };
    }
    let getAndSetTableDataFn: (dirId: string) => void;

    // 记录目录
    const historyDir = ref<THistoryDirItem[]>([
      {
        id: "root",
        name: t("metanet.allFiles"),
      },
    ]);
    // 当前目录
    const curFolderId = computed(() => {
      const dirArr = historyDir.value;
      return dirArr[dirArr.length - 1].id;
    });

    function useTableData() {
      /** 点击目录历史的面包屑 */
      const onClickHistoryDirUpperLevel = ({ id, name }: THistoryDirItem) => {
        // 删除后面的
        historyDir.value.splice(
          historyDir.value.findIndex((v) => v.id === id) + 1
        );
        // console.log("history", historyDir);
        onRefreshTableData();
      };
      /** 表格里每一行的名字的点击事件 */
      const onClickTableItemName = ({
        fileType: e,
        id,
        fullName,
      }: TFileItem) => {
        if (!e) return;
        // console.log("点击的当前record", e, id);
        // 原来的处理有 : 文件夹 / 图片 / md txt json文本 / pdf
        if (e === "folder") {
          const foundIndex = historyDir.value.findIndex((v) => v.id === id);
          if (foundIndex !== -1) {
            historyDir.value.splice(foundIndex + 1);
          } else {
            historyDir.value.push({
              id,
              name: fullName[fullName.length - 1],
            });
          }
          onRefreshTableData();
        } else if (FILE_TYPE_MAP.image.includes(e)) {
          console.log("todo type-image");
        } else if (FILE_TYPE_MAP.text.includes(e)) {
          console.log("todo type-text");
        } else if (FILE_TYPE_MAP.archive.includes(e)) {
          console.log("todo type-archive");
        } else if (FILE_TYPE_MAP.audio.includes(e)) {
          console.log("todo type-audio");
        } else if (FILE_TYPE_MAP.video.includes(e)) {
          console.log("todo type-video");
        } else {
          console.log("else unknown types");
          // type not found
        }
      };
      const columns = [
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
          // width: 100,
          ellipsis: true,
        },
        // {
        //   title: t("metanet.type"),
        //   width: 100,
        //   customRender: ({
        //     record,
        //   }: {
        //     record: { isDir: boolean; fileType: string };
        //   }) => {
        //     return record.isDir ? "" : record.fileType;
        //   },
        // },
        {
          title: t("metanet.size"),
          dataIndex: "info.size",
          width: 100,
          customRender: ({
            record,
            text,
          }: {
            record: TFileItem;
            text: number;
          }) => {
            return record.isDir ? "" : formatBytes(text);
          },
        },
        {
          title: "Hash",
          dataIndex: "hash",
          slots: { customRender: "hash" },
          width: 150,
        },
        {
          title: t("metanet.data"),
          dataIndex: "updatedAt",
          customRender: ({ text }: { text: string }) => {
            return text ? dayjs(text).format("YYYY-MM-DD hh:mm") : "";
          },
          width: 180,
        },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 60,
          slots: { customRender: "action" },
        },
      ];
      const tableLoading = ref(false);
      const tableData = ref<TFileList>([]);
      // 提供一个函数给外部
      getAndSetTableDataFn = (dirId) => {
        // 重置选中项目
        selectedRows.value.length = 0;
        selectedRowKeys.value.length = 0;
        tableLoading.value = true;
        apiQueryFileByDir({ dirId }).then(([res, err]) => {
          if (err || !res?.data.driveListFiles) return;
          // 如果返回的 fullName 是空数组的话 代表是根目录
          // 排除null 和 fullName是当前目录的数据(当前目录若不是root , 要加...返回上一级)
          // console.log("网盘文件获取", res);
          tableData.value = res.data.driveListFiles
            // 排序 文件夹在前
            // 加上类型
            .map((i) => {
              if (!i) return i;
              const obj = { ...i };
              // 如果是当前目录, 返回null , 下一步把它去除
              if (obj.id === dirId) return null;
              // 如果是父级目录, 变成...
              const hArr = historyDir.value;
              if (hArr.length > 1 && obj.id === hArr[hArr.length - 2].id) {
                obj.fullName = ["..."];
              } else {
                // 等于名字最后一项, 因为返回的是 [父级目录,item文件夹名] 所以取最后一个
                obj.fullName = [obj.fullName[obj.fullName.length - 1]];
              }
              obj.fileType = getFileType({
                isDir: obj.isDir,
                fileName: obj.fullName[0],
              });
              return obj;
            })
            // filter 里用类型守卫去除null
            .filter((i): i is TFileItem => i !== null)
            // 排序文件夹,上级目录... 到表格最前面
            .sort(sortByDirType);
          // console.log("tabledData", tableData);
          tableLoading.value = false;
        });
      };
      getAndSetTableDataFn(curFolderId.value);
      /** 清除当前组件的select数据, 然后重新获取表格数据 */
      const onRefreshTableData = () => {
        getAndSetTableDataFn(curFolderId.value);
      };
      const onDownload = ({ user, space, id: fileId, fullName }: TFileItem) => {
        // TODO
        // Content-Disposition: attachment
        const hideLoadingMsg = message.loading("连接服务器中...", 0);
        apiGetPreviewToken()
          .then(([res, err]) => {
            if (err || !res) return;
            const token = res.data.drivePreviewToken;
            const url = `https://drive-s.owaf.io/download/${
              user.id
            }/${space.toLowerCase()}/${fileId}/${
              fullName.slice(-1)[0]
            }?token=${token}`;
            let el = document.createElement("a");
            // fireFox 要求el 在body中
            document.body.appendChild(el);
            el.type = "download";
            el.href = url;
            el.click();
            el.remove();
          })
          .finally(hideLoadingMsg);
      };
      return {
        historyDir,
        onClickTableItemName,
        onClickHistoryDirUpperLevel,
        onRefreshTableData,
        onDownload,
        columns,
        tableData,
        tableLoading,
      };
    }
    const uploadTaskList = ref<TUploadTaskItem[]>([]);
    const uploadTaskTotalProgress = computed(() => {
      const taskList = uploadTaskList.value.map((i) => i.progress);
      if (!taskList.length) return 0;
      const totalPercent = taskList.length * 100;
      const currentProgress = taskList.reduce((a, b) => a + b);
      return Math.floor((currentProgress / totalPercent) * 100);
    });
    /** 清除列表中非上传状态的数据 */
    const onRemoveTaskList = () => {
      const listOfUploading = uploadTaskList.value.filter(
        (v) => v.status === "uploading"
      );
      uploadTaskList.value.length = 0;
      if (listOfUploading.length) {
        message.warning("上传中的数据无法清除");
        uploadTaskList.value.push(...listOfUploading);
      }
    };
    /** 清除这条记录 */
    const onRemoveTaskItem = (item: TUploadTaskItem) => {
      if (item.status === "uploading") {
        message.warning("上传中,无法清除");
        return;
      }
      const foundIndex = uploadTaskList.value.findIndex(
        // 同文件不同名文件?
        (v) => v.fileName === item.fileName && v.fileHash === item.fileHash
      );
      if (foundIndex !== -1) uploadTaskList.value.splice(foundIndex, 1);
    };
    const isShowProgressDrawer = ref(false);
    /** 上传进度抽屉 */
    function useDrawer() {
      const onCloseProgressDrawer = () => {
        // console.log("onCloseProgressDrawer", onCloseProgressDrawer);
        isShowProgressDrawer.value = false;
      };

      const onToggleIsShowProgressDrawer = () => {
        isShowProgressDrawer.value = !isShowProgressDrawer.value;
      };
      const transformStatusText = (s: TUploadTaskItem["status"]) => {
        if (s === "uploading") return t("metanet.uploadStatusUploading");
        if (s === "success") return t("metanet.uploadStatusSuccess");
        if (s === "failed") return t("metanet.uploadStatusFailed");
      };
      return {
        uploadTaskList,
        onRemoveTaskList,
        onRemoveTaskItem,
        uploadTaskTotalProgress,
        isShowProgressDrawer,
        onCloseProgressDrawer,
        onToggleIsShowProgressDrawer,
        transformStatusText,
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
        const multiClient = useUserStore().multiClient;
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
              useUserStore().resetMultiClient();
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
      const nknClientConnectStatusShowText = computed(() => {
        const { count, text } = nknClientConnectStatusMap;
        return `${text} ${count}/${NKN_SUB_CLIENT_COUNT}`;
      });
      /** 重置nkn client */
      const onResetNknMultiClient = () => {
        Modal.confirm({
          title: "是否重置nkn multiClient?",
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            counterOfNknCLient = 0;
            nknClientConnectStatusMap.text = "连接中";
            useUserStore().resetMultiClient();
            // console.log("重置nkn multiClient", useUserStore().multiClient);
          },
        });
      };
      return { nknClientConnectStatusShowText, onResetNknMultiClient };
    }
    return {
      selectedRows,
      selectedRowKeys,
      ...useToolSet(),
      ...useActions(),
      ...useTableData(),
      ...useDrawer(),
      ...useNknStatus(),
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-breadcrumb-separator) {
  margin: 0 3px;
}
</style>

<style lang="less" >
#uploadDrawer {
  .ant-drawer-close {
    // color: yellow;
    // 这个 48 根据实测, 关联headerStyle的padding变动
    width: 47px;
    height: 47px;
    line-height: 47px;
  }
}
</style>