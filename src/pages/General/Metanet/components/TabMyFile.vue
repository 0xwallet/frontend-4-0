<template>
  <div>
    <!-- 功能区 -->
    <div class="flex items-center mb-3">
      <!-- 这个为隐藏的作为选择文件用的 -->
      <input
        class="hidden"
        type="file"
        id="singleInput"
        @change="onChangeSingleUploadFile"
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
      <!-- 批量删除按钮 -->
      <a-button type="danger" class="mr-2" @click="onBatchDelete">
        <DeleteOutlined />
        {{ $t("metanet.batchDelete") }}
      </a-button>
      <!-- 刷新按钮 -->
      <a-button class="mr-2" @click="onRefreshTableData">
        <SyncOutlined :spin="tableLoading" />
        {{ $t("metanet.refresh") }}
      </a-button>
    </div>
    <a-breadcrumb>
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
      :loading="tableLoading"
      :data="tableData"
      @select="onTableSelect"
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
            <a href="javascript:void(0)" class="ant-color-blue">...</a>
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
                @click="onRecordShare(record)"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, createVNode, computed } from "vue";
import {
  DownOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  FolderAddOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import TableFiles from "./TableFiles.vue";
import { XFileTypeIcon } from "@/components";
import { useI18n } from "vue-i18n";
import {
  apiBatchDelete,
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
import { formatBytes } from "@/utils";
import TdHash from "./TdHash.vue";
import { FILE_TYPE_MAP, MAX_UPLOAD_SIZE } from "@/constants";

type THistoryDirItem = {
  id: string;
  name: string;
};

export default defineComponent({
  components: {
    // icon
    // DownOutlined,
    CloudUploadOutlined,
    SyncOutlined,
    FolderAddOutlined,
    DeleteOutlined,
    //
    TableFiles,
    XFileTypeIcon,
    TdHash,
  },
  setup() {
    const { t } = useI18n();
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
            clearSelectData();
            getAndSetTableDataFn(curFolderId.value);
          },
          onCancel() {
            console.log("Cancel");
          },
          // class: 'test',
        });
      };
      // TODO input 上传成功后清除文件?
      // 文件对话框选完文件后就会触发这个函数
      const onChangeSingleUploadFile = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        const file = input.files[0];
        if (file.size > MAX_UPLOAD_SIZE) {
          message.warning(t("metanet.errorUploadSizeLimit"));
          input.value = "";
          return;
        }
        // input.files[0] =>file
        // lastModified: 1623572088894
        // lastModifiedDate: Sun Jun 13 2021 16:14:48 GMT+0800 (中国标准时间) {}
        // name: "record.md"
        // size: 1916
        // type: ""
        // webkitRelativePath: ""
        console.log("onChangeSingleUploadFile---", input);
        const fileName = file.name;
        // TODO 上传完后清除?
        const [res, err] = await apiUploadSingle({
          // File: new Uint8Array(await file.arrayBuffer()),
          SourceFile: file,
          // TODO 要带上路径吗
          FullName: [fileName],
          FileSize: file.size,
          UserId: useUserStore().id,
          Space: "PRIVATE",
          Description: "",
          Action: "drive",
        });
        input.value = ""; //释放input 资源
        if (res?.data.startsWith("秒传成功")) {
          message.success(t("metanet.uploadSuccess"));
          getAndSetTableDataFn(curFolderId.value);
          return;
        }
        // 处理秒传
        // 同步添加新的事件监听 然后解除监听
        const hide = message.loading("上传成功,等待websocket 返回确认信息", 0);
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
            // TODO 应该用hash 判断
            if (fileUploadInfo.full_name[0] === fileName) {
              useDelay().then(() => {
                clearTimeout(timer);
                message.success(t("metanet.uploadSuccess"));
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
          hide();
          channel.off("file_uploaded", removeListener);
          clearTimeout(timer);
          // TODO 国际化提示
          message.warn(t("metanet.errorUpload"));
          getAndSetTableDataFn(curFolderId.value);
        }, 60000);
        // 重新刷新数据?
        if (err) console.error(err);
        // console.log("writestream---", res, input);
      };
      return {
        onClickDropDownMenuCreate,
        onClickDropDownMenuUpload,
        onBatchDelete,
        onChangeSingleUploadFile,
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
    let selectedRowKeys = ref<string[]>([]);
    let selectedRows = ref<TFileItem[]>([]);
    const clearSelectData = () => {
      selectedRows.value.length = 0;
      selectedRowKeys.value.length = 0;
    };
    // 记录目录
    const historyDir = ref<THistoryDirItem[]>([
      {
        id: "root",
        name: "root",
      },
    ]);
    // 当前目录
    const curFolderId = computed(() => {
      const dirArr = historyDir.value;
      return dirArr[dirArr.length - 1].id;
    });

    function useTableData() {
      /** 选中数据 */
      const onTableSelect = (keys: string[], rows: TFileItem[]) => {
        selectedRowKeys.value = keys;
        selectedRows.value = rows;
      };
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
        {
          title: t("metanet.data"),
          dataIndex: "updatedAt",
          customRender: ({ text }: { text: string }) => {
            return text ? dayjs(text).format("YYYY-MM-DD") : "";
          },
          width: 180,
        },
        {
          title: "Hash",
          dataIndex: "hash",
          slots: { customRender: "hash" },
          width: 180,
        },
        {
          title: t("metanet.size"),
          dataIndex: "info.size",
          width: 100,
          customRender: ({
            record,
            text,
          }: {
            record: { isDir: boolean };
            text: number;
          }) => {
            return record.isDir ? "" : formatBytes(text);
          },
        },
        {
          title: t("metanet.type"),
          width: 100,
          customRender: ({
            record,
          }: {
            record: { isDir: boolean; fileType: string };
          }) => {
            return record.isDir ? "" : record.fileType;
          },
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
              if (obj.isDir) assign(obj, { fileType: "folder" });
              else {
                const arr = obj.fullName[0].split(".");
                if (arr.length > 1) obj.fileType = arr.pop()?.toLowerCase();
                else obj.fileType = "file";
              }
              return obj;
            })
            // filter 里用类型守卫去除null
            .filter((i): i is TFileItem => i !== null)
            // 排序文件夹,上级目录... 到表格最前面
            .sort((a, b) => (a.isDir ? (b.fullName[0] === "..." ? 1 : -1) : 1));
          // console.log("tabledData", tableData);
          tableLoading.value = false;
        });
      };
      getAndSetTableDataFn(curFolderId.value);
      /** 清除当前组件的select数据, 然后重新获取表格数据 */
      const onRefreshTableData = () => {
        clearSelectData();
        getAndSetTableDataFn(curFolderId.value);
      };
      const onDownload = ({ user, space, id, fullName }: TFileItem) => {
        // TODO
        // Content-Disposition: attachment
        // window.fetch(
        //   `https://drive-s.owaf.io/download/${
        //     user.id
        //   }/${space.toLowerCase()}/${id}/${fullName.slice(-1)[0]}?token=${
        //     useUserStore().token
        //   }`
        // );
      };
      return {
        historyDir,
        onTableSelect,
        onClickTableItemName,
        onClickHistoryDirUpperLevel,
        onRefreshTableData,
        onDownload,
        columns,
        tableData,
        tableLoading,
      };
    }
    return {
      ...useToolSet(),
      ...useActions(),
      ...useTableData(),
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-breadcrumb-separator) {
  margin: 0 3px;
}
</style>