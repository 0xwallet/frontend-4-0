<template>
  <div>
    <!-- 功能区 height 32px-->
    <div class="relative h-8 flex items-center mb-3 pr-1">
      <a-button
        :disabled="selectedRowKeys.length === 0"
        class="mr-2"
        type="primary"
        @click="onBatchCopy"
      >
        <CopyOutlined />
        复制分享
      </a-button>
      <a-button
        :disabled="selectedRowKeys.length === 0"
        class="mr-2"
        type="danger"
        @click="onBatchDelete"
      >
        <CloseCircleOutlined />
        取消分享
      </a-button>
      <div>
        <!-- 刷新按钮 -->
        <a-tooltip :title="$t('metanet.refresh')">
          <a
            href="javascript:;"
            class="inline-block"
            @click="onRefreshTableData()"
          >
            <SyncOutlined :spin="tableLoading" />
          </a>
        </a-tooltip>
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
          <XFileTypeIcon class="w-6 h-6" :type="record.userFile.fileType" />
          <a
            href="javascript:;"
            class="ml-2"
            :title="record.userFile.fullName[0]"
            @click="onClickTableItemName(record)"
          >
            {{ record.userFile.fullName[0] }}
          </a>
          <!-- hover 才显示的shortCut栏 -->
          <!-- 非上级目录 -->
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
                @click="onRecordCopyShare(record)"
                ><CopyOutlined
              /></a>
            </a-tooltip>
            <!-- 删除 -->
            <a-tooltip title="取消分享">
              <a
                class="shortcutButton ml-1 ant-color-danger"
                href="javascript:;"
                @click="onRecordCancel(record)"
                ><CloseCircleOutlined
              /></a>
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #validTime="{ record }">
        <a
          href="javascript:;"
          class="ant-color-blue-6"
          @click="onRecordEdit(record)"
        >
          {{
            `${dayjs(record.expiredAt).diff(
              dayjs(record.insertedAt),
              "days"
            )} 天内`
          }}
        </a>
      </template>
      <template #code="{ record }">
        <a
          href="javascript:;"
          class="ant-color-blue-6"
          @click="onRecordEdit(record)"
          >{{ record.code }}</a
        >
      </template>
      <!-- <template #action="{ record }">
        <a-dropdown placement="bottomRight">
          <div class="text-center">
            <EllipsisOutlined />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordDetail(record)"
              >
                <InfoCircleOutlined />
                详情
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordCopyShare(record)"
              >
                <CopyOutlined />
                复制
              </a-menu-item>
              <a-menu-item
                class="px-4 flex items-center text-red-500"
                @click="onRecordCancel(record)"
              >
                <CloseCircleOutlined />
                取消分享
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template> -->
    </XTableFiles>
    <!-- 详情卡片 -->
    <ModalDetail v-model:visible="isShowDetailModal" :detail="currenDetailInfo">
    </ModalDetail>
    <!-- 修改表格单项 有效期,访问码 -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowShareFileModal"
      :title="`修改有效期/访问码 - ${currentShareFile.name}`"
      :confirmLoading="shareFileModalConfirmLoading"
      @ok="onShareFileModalConfirm"
      @cancel="onResetShareFileModalForm"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="有效期" v-bind="shareFileValidateInfos.expired">
          <a-input-number
            :maxlength="30"
            :min="1"
            v-model:value="shareFileModelRef.expired"
          />
        </a-form-item>
        <a-form-item
          :label="$t('metanet.createFileType')"
          v-bind="shareFileValidateInfos.type"
        >
          <a-radio-group v-model:value="shareFileModelRef.type">
            <a-radio value="PUBLIC">公开</a-radio>
            <a-radio value="PRIVATE">私密</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="访问码"
          v-if="shareFileModelRef.type === 'PRIVATE'"
          v-bind="shareFileValidateInfos.code"
        >
          <a-input :maxlength="6" v-model:value="shareFileModelRef.code" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  createVNode,
  defineComponent,
  onActivated,
  reactive,
  ref,
  toRaw,
  watch,
} from "vue";
import {
  SyncOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  CloseCircleOutlined,
  EllipsisOutlined,
} from "@ant-design/icons-vue";
import { XFileTypeIcon, XTableFiles } from "@/components";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import {
  apiDeleteShare,
  apiEditShare,
  apiQueryShareFileList,
  apiShareCreate,
  QueryShareFileItem,
  TFileItem,
} from "@/apollo/api";
import { message, Modal } from "ant-design-vue";
import {
  formatBytes,
  getFileLocation,
  getFileType,
  getShareInfoByUriAndCode,
  lastOfArray,
} from "@/utils";
import { cloneDeep } from "lodash-es";
import ModalDetail, { TDetailInfo } from "./components/ModalDetail.vue";
import { useUserStore } from "@/store";
import { useClipboard } from "@vueuse/core";
import { useRoute } from "vue-router";
import { RuleObject } from "ant-design-vue/lib/form/interface";
import { useForm } from "@ant-design-vue/use";

