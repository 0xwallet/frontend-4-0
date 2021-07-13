<template>
  <div>
    <div class="mb-3">
      <!-- 刷新按钮 -->
      <a-button class="mr-2" @click="onRefreshTableData">
        <SyncOutlined :spin="tableLoading" />
        {{ $t("metanet.refresh") }}
      </a-button>
      <a-button-group class="mr-2" v-show="selectedRows.length">
        <a-button type="danger" @click="onBatchDelete">
          {{ $t("metanet.delete") }}
        </a-button>
      </a-button-group>
    </div>
    <!-- 表格 -->
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
      </template>
      <template #version="{ record }">
        <a href="javascript:;">
          {{ record.current.version }}
        </a>
      </template>
      <template #action="{ record }">
        <a-button size="small" type="danger" @click="onRecordDelete(record)">
          {{ $t("metanet.delete") }}
        </a-button>
      </template>
    </TableFiles>
  </div>
</template>

<script lang="ts">
import { createVNode, defineComponent, ref } from "vue";
import { SyncOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { XFileTypeIcon } from "@/components";
import TableFiles from "./TableFiles.vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import {
  apiPublishDelete,
  apiQueryPublishList,
  QueryPublishItem,
} from "@/apollo/api";
import { message, Modal } from "ant-design-vue";
import { getFileType } from "@/utils";
import { cloneDeep } from "lodash-es";

export default defineComponent({
  components: {
    XFileTypeIcon,
    SyncOutlined,
    TableFiles,
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
      },
      {
        title: t("metanet.state"),
        customRender: ({ record }: { record: QueryPublishItem }) => {
          return record.isCollected ? "已收藏" : "";
        },
        width: 100,
      },
      {
        title: t("metanet.action"),
        fixed: "right",
        width: 60,
        slots: { customRender: "action" },
      },
    ];
    const selectedRows = ref<QueryPublishItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<QueryPublishItem[]>([]);
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
    onRefreshTableData(); // first run
    /** 表格里名字的点击 */
    const onClickTableItemName = (record: QueryPublishItem) => {
      console.log("clicktablename", record);
    };
    /** 批量删除 */
    const onBatchDelete = () => {
      console.log("onBatchDelete");
      const len = selectedRows.value.length;
      if (!len) {
        message.warning(t("metanet.errorPleaseSelect"));
        return;
      }
      Modal.confirm({
        // title: "Do you Want to delete these items?",
        title: `是否删除${len}个发布?`,
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
    /** 表格里单项详情 */
    const onRecordInfo = (record: QueryPublishItem) => {
      console.log("onRecordInfo", record);
    };
    /** 表格里单项删除 */
    const onRecordDelete = (record: QueryPublishItem) => {
      console.log("onRecordDelete", record);
      const fileName = record.current.userFile.fullName[0];
      Modal.confirm({
        title: `是否删除发布:${fileName}`,
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
    return {
      tableLoading,
      selectedRows,
      selectedRowKeys,
      columns,
      tableData,
      onClickTableItemName,
      onRefreshTableData,
      onBatchDelete,
      onRecordInfo,
      onRecordDelete,
    };
  },
});
</script>

<style scoped>
</style>