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
        <XFileTypeIcon class="w-6 h-6" :type="record.userFile.fileType" />
        <a
          href="javascript:;"
          class="ml-2"
          :title="record.userFile.fullName[0]"
          @click="onClickTableItemName(record)"
        >
          {{ record.userFile.fullName[0] }}
        </a>
      </template>
      <template #action="{ record }">
        <a-button-group size="small">
          <a-button @click="onRecordInfo(record)">
            {{ $t("metanet.detail") }}
          </a-button>
          <a-button type="danger" @click="onRecordDelete(record)">
            {{ $t("metanet.delete") }}
          </a-button>
        </a-button-group>
      </template>
    </TableFiles>
  </div>
</template>

<script lang="ts">
import { createVNode, defineComponent, reactive, ref } from "vue";
import { SyncOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { XFileTypeIcon } from "@/components";
import TableFiles from "./TableFiles.vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import {
  apiDeleteShare,
  apiQueryShareFile,
  QueryShareFileItem,
  TFileItem,
} from "@/apollo/api";
import { message, Modal } from "ant-design-vue";
import { getFileType } from "@/utils";
import { cloneDeep } from "lodash-es";

type TTableShareFileItem = QueryShareFileItem & {
  userFile: TFileItem;
};

export default defineComponent({
  components: {
    XFileTypeIcon,
    SyncOutlined,
    TableFiles,
  },
  setup() {
    const { t } = useI18n();
    const tableLoading = ref(false);
    // 名称	创建时间	有效期	访问码	操作
    const columns = [
      {
        title: t("metanet.name"),
        slots: { customRender: "name" },
      },
      {
        title: t("metanet.createAt"),
        dataIndex: "insertedAt",
        customRender: ({ text }: { text: string }) => {
          return text ? dayjs(text).format("YYYY-MM-DD hh:mm") : "";
        },
        width: 180,
      },
      {
        title: t("metanet.validTime"),
        customRender: ({ record }: { record: TTableShareFileItem }) => {
          const begin = dayjs(record.insertedAt);
          const end = dayjs(record.expiredAt);
          // console.log(
          //   "diff--",
          //   end.diff(begin, "day"),
          //   end.diff(begin, "days")
          // );
          return `${end.diff(begin, "days")} 天内`;
        },
        width: 120,
      },
      {
        title: t("metanet.code"),
        dataIndex: "code",
        width: 100,
      },
      {
        title: t("metanet.action"),
        fixed: "right",
        width: 60,
        slots: { customRender: "action" },
      },
    ];
    const selectedRows = ref<TTableShareFileItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<TTableShareFileItem[]>([]);
    /** 刷新表格数据 */
    const onRefreshTableData = () => {
      selectedRows.value.length = 0;
      selectedRowKeys.value.length = 0;
      tableLoading.value = true;
      apiQueryShareFile().then(([res, err]) => {
        tableLoading.value = false;
        if (err || !res) {
          return;
        }
        tableData.value = res.data.driveListShares
          .filter((i): i is TTableShareFileItem => i.userFile !== null)
          .map((i) => {
            const obj = cloneDeep(i);
            // 保留最后一项作为名称
            obj.userFile.fullName = i.userFile.fullName.slice(-1);
            // 获取类型
            obj.userFile.fileType = getFileType({
              isDir: obj.userFile.isDir,
              fileName: obj.userFile.fullName[0],
            });
            return obj;
          });
      });
    };
    onRefreshTableData(); // first run
    /** 表格里名字的点击 */
    const onClickTableItemName = (record: TTableShareFileItem) => {
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
        title: `是否删除${len}个分享?`,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resList = await Promise.all(
            selectedRows.value.map(({ id }) => apiDeleteShare({ id }))
          );
          resList.forEach(([r, e]) => e && message.warning(e.message));
          message.success(t("metanet.deleted"));
          onRefreshTableData();
        },
      });
    };
    /** 表格里单项详情 */
    const onRecordInfo = (record: TTableShareFileItem) => {
      console.log("onRecordInfo", record);
    };
    /** 表格里单项删除 */
    const onRecordDelete = (record: TTableShareFileItem) => {
      console.log("onRecordDelete", record);
      const fileName = record.userFile.fullName[0];
      Modal.confirm({
        title: `是否删除${fileName}`,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const [res, err] = await apiDeleteShare({
            id: record.id,
          });
          if (err || !res) return;
          message.success(t("metanet.deleted"));
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