type TTableShareFileItem = QueryShareFileItem & {
  userFile: TFileItem;
};
type TShareCreate = {
  type: "PUBLIC" | "PRIVATE";
  expired: number;
  code?: string;
};

export default defineComponent({
  name: "MetanetShare",
  components: {
    XFileTypeIcon,
    SyncOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    EllipsisOutlined,
    XTableFiles,
    ModalDetail,
  },
  setup() {
    const { t } = useI18n();
    const tableLoading = ref(false);
    const userStore = useUserStore();
    const route = useRoute();
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
        slots: { customRender: "validTime" },
        // customRender: ({ record }: { record: TTableShareFileItem }) => {
        //   const begin = dayjs(record.insertedAt);
        //   const end = dayjs(record.expiredAt);
        //   // console.log(
        //   //   "diff--",
        //   //   record,
        //   //   end.diff(begin, "day"),
        //   //   end.diff(begin, "days")
        //   // );
        //   return `${end.diff(begin, "days")} 天内`;
        // },
        width: 120,
      },
      {
        title: t("metanet.code"),
        // dataIndex: "code",
        slots: { customRender: "code" },
        width: 100,
      },
      {
        title: "收藏",
        dataIndex: "collectedCount",
        width: 80,
      },
      // {
      //   title: t("metanet.action"),
      //   fixed: "right",
      //   width: 60,
      //   slots: { customRender: "action" },
      // },
    ];
    const selectedRows = ref<TTableShareFileItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const tableData = ref<TTableShareFileItem[]>([]);
    /** 刷新表格数据 */
    const onRefreshTableData = async (keepSelected = false) => {
      // console.log("keeo", keepSelected);
      if (keepSelected === false) {
        // console.log("clear");
        selectedRows.value.length = 0;
        selectedRowKeys.value.length = 0;
      }
      tableLoading.value = true;
      // apiQueryShareFileList().then((result) => {
      const result = await apiQueryShareFileList();
      tableLoading.value = false;
      if (result.err) {
        return;
      }
      tableData.value = result.data.driveListShares
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
          obj.code = obj.code ?? "无";
          return obj;
        });
    };
    onActivated(() => {
      console.log("onActivated-分享页");
      // 这里根据文件应用跳转过来的id 去默认选中表格
      const paramsId = route.params.id as string;
      if (paramsId) {
        selectedRowKeys.value.push(paramsId);
      }
      onRefreshTableData(true) // first run
        .then(() => {
          if (paramsId) {
            // 默认选中
            const found = tableData.value.find((i) => i.id === paramsId);
            if (found) selectedRows.value.push(found);
            console.log(
              "根据路由params默认选中",
              selectedRowKeys,
              selectedRows
            );
          }
        });
    });
    /** 表格里名字的点击 */
    const onClickTableItemName = (record: TTableShareFileItem) => {
      console.log("clicktablename", record);
    };
    /** 批量复制 */
    const onBatchCopy = () => {
      console.log("onBatchDelete");
      const len = selectedRows.value.length;
      if (!len) {
        message.warning("请先勾选分享");
        return;
      }
      const multipleShareInfo = selectedRows.value
        .map((i, idx) =>
          getShareInfoByUriAndCode({
            uri: i.uri,
            code: i.code || "",
            username: userStore.username,
            withHead: true,
            withCode: true,
            withTail: idx === len - 1, // 最后一项才有尾巴: -xxx的分享
          })
        )
        .join("\n");
      console.log("复制多个分享信息", multipleShareInfo);
      useClipboard({ read: false })
        .copy(multipleShareInfo)
        .then(() => message.success(t("metanet.copySuccess")));
    };
    /** 批量删除 */
    const onBatchDelete = () => {
      console.log("onBatchDelete");
      const len = selectedRows.value.length;
      if (!len) {
        message.warning("请先勾选分享");
        return;
      }
      Modal.confirm({
        // title: "Do you Want to delete these items?",
        title: `是否取消${len}个分享?`,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resList = await Promise.all(
            selectedRows.value.map(({ id }) => apiDeleteShare({ id }))
          );
          resList.forEach(
            (resItem) => resItem.err && message.warning(resItem.err.message)
          );
          message.success(t("metanet.deleted"));
          onRefreshTableData();
        },
      });
    };
    /** 表格里单项详情 */
    const onRecordDetail = (record: TTableShareFileItem) => {
      console.log("onRecordDetail", record);
      // 链接	Hash	类型	位置	修改时间	创建时间	描述(直接显示)
      currenDetailInfo.value = {
        type: getFileType({
          isDir: record.userFile.isDir,
          fileName: lastOfArray(record.userFile.fullName),
        }),
        location: getFileLocation(record.userFile.fullName),
        size: formatBytes(+record.userFile.info.size),
        shareLink: record.uri,
        shareHash: record.userFile.hash,
        insertedAt: dayjs(record.insertedAt).format("YYYY年MM月DD日hh:mm"),
        updatedAt: dayjs(record.updatedAt).format("YYYY年MM月DD日hh:mm"),
        desc: record.userFile.info.description || "无",
      };
      isShowDetailModal.value = true;
    };
    /** 复制链接和分享码 */
    const onRecordCopyShare = (record: TTableShareFileItem) => {
      const shareInfo = getShareInfoByUriAndCode({
        uri: record.uri,
        code: record.code || "",
        username: userStore.username,
        withHead: false,
        withCode: false,
        withTail: false,
      });
      // console.log("表格单项-复制链接", shareInfo);
      useClipboard({ read: false })
        .copy(shareInfo)
        .then(() => message.success(t("metanet.copySuccess")));
    };
    /** 表格里单项取消分享 */
    const onRecordCancel = (record: TTableShareFileItem) => {
      console.log("onRecordCancel", record);
      const fileName = record.userFile.fullName[0];
      Modal.confirm({
        title: `是否取消分享${fileName}`,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          const resultDeleteShare = await apiDeleteShare({
            id: record.id,
          });
          if (resultDeleteShare.err) return;
          message.success("操作成功");
          onRefreshTableData();
        },
      });
    };
    /** 表格单项 编辑有效期/ 访问码 */
    const onRecordEdit = (record: TTableShareFileItem) => {
      currentShareFile.name = lastOfArray(record.userFile.fullName);
      currentShareFile.id = record.id; // 分享的id , 并非userFile 里的id
      shareFileModelRef.type = record.code === "无" ? "PUBLIC" : "PRIVATE";
      shareFileModelRef.expired = dayjs(record.expiredAt).diff(
        dayjs(record.insertedAt),
        "days"
      );
      shareFileModelRef.code =
        record.code === "无" ? "" : (record.code as string);
      isShowShareFileModal.value = true;
    };

    /** 详情-分享 */
    const currenDetailInfo = ref<TDetailInfo>({});
    /** 是否显示详情卡片 */
    const isShowDetailModal = ref(false);
    // 关闭弹窗时清空数据
    watch(
      () => isShowDetailModal.value,
      (val) => {
        if (val === false) {
          currenDetailInfo.value = {};
        }
      }
    );

    const isShowShareFileModal = ref(false);
    /** 正在分享的文件 */
    const currentShareFile = reactive({
      name: "", // 文件(夹)名
      id: "", // 文件id
    });
    const shareFileModelRef: TShareCreate = reactive({
      type: "PUBLIC",
      expired: 7, // 有效期
      code: "", // 如果是私密文件,则需要访问码 后面传参数的时候如果还是空字符串则不要传这个参数
    });
    /** 弹窗 分享文件 */
    function useShareFileModal() {
      const shareFileRulesRef = reactive({
        expired: [
          {
            required: true,
            type: "number",
            message: "请输入有效数字",
          },
        ],
        code: [
          {
            required: true,
            asyncValidator: (rule: RuleObject, val: string) => {
              // console.log("code-validate", rule, val);
              return new Promise<void>((resolve, reject) => {
                // 如果是私有但还没写验证码,则报错
                if (shareFileModelRef.type === "PRIVATE" && val.length === 0) {
                  reject("请输入访问码");
                } else {
                  resolve();
                }
              });
            },
          },
        ],
      });
      const {
        resetFields,
        validate,
        validateInfos: shareFileValidateInfos,
      } = useForm(shareFileModelRef, shareFileRulesRef);
      const shareFileModalConfirmLoading = ref(false);
      const onShareFileModalConfirm = async () => {
        try {
          await validate();
          // 验证通过
          const { type, expired, code } = shareFileModelRef;
          shareFileModalConfirmLoading.value = true;
          const resultShareCreate = await apiEditShare({
            id: currentShareFile.id,
            expiredAfterDays: expired,
            code: type === "PRIVATE" ? (code as string) : "",
          });
          shareFileModalConfirmLoading.value = false;
          if (resultShareCreate.err) {
            message.warning(resultShareCreate.err.message);
            return;
          }
          message.success("修改成功");
          isShowShareFileModal.value = false;
          // 开始显示分享成功后的分享信息弹窗 -end
          onResetShareFileModalForm();
          onRefreshTableData();
        } catch (error) {
          console.log(error);
        }
      };
      const onResetShareFileModalForm = () => {
        const ori = toRaw(shareFileModelRef);
        ori.type = "PUBLIC";
        ori.expired = 7;
        ori.code = "";
        currentShareFile.name = "";
        currentShareFile.id = "";
      };
      return {
        isShowShareFileModal,
        currentShareFile,
        shareFileModelRef,
        shareFileValidateInfos,
        shareFileModalConfirmLoading,
        onShareFileModalConfirm,
        onResetShareFileModalForm,
      };
    }
    return {
      dayjs,
      tableLoading,
      selectedRows,
      selectedRowKeys,
      columns,
      tableData,
      onClickTableItemName,
      onRefreshTableData,
      onBatchCopy,
      onBatchDelete,
      onRecordDetail,
      onRecordCopyShare,
      onRecordCancel,
      onRecordEdit,
      currenDetailInfo,
      isShowDetailModal,
      ...useShareFileModal(),
    };
  },
});
</script>

<style scoped>
</style>