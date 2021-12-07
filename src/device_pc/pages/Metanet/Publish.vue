<template>
  <div>
    <!-- 功能区 height 32px-->
    <div class="relative h-8 flex items-center mb-3 pr-1">
      <!-- 添加按钮 -->
      <a-tooltip title="添加">
        <a
          href="javascript:;"
          class="inline-block px-1 mr-2"
          @click="onAddPublish"
        >
          <FileAddOutlined />
        </a>
      </a-tooltip>

      <!-- 刷新按钮 -->
      <a-tooltip :title="$t('metanet.refresh')">
        <a
          href="javascript:;"
          class="inline-block px-1 mr-2"
          @click="onRefreshTableData"
        >
          <SyncOutlined :spin="tableLoading" />
        </a>
      </a-tooltip>
      <div
        class="flex-1 mr-2 px-3 flex items-center"
        :style="{
          height: '28px',
          'border-radius': '50px',
          'background-color': '#f7f7f8',
        }"
      >
        <!-- {{ shareWeight }} -->
        {{ publishEarnings }}
      </div>
      <div>
        <a-button
          :disabled="selectedRows.length === 0"
          class="mr-2"
          shape="round"
          type="primary"
          @click="onCopyPublish"
        >
          复制发布
        </a-button>
        <a-button
          :disabled="selectedRows.length === 0"
          shape="round"
          type="danger"
          @click="onBatchDelete"
        >
          删除发布
        </a-button>
      </div>
    </div>
    <!-- 表格 -->
    <!-- :loading="tableLoading" -->
    <XTableFiles
      rowKey="id"
      :columns="columns"
      :data="tableData"
      v-model:selectedRows="selectedRows"
      v-model:selectedRowKeys="selectedRowKeys"
    >
      <template #name="{ record }">
        <div class="truncate relative">
          <!-- 空白就是blank 文件夹就是folder -->
          <XFileTypeIcon
            class="w-6 h-6"
            :type="record.current.userFile.fileType"
          />
          <a
            href="javascript:;"
            class="ml-2"
            :title="record.current.userFile.fullName[0]"
            @click="onClickTableItemName(record)"
          >
            {{ record.current.userFile.fullName[0] }}
          </a>
          <!-- hover 才显示的shortCut栏 -->
          <div class="tableShortcut hidden inline-block absolute right-0">
            <!-- 详情 -->
            <a-tooltip title="详情">
              <a
                class="shortcutButton ml-1"
                href="javascript:;"
                @click="onRecordDetail(record)"
                ><InfoCircleOutlined
              /></a>
            </a-tooltip>
            <!-- 详情 -->
            <a-tooltip title="复制链接">
              <a
                class="shortcutButton ml-1"
                href="javascript:;"
                @click="onRecordCopyLink(record)"
                ><CopyOutlined
              /></a>
            </a-tooltip>
            <!-- 替换 -->
            <a-tooltip title="更新(版本)">
              <a
                class="shortcutButton ml-1"
                href="javascript:;"
                @click="onRecordUpdate(record)"
                ><RotateRightOutlined
              /></a>
            </a-tooltip>
            <!-- 删除 -->
            <a-tooltip title="删除">
              <a
                class="shortcutButton ml-1 ant-color-danger"
                href="javascript:;"
                @click="onRecordDelete(record)"
                :style="{
                  color: '#ff7875',
                }"
                ><DeleteOutlined
              /></a>
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #version="{ record }">
        <a href="javascript:;">
          {{ record.current.version }}
        </a>
      </template>
      <!-- <template #action="{ record }">
        <a-button size="small" type="danger" @click="onRecordDelete(record)">
          {{ $t("metanet.delete") }}
        </a-button>
      </template> -->
    </XTableFiles>
    <!-- 详情卡片 -->
    <ModalDetail v-model:visible="isShowDetailModal" :detail="currenDetailInfo">
      <template #txid="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col class="ant-color-gray" :span="6"
            >资源
            <a-tooltip title="复制地址">
              <a
                href="javascript:;"
                class="ml-2"
                @click="onCopyTxid(record.txid)"
              >
                <CopyOutlined />
              </a>
            </a-tooltip>
          </a-col>
          <a-col :span="17">
            <a-tooltip :title="record.txid">
              <div class="truncate">
                {{ record.txid }}
              </div>
            </a-tooltip>
          </a-col>
        </a-row>
      </template>
      <template #desc="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col class="ant-color-gray" :span="6">描述 </a-col>
          <a-col :span="17">
            <template v-if="record.desc.tagArr.length">
              <a-tag
                v-for="item in record.desc.tagArr"
                color="orange"
                :key="item"
                class="mb-1"
                >{{ item }}</a-tag
              >
            </template>
            {{ record.desc.text }}
          </a-col>
        </a-row>
      </template>
    </ModalDetail>
  </div>
