<template>
  <div>
    <!-- 功能区 height 32px-->
    <div class="relative h-8 flex items-center mb-3 pr-1">
      <!-- 添加按钮 -->
      <a-tooltip title="添加">
        <a
          href="javascript:;"
          class="inline-block px-1 mr-2"
          @click="onAddCollect"
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
        {{ collectTotalText }}
      </div>
      <div>
        <a-button
          :disabled="selectedRows.length === 0"
          class="mr-2"
          shape="round"
          type="primary"
          @click="onOther"
        >
          其他操作
        </a-button>
        <a-button
          :disabled="selectedRows.length === 0"
          shape="round"
          type="danger"
          @click="onBatchCancel"
        >
          取消收藏
        </a-button>
      </div>
    </div>
    <!-- 表格 -->
    <XTableFiles
      rowKey="id"
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      v-model:selectedRows="selectedRows"
      v-model:selectedRowKeys="selectedRowKeys"
    >
      <template #name="{ record }">
        <div class="relative">
          <!-- 空白就是blank 文件夹就是folder -->
          <XFileTypeIcon class="w-6 h-6" :type="record.fileType" />
          <a
            href="javascript:;"
            class="ml-2"
            :title="record.fullName[0]"
            @click="onClickTableItemName(record)"
          >
            {{ record.fullName[0] }}
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
            <!-- 删除 -->
            <a-tooltip title="取消收藏">
              <a
                class="shortcutButton ml-1 ant-color-danger"
                href="javascript:;"
                @click="onRecordCancel(record)"
                :style="{
                  color: '#ff7875',
                }"
                ><CloseCircleOutlined
              /></a>
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #hash="{ record }">
        <XTdHash v-if="record.hash" :hash="record.hash" />
        <span v-else></span>
      </template>
      <template #version="{ record }">
        <a href="javascript:;">
          {{ record.item.version }}
        </a>
      </template>
      <template #statusText="{ record }">
        <span>
          <!-- TODO 不同的状态判断 -->
          <XStatusDot
            class="mr-1"
            :type="record.statusText.includes('剩余时间') ? 'success' : 'error'"
          />
          <span class="align-middle">{{ record.statusText }}</span>
        </span>
      </template>
    </XTableFiles>
    <!-- 详情卡片 -->
    <ModalDetail v-model:visible="isShowDetailModal" :detail="currenDetailInfo">
      <template #collectType="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">资源类型</a-col>
          <a-col :span="17">{{ record.collectType }}</a-col>
        </a-row>
      </template>
      <template #hash="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">hash</a-col>
          <a-col :span="17">{{ record.hash || "--" }}</a-col>
        </a-row>
      </template>
      <template #fileType="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">文件类型</a-col>
          <a-col :span="17">{{ record.fileType }}</a-col>
        </a-row>
      </template>
      <template #collectTime="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">收藏时间</a-col>
          <a-col :span="17">{{ record.collectTime }}</a-col>
        </a-row>
      </template>
      <template #createTime="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">创建时间</a-col>
          <a-col :span="17">{{ record.createTime }}</a-col>
        </a-row>
      </template>
      <template #code="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">访问码</a-col>
          <a-col :span="17">{{ record.code || "--" }}</a-col>
        </a-row>
      </template>
      <template #statusText="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">状态</a-col>
          <a-col :span="17">{{ record.statusText }}</a-col>
        </a-row>
      </template>
      <template #desc="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray">描述 </a-col>
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
  InfoCircleOutlined,
  CopyOutlined,
  RotateRightOutlined,
  CloseCircleOutlined,
  FileAddOutlined,
  SyncOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import {
  XFileTypeIcon,
  XTableFiles,
  XTdHash,
  XStatusDot,
} from "../../components";
import ModalDetail, { TDetailInfo } from "./components/ModalDetail.vue";
import { message, Modal } from "ant-design-vue";
import {
  apiCollectDelete,
  apiQueryCollectList,
  QueryCollectItem,
  QueryPublishItem,
  QueryShareFileItem,
} from "@/apollo/api";
import { useI18n } from "vue-i18n";
import {
  cacheFormatDescription,
  DescObj,
  getFileType,
  lastOfArray,
} from "@/utils";
import dayjs from "dayjs";

type TCollectItem = {
  type: "SHARE" | "PUBLISH";
  id: string;
  fullName: string[];
  fileType: string;
  // status:'normal'|'expired'|'wrongCode'|'deleted';
  statusText: string;
  hash: string;
  code: string;
  createTime: string;
  collectTime: string;
  desc: DescObj;
};

export default defineComponent({
  name: "MetanetCollect",
  components: {
    FileAddOutlined,
    SyncOutlined,
    EditOutlined,
    InfoCircleOutlined,
    CopyOutlined,
    RotateRightOutlined,
    CloseCircleOutlined,
    //
    XFileTypeIcon,
    XTableFiles,
    XTdHash,
    XStatusDot,
    ModalDetail,
  },
  setup() {
    const { t } = useI18n();
    const tableLoading = ref(false);
    const selectedRows = ref<QueryCollectItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const columns = [
      // 名称	时间(收藏)	Hash	类型	状态	收藏(趋势)
      {
        title: t("metanet.name"),
        slots: { customRender: "name" },
      },
      {
        title: "时间(收藏)",
        dataIndex: "collectTime",
        customRender: ({ text }: { text: string }) => {
          return text ? dayjs(text).format("YYYY-MM-DD hh:mm") : "";
        },
        width: 180,
      },
      {
        title: "Hash",
        dataIndex: "hash",
        slots: { customRender: "hash" },
        width: 150,
      },
      {
        title: "类型",
        customRender: ({ record }: { record: TCollectItem }) => {
          return record.fullName[0] === "NOT_FOUND" ? "" : record.fileType;
        },
        width: 100,
      },
      {
        title: "状态",
        dataIndex: "statusText",
        slots: { customRender: "statusText" },
        width: 180,
      },
      {
        title: "收藏",
        customRender: () => "--",
        width: 100,
      },
    ];
    const tableData = ref<TCollectItem[]>([]);
    function isShareItem(
      item: QueryShareFileItem | QueryPublishItem
    ): item is QueryShareFileItem {
      return (item as QueryShareFileItem).userFile !== undefined;
    }
    const onRefreshTableData = () => {
      selectedRows.value.length = 0;
      selectedRowKeys.value.length = 0;
      tableLoading.value = true;
      // TODO 这里应该是 ALL ,还有个是PUBLISH
      apiQueryCollectList({ type: "SHARE" }).then((result) => {
        tableLoading.value = false;
        if (result.err) {
          return;
        }
        // 转换成一致的输出类型
        tableData.value = result.data.driveListCollections.map((i) => {
          if (isShareItem(i.item)) {
            const shareFullName = i.item.userFile
              ? i.item.userFile.fullName.length
                ? i.item.userFile.fullName
                : ["NOT_FOUND"]
              : ["NOT_FOUND"];
            return {
              type: "SHARE",
              id: i.id,
              fullName: shareFullName,
              fileType: getFileType({
                isDir: !!i.item.userFile?.isDir,
                fileName: lastOfArray(
                  shareFullName
                  // i.item.userFile?.fullName ?? ["NOT_FOUND"]
                ),
              }),
              statusText: i.item.userFile
                ? i.item.status === null
                  ? `剩余时间${dayjs(i.item.expiredAt).diff(dayjs(), "day")}天`
                  : i.item.status === "expired"
                  ? "已过期"
                  : "无效"
                : "已删除",
              hash: i.item.userFile?.hash ?? "",
              code: i.item.code ?? "",
              collectTime: i.insertedAt,
              createTime: i.item.userFile?.insertedAt ?? "",
              desc: cacheFormatDescription(i.info.description || ""),
            };
          } else {
            return {
              type: "PUBLISH",
              id: i.id,
              fullName: i.item.current.userFile.fullName,
              fileType: getFileType({
                isDir: i.item.current.userFile.isDir,
                fileName: lastOfArray(i.item.current.userFile.fullName),
              }),
              // TODO 暂停
              statusText: i.item.current
                ? `版本${i.item.current.version}`
                : "已删除 ",
              hash: i.item.current.txid,
              code: "",
              collectTime: i.insertedAt,
              createTime: i.item.current.userFile.insertedAt,
              desc: cacheFormatDescription(i.info.description || ""),
            };
          }
        });
      });
    };
    onActivated(() => {
      onRefreshTableData(); // first run
    });
    const collectTotalText = computed(() => {
      return "收藏 : TODO";
    });
    const onAddCollect = () => {
      message.info("TODO");
    };

    const onOther = () => {
      console.log("onOther");
    };
    const onBatchCancel = () => {
      console.log("onBatchCancel");
      const len = selectedRows.value.length;
      if (!len) {
        message.warning(t("metanet.errorPleaseSelect"));
        return;
      }
      Modal.confirm({
        // title: "Do you Want to delete these items?",
        title: `是否取消${len}个收藏?`,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resList = await Promise.all(
            selectedRows.value.map(({ id }) => apiCollectDelete({ id }))
          );
          resList.forEach(
            (resItem) => resItem.err && message.warning(resItem.err.message)
          );
          message.success("操作成功");
          onRefreshTableData();
        },
      });
    };
    /** shortcut-详情 */
    const onRecordDetail = (record: TCollectItem) => {
      console.log("onRecordDetail", record.statusText);
      // 资源类型: (分享|发布)及复制地址(URL)按钮,
      // Hash: (文件hash | 交易hash ) hash值 (完整)
      // 文件类型: (文件格式全称/文件夹) 例: 文件格式及全称表
      // 收藏时间(收藏者搜藏时的时间)
      // 创建时间(作者创建时间)
      // 访问码(收藏时记录,可重新编辑,若正确可更新状态),
      // 状态(当前访问状态)
      // 描述(完整描述信息, 若该信息被作者更新, 收藏者将会看到最新描述)
      currenDetailInfo.value = {
        collectType: record.type === "SHARE" ? "分享" : "发布",
        hash: record.hash,
        fileType: record.fileType,
        collectTime: dayjs(record.collectTime).format("YYYY年MM月DD日hh:mm"),
        createTime: record.createTime
          ? dayjs(record.createTime).format("YYYY年MM月DD日hh:mm")
          : "--",
        code: record.code,
        statusText: record.statusText,
        desc: record.desc,
      };
      isShowDetailModal.value = true;
    };
    /** shortcut-删除 */
    const onRecordCancel = (record: TCollectItem) => {
      console.log("onRecordCancel");
      Modal.confirm({
        title: `是否取消收藏:${lastOfArray(record.fullName)}`,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resultPublishDelete = await apiCollectDelete({
            id: record.id,
          });
          if (resultPublishDelete.err) return;
          message.success("操作成功");
          onRefreshTableData();
        },
      });
    };
    const isShowDetailModal = ref(false);
    const currenDetailInfo = ref<TDetailInfo>({});
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
      collectTotalText,
      onAddCollect,
      onRefreshTableData,
      onOther,
      onBatchCancel,
      onRecordDetail,
      onRecordCancel,
      isShowDetailModal,
      currenDetailInfo,
    };
  },
});
</script>

<style scoped>
</style>