</template>

<script lang="ts">
import {
  computed,
  createVNode,
  defineComponent,
  onActivated,
  ref,
  watch,
} from "vue";
import {
  FileAddOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  RotateRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import { XFileTypeIcon, XTableFiles } from "../../components";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import {
  apiPublishDelete,
  apiQueryPublishList,
  QueryPublishItem,
} from "@/apollo/api";
import { message, Modal } from "ant-design-vue";
import {
  cacheFormatDescription,
  getFileLocation,
  getFileType,
  lastOfArray,
} from "@/utils";
import { cloneDeep } from "lodash-es";
import ModalDetail, { TDetailInfo } from "./components/ModalDetail.vue";
import { useClipboard } from "@vueuse/core";

export default defineComponent({
  name: "MetanetPublish",
  components: {
    ModalDetail,
    XFileTypeIcon,
    FileAddOutlined,
    InfoCircleOutlined,
    CopyOutlined,
    RotateRightOutlined,
    DeleteOutlined,
    EditOutlined,
    SyncOutlined,
    XTableFiles,
  },
  setup() {
    const { t } = useI18n();
    const tableLoading = ref(false);
    // 名称	创建时间	版本	状态	操作
    const columns = [
      {
        title: t("metanet.name"),
        slots: { customRender: "name" },
      },
      {
        title: t("metanet.createAt"),
        dataIndex: "insertedAt",
        customRender: ({ record }: { record: QueryPublishItem }) => {
          const text = record.current.userFile.insertedAt;
          return text ? dayjs(text).format("YYYY-MM-DD hh:mm") : "";
        },
        width: 180,
      },
      {
        title: t("metanet.version"),
        slots: { customRender: "version" },
        width: 100,
      },
      {
        // 价格
        title: "价格",
        customRender: () => {
          return "--";
        },
        width: 100,
      },
      {
        // 销量
        title: "销量",
        customRender: () => {
          return "--";
        },
        width: 100,
      },
      // {
      //   title: t("metanet.state"),
      //   customRender: ({ record }: { record: QueryPublishItem }) => {
      //     return record.isCollected ? "已收藏" : "";
      //   },
      //   width: 100,
      // },
      // {
      //   title: t("metanet.action"),
      //   fixed: "right",
      //   width: 60,
      //   slots: { customRender: "action" },
      // },
    ];
    const selectedRows = ref<QueryPublishItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<QueryPublishItem[]>([]);
    /** 发布总收入 */
    const publishEarnings = computed(() => {
      return `收入 : 发布收入/总收入`;
    });
    // TODO
    /** 添加发布 */
    const onAddPublish = () => {
      message.info("添加");
    };
    /** 刷新表格数据 */
    const onRefreshTableData = () => {
      selectedRows.value.length = 0;
      selectedRowKeys.value.length = 0;
      tableLoading.value = true;
      apiQueryPublishList().then((result) => {
        tableLoading.value = false;
        if (result.err) {
          return;
        }
        tableData.value = result.data.driveListPublishs.map((i) => {
          const obj = cloneDeep(i);
          // 保留最后一项作为名称
          obj.current.userFile.fullName = i.current.userFile.fullName.slice(-1);
          // 获取类型
          obj.current.userFile.fileType = getFileType({
            isDir: obj.current.userFile.isDir,
            fileName: obj.current.userFile.fullName[0],
          });
          return obj;
        });
      });
    };
    onActivated(() => {
      onRefreshTableData(); // first run
    });
    /** 表格里名字的点击 */
    const onClickTableItemName = (record: QueryPublishItem) => {
      console.log("clicktablename", record);
    };
    /** 批量复制 */
    const onCopyPublish = () => {
      message.info("TODO");
    };
    /** 批量删除 */
    const onBatchDelete = () => {
      // console.log("onBatchDelete");
      const len = selectedRows.value.length;
      if (!len) {
        message.warning(t("metanet.errorPleaseSelect"));
        return;
      }
      Modal.confirm({
        // title: "Do you Want to delete these items?",
        title: `是否删除以下发布?`,
        content: selectedRows.value
          .map((i) => lastOfArray(i.current.userFile.fullName))
          .join(" , "),
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resList = await Promise.all(
            selectedRows.value.map(({ id }) => apiPublishDelete({ id }))
          );
          resList.forEach(
            (resItem) => resItem.err && message.warning(resItem.err.message)
          );
          message.success(t("metanet.publishDeleted"));
          onRefreshTableData();
        },
      });
    };
    /** shortcut-详情 */
    const onRecordDetail = (record: QueryPublishItem) => {
      console.log("onRecordDetail");
      // 资源: (发布TxID)及复制地址(URL)按钮,
      // Hash: (文件hash | 空) hash值 (完整)
      // 类型: (文件格式全称/文件夹)
      // 位置: (文件/文件夹路径)
      // 修改时间(最近发布文件/文件夹版本被修改的时间)
      // 创建时间(发布创建时间)
      // 描述(完整描述信息, 若该信息被作者更新, 收藏者将会看到最新描述)
      const formatedDescObj = cacheFormatDescription(
        record.current.userFile.info.description || ""
      );
      currenDetailInfo.value = {
        txid: record.current.txid,
        shareHash: record.current.userFile.hash,
        type: getFileType({
          isDir: record.current.userFile.isDir,
          fileName: lastOfArray(record.current.userFile.fullName),
        }),
        location: getFileLocation(record.current.userFile.fullName),
        insertedAt: dayjs(record.current.userFile.insertedAt).format(
          "YYYY年MM月DD日hh:mm"
        ),
        updatedAt: dayjs(record.current.userFile.updatedAt).format(
          "YYYY年MM月DD日hh:mm"
        ),
        desc: formatedDescObj,
      };
      isShowDetailModal.value = true;
    };
    /** shortcut-复制链接 */
    const onRecordCopyLink = () => {
      console.log("onRecordCopyLink");
    };
    /** shortcut-更新版本 */
    const onRecordUpdate = () => {
      console.log("onRecordUpdate");
    };
    /** shortcut-删除 */
    const onRecordDelete = (record: QueryPublishItem) => {
      // console.log("onRecordDelete", record);
      const fileName = record.current.userFile.fullName[0];
      Modal.confirm({
        title: `是否删除以下发布?`,
        content: fileName,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resultPublishDelete = await apiPublishDelete({
            id: record.id,
          });
          if (resultPublishDelete.err) return;
          message.success(t("metanet.publishDeleted"));
          onRefreshTableData();
        },
      });
    };
    const isShowDetailModal = ref(false);
    const currenDetailInfo = ref<TDetailInfo>({});
    /** 复制txid */
    const onCopyTxid = (txid: string) => {
      useClipboard({ read: false })
        .copy(txid)
        .then(() => {
          message.success(t("metanet.copySuccess"));
        });
    };
    // 关闭弹窗时清空数据
    watch(
      () => isShowDetailModal.value,
      (val) => {
        if (val === false) {
          currenDetailInfo.value = {};
        }
      }
    );
    return {
      tableLoading,
      selectedRows,
      selectedRowKeys,
      columns,
      tableData,
      onClickTableItemName,
      publishEarnings,
      onAddPublish,
      onRefreshTableData,
      onCopyPublish,
      onBatchDelete,
      onRecordDetail,
      onRecordCopyLink,
      onRecordUpdate,
      onRecordDelete,
      isShowDetailModal,
      onCopyTxid,
      currenDetailInfo,
    };
  },
});
</script>

<style scoped>
</style>