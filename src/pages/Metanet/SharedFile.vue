<template>
  <a-spin :spinning="lockPageLoading">
    <template #indicator>
      <LoadingOutlined />
    </template>
    <div
      :style="{
        'min-height': 'calc(100vh - 200px)',
        padding: 0,
      }"
    >
      <template v-if="!lockPageLoading">
        <!-- 文件有效 -->
        <template v-if="isValid">
          <template v-if="userPreview.email">
            <!-- 还没通过访问码 -->
            <div
              v-if="!isCodeResolved"
              class="flex flex-col items-center justify-center"
              :style="{
                height: 'calc(100vh - 300px)',
                width: '300px',
                margin: '0 auto',
              }"
            >
              <!-- 头像 -->
              <div
                class="
                  rounded-full
                  w-14
                  h-14
                  flex
                  items-center
                  justify-center
                  text-white text-2xl
                  mb-3
                "
                :style="{
                  background:
                    'linear-gradient(45deg, rgb(0, 172, 193), rgb(0, 213, 226))',
                }"
              >
                {{ userPreview.username[0].toUpperCase() }}
              </div>
              <!-- 名字 -->
              <div class="w-full text-center mb-4 font-semibold">
                {{ userPreview.username }}
              </div>
              <!-- inputcode -->
              <div class="w-full mb-4">
                <a-input v-model:value="inputCode" placeholder="请输入访问码" />
              </div>
              <!-- 提取文件 -->
              <div class="w-full mb-4">
                <a-button
                  block
                  type="primary"
                  :loading="confirmLoading"
                  @click="onConfirmCode"
                  >提取文件</a-button
                >
              </div>
              <!-- 文件有效期 -->
              <div class="w-full text-center font-12 text-gray-400">
                {{ expiredText }}
              </div>
            </div>
            <!-- 通过访问码控制了 -->
            <div v-else>
              <div
                class="flex items-center p-3"
                :style="{
                  'border-bottom': '1px solid #eee',
                }"
              >
                <div
                  class="
                    rounded-full
                    w-10
                    h-10
                    flex
                    items-center
                    justify-center
                    text-white text-xl
                    mr-2
                  "
                  :style="{
                    background:
                      'linear-gradient(45deg, rgb(0, 172, 193), rgb(0, 213, 226))',
                  }"
                >
                  {{ userPreview.username[0].toUpperCase() }}
                </div>
                <div class="font-semibold font-16 mr-2">
                  {{ userPreview.username }} 给你分享了文件
                </div>
                <div class="font-12 text-gray-400 pt-1">{{ expiredText }}</div>
              </div>
              <!-- 功能区 -->
              <div class="pt-3 px-5 mb-3 flex items-center">
                <div class="mr-2">全部文件</div>
                <div class="flex-1"></div>
                <div>
                  <a-button
                    :disabled="selectedRowKeys.length === 0"
                    @click="
                      saveToMetanetModalPreAction(
                        selectedRows.map((i) => i.userFile)
                      )
                    "
                    class="mr-2"
                  >
                    <ExportOutlined />
                    保存到网盘
                  </a-button>
                  <a-button
                    :disabled="selectedRowKeys.length === 0"
                    class="mr-2"
                    @click="onBatchDownload"
                  >
                    <DownloadOutlined />
                    下载
                  </a-button>
                  <a-button
                    :disabled="selectedRowKeys.length === 0"
                    class="mr-2"
                    @click="onBatchCollect"
                  >
                    <HeartOutlined />
                    收藏
                  </a-button>
                  <a-button
                    :disabled="selectedRowKeys.length === 0"
                    @click="onBatchScore"
                  >
                    <HighlightOutlined />
                    评价
                  </a-button>
                </div>
              </div>
              <!-- 表格区 -->
              <XTableFiles
                class="px-3"
                rowKey="id"
                :columns="columns"
                :data="fileData"
                v-model:selectedRows="selectedRows"
                v-model:selectedRowKeys="selectedRowKeys"
              >
                <template #name="{ record }">
                  <div class="relative">
                    <!-- 空白就是blank 文件夹就是folder -->
                    <XFileTypeIcon
                      class="w-6 h-6"
                      :type="record.userFile.fileType"
                    />
                    <a
                      href="javascript:;"
                      class="ml-2"
                      :title="record.userFile.fullName[0]"
                    >
                      {{ record.userFile.fullName[0] }}
                    </a>
                    <!-- hover 才显示的shortCut栏 -->
                    <!-- 非上级目录 -->
                    <div
                      class="tableShortcut hidden inline-block absolute right-0"
                    >
                      <!-- 保存到网盘 -->
                      <a-tooltip title="保存到网盘">
                        <a
                          class="shortcutButton ml-1"
                          href="javascript:;"
                          @click="
                            saveToMetanetModalPreAction([record.userFile])
                          "
                          ><ExportOutlined
                        /></a>
                      </a-tooltip>
                      <!-- 下载 -->
                      <a-tooltip title="下载">
                        <a
                          class="shortcutButton ml-1"
                          href="javascript:;"
                          @click="onRecordDownload(record)"
                          ><DownloadOutlined
                        /></a>
                      </a-tooltip>
                      <!-- 收藏 -->
                      <a-tooltip title="收藏">
                        <a
                          class="shortcutButton ml-1"
                          href="javascript:;"
                          @click="onRecordCollect(record)"
                          ><HeartOutlined
                        /></a>
                      </a-tooltip>
                      <!-- 评价 -->
                      <a-tooltip title="评价">
                        <a
                          class="shortcutButton ml-1"
                          href="javascript:;"
                          @click="onRecordScore(record)"
                          ><HighlightOutlined
                        /></a>
                      </a-tooltip>
                    </div>
                  </div>
                </template>
                <template #hash="{ record }">
                  <XTdHash
                    v-if="record.userFile && record.userFile.hash"
                    :hash="record.userFile.hash"
                  />
                </template>
              </XTableFiles>
              <!-- 弹窗 保存到网盘 -->
              <XModalDir
                rowKey="dirId"
                title="保存到网盘"
                v-model:visible="isShowSaveToMetanetModal"
                @ok="onSaveToMetanetModalConfirm"
                :rowClassName="saveToMetanetModalTableRowClassName"
                :columns="saveToMetanetTableColumns"
                :dataSource="saveToMetanetModalTableData"
                :customRow="saveToMetanetModalTableCustomRow"
                :loading="saveToMetanetModalTableLoading"
              />
            </div>
          </template>
        </template>
        <!-- 文件无效 -->
        <template v-else>
          <!-- color: #faad14; -->
          <div class="pt-40 flex flex-col items-center justify-center">
            <WarningFilled
              class="mb-4"
              :style="{
                'font-size': '80px',
                color: '#faad14',
              }"
            />
            <div class="font-semibold font-20">文件已删除或已过期</div>
          </div>
          <!-- <a-result class="pt-30" status="warning" title="文件已过期或被删除"> -->
          <!-- <template #extra>
              <a-button key="console" type="primary">Go Console</a-button>
            </template> -->
          <!-- </a-result> -->
        </template>
      </template>
    </div>
  </a-spin>
</template>

<script lang="ts">
import {
  defineComponent,
  h,
  onActivated,
  onDeactivated,
  reactive,
  ref,
  watch,
} from "vue";
import {
  apiGetPreviewToken,
  apiPriviewSharedFile,
  apiQueryFileByDir,
  apiQuerySharedFile,
  apiSecondUpload,
  QueryShareFileItem,
  TFileItem,
} from "@/apollo/api";
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { XFileTypeIcon, XTableFiles, XTdHash, XModalDir } from "@/components";
import { useI18n } from "vue-i18n";
import {
  downloadFileByUrl,
  formatBytes,
  getFileType,
  lastOfArray,
} from "@/utils";
import {
  ExportOutlined,
  DownloadOutlined,
  HeartOutlined,
  HighlightOutlined,
  LoadingOutlined,
  WarningFilled,
} from "@ant-design/icons-vue";
import { TDir } from "./components/FileItem.vue";
import { useBaseStore, useUserStore } from "@/store";

export default defineComponent({
  name: "MetanetSharedFile",
  components: {
    XFileTypeIcon,
    XTableFiles,
    XTdHash,
    XModalDir,
    ExportOutlined,
    DownloadOutlined,
    HeartOutlined,
    HighlightOutlined,
    LoadingOutlined,
    WarningFilled,
  },
  setup() {
    // 根据uri
    const { t } = useI18n();
    const route = useRoute();
    const baseStore = useBaseStore();
    const userStore = useUserStore();
    const currentUri = ref("");
    const userPreview = reactive({
      avatar: "",
      bio: "",
      email: "",
      username: "",
    });
    /** 检查登录转态并返回是否登录,未登录就打开登录弹窗 */
    const checkLoginStatusAndOpenModal = (): boolean => {
      if (!userStore.isLoggedIn || !userStore.token) {
        baseStore.changeIsShowLoginModal(true);
        return false;
      }
      return true;
    };
    const selectedRowKeys = ref<string[]>([]);
    const selectedRows = ref<QueryShareFileItem[]>([]);
    const fileData = ref<QueryShareFileItem[]>([]);
    /**  通过访问码控制了没 */
    const isCodeResolved = ref(false);
    /** 用户输入的访问码 */
    const inputCode = ref("");
    /** 是否有效(用户未删除文件,有效期内) */
    const isValid = ref(true);
    /** *后过期*/
    const expiredText = ref("");
    const confirmLoading = ref(false);
    /** 锁住页面的显示,因为从页面打开到请求preview 中需要时间判断是否resolve了访问码 */
    const lockPageLoading = ref(true);
    /** 输入访问码后的确认 */
    const onConfirmCode = () => {
      console.log("onConfirmCode");
      if (!inputCode.value.length) {
        // TODO 跟分享的时候一起 加入对分享码的输入校验
        message.warning("请输入访问码");
        return;
      }
      confirmLoading.value = true;
      getAndSetFileData().then(() => {
        confirmLoading.value = false;
      });
    };
    const columns = [
      {
        title: t("metanet.name"),
        slots: { customRender: "name" },
      },
      {
        title: t("metanet.size"),
        dataIndex: "userFile.info.size",
        width: 100,
        customRender: ({
          record,
          text,
        }: {
          record: QueryShareFileItem;
          text: string;
        }) => {
          return record.userFile?.isDir ? "" : formatBytes(+text);
        },
      },
      {
        title: "Hash",
        dataIndex: "hash",
        slots: { customRender: "hash" },
        width: 150,
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
        title: "收藏",
        dataIndex: "collectedCount",
        width: 80,
      },
    ];
    // TODO 文件夹 支持上一级目录
    /** shortcut-下载 */
    const onRecordDownload = (record: QueryShareFileItem) => {
      if (checkLoginStatusAndOpenModal() === false) {
        return;
      }
      console.log("onRecordDownload", record);
      // TODO 判断有没登录
      if (!record.userFile) return;
      const { user, space, id: fileId, fullName } = record.userFile;
      apiGetPreviewToken().then((resultPreviewToken) => {
        if (resultPreviewToken.err) return;
        const token = resultPreviewToken.data.drivePreviewToken;
        const url = `https://drive-s.owaf.io/download/${
          user.id
        }/${space.toLowerCase()}/${fileId}/${
          fullName.slice(-1)[0]
        }?token=${token}`;
        downloadFileByUrl(url, fullName.slice(-1)[0]);
      });
    };
    /** shortcut -收藏 */
    const onRecordCollect = (record: QueryShareFileItem) => {
      if (checkLoginStatusAndOpenModal() === false) {
        return;
      }
      console.log("onRecordCollect", record);
    };
    /** shortcut -评价 */
    const onRecordScore = (record: QueryShareFileItem) => {
      if (checkLoginStatusAndOpenModal() === false) {
        return;
      }
      console.log("onRecordScore", record);
    };
    /** 批量下载 */
    const onBatchDownload = () => {
      if (checkLoginStatusAndOpenModal() === false) {
        return;
      }
      selectedRows.value.forEach((i) => {
        if (i.userFile && !i.userFile.isDir) {
          onRecordDownload(i);
        }
      });
    };
    /** 批量收藏 */
    const onBatchCollect = () => {
      if (checkLoginStatusAndOpenModal() === false) {
        return;
      }
      console.log("onBatchCollect");
    };
    /** 批量评价 */
    const onBatchScore = () => {
      if (checkLoginStatusAndOpenModal() === false) {
        return;
      }
      console.log("onBatchScore");
    };
    /** 获取文件信息 */
    const getAndSetFileData = async () => {
      const { data, err } = await apiQuerySharedFile({
        uri: currentUri.value,
        ...(!isCodeResolved.value
          ? {
              code: inputCode.value,
            }
          : {}),
      });
      if (err || !data) return;
      if (data.driveFindShare === null) {
        message.warning("访问码错误");
        return;
      }
      if (data.driveFindShare.userFile === null) {
        // 用户 删除原文件
        console.log("userFile为null,来源用户删除了该文件");
        isValid.value = false;
        return;
      }
      // 把用户输入过的存到sessionStorage 里
      sessionStorage.setItem(currentUri.value, inputCode.value);
      fileData.value.push({
        // 改变fullname 和fileType
        ...data.driveFindShare,
        userFile: {
          ...data.driveFindShare.userFile,
          fullName: data.driveFindShare.userFile.fullName.slice(-1),
          fileType: getFileType({
            isDir: data.driveFindShare.userFile.isDir,
            fileName: lastOfArray(data.driveFindShare.userFile.fullName),
          }),
        },
      });
      isValid.value = true;
      isCodeResolved.value = true;
    };
    // http://localhost:4000/#/metanet/sharedFile?uri=vQfgupqRey2465R5NCqtDg
    // vQfgupqRey2465R5NCqtDg
    // TODO 文件已经失效 userFile null
    onActivated(() => {
      console.log("onActivated-SharedFile-currentUri", currentUri);
      const queryUri = route.query.uri as string;
      if (queryUri) {
        if (currentUri.value !== queryUri) {
          fileData.value.length = 0;
          currentUri.value = queryUri;
          apiPriviewSharedFile({ uri: queryUri }).then(({ data, err }) => {
            if (err || !data || !data.drivePreviewShare) {
              isValid.value = false;
              lockPageLoading.value = false;
              return;
            }
            const { userPreview: resUserPreview } = data.drivePreviewShare;
            // 注册 分享来源用户的信息
            userPreview.avatar = resUserPreview.avatar || "";
            userPreview.bio = resUserPreview.bio;
            userPreview.email = resUserPreview.email;
            userPreview.username = resUserPreview.username;
            // 如果文件需要访问码, 则 访问码控制false,等待后面输入
            isCodeResolved.value = !data.drivePreviewShare.needCode;
            const diffNow = dayjs(data.drivePreviewShare.expiredAt).diff(
              dayjs()
            );
            // 如果文件过期了
            if (diffNow < 0) {
              isValid.value = false;
              lockPageLoading.value = false;
              return;
            }
            expiredText.value = `${dayjs(data.drivePreviewShare.expiredAt).diff(
              dayjs(),
              "days"
            )}天后过期`;
            // 如果不需要访问码, 立即请求文件
            if (isCodeResolved.value === true) {
              getAndSetFileData().finally(() => {
                lockPageLoading.value = false;
              });
            } else if (sessionStorage.getItem(queryUri)) {
              // 如果sessionStorage 里有uri , 拿出来用
              inputCode.value = sessionStorage.getItem(queryUri) as string;
              getAndSetFileData().finally(() => {
                lockPageLoading.value = false;
              });
            } else {
              lockPageLoading.value = false;
            }
          });
        }
      }
    });

    /** 弹窗-保存到网盘 */
    function useSaveToMetanetModal() {
      const isShowSaveToMetanetModal = ref(false);
      const onSaveToMetanetModalConfirm = () => {
        console.log("onSaveToMetanetModalConfirm");
        // 如果是文件夹 不能保存到相同文件夹内
        const checkSameParent = (item: TFileItem) => {
          if (!item.isDir) return false;
          let dir: null | TDir = saveToMetanetModalSelectedDir.value;
          while (dir) {
            if (dir.dirId === item.id) return true;
            dir = dir.parent;
          }
          return false;
        };
        if (
          saveToMetanetModalSelectedFileList.value.some((i) =>
            checkSameParent(i)
          )
        ) {
          message.warning("目标文件夹已包含要保存的文件!");
          return;
        }
        let dir = saveToMetanetModalSelectedDir.value;
        const folderFullName = [dir.dirName];
        while (dir.parent) {
          dir = dir.parent;
          folderFullName.unshift(dir.dirName);
        }
        // 根目录不用传
        if (folderFullName[0] === "root") folderFullName.shift();
        return Promise.all(
          saveToMetanetModalSelectedFileList.value.map((i) =>
            apiSecondUpload({
              // 包含要保存的路径的文件全名数组
              fullName: [...folderFullName, lastOfArray(i.fullName)],
              description: i.info.description || "",
              fileHash: i.hash,
            })
          )
        ).finally(() => {
          message.success("保存成功");
          isShowSaveToMetanetModal.value = false;
        });
      };
      const saveToMetanetModalTableRowClassName = (record: TDir) => {
        return record.dirId === saveToMetanetModalSelectedDir.value.dirId
          ? "copyMoveModalRow copyMoveModalRowActive"
          : "copyMoveModalRow";
      };
      /** 设置自定义行onClick 事件 */
      const saveToMetanetModalTableCustomRow = (record: TDir) => ({
        onClick: (e: {
          currentTarget: {
            dataset: {
              rowKey: string;
            };
          };
        }) => {
          console.log("ee", record);
          // console.log(e.currentTarget.dataset.rowKey);
          saveToMetanetModalSelectedDir.value = record;
        },
      });
      const saveToMetanetTableColumns = [
        {
          title: "Name",
          slots: { customRender: "name" },
          key: "name",
        },
      ];
      const saveToMetanetModalTableLoading = ref(false);
      const saveToMetanetModalTableData = reactive<TDir[]>([]);
      const saveToMetanetModalSelectedDir = ref<TDir>({
        dirId: "root",
        dirName: "全部文件",
        parent: null,
      });
      const saveToMetanetModalSelectedFileList = ref<TFileItem[]>([]);
      const getAndSetSaveToMetanetModalTableData = () => {
        saveToMetanetModalTableLoading.value = true;
        // 2021-07-05 先递归处理所有的目录, 后续要按需加载
        apiQueryFileByDir({ dirId: "root" }).then(async (resultQueryFile) => {
          if (resultQueryFile.err) {
            // console.log("err", err);
            saveToMetanetModalTableLoading.value = false;
            return;
          }
          /** 根据目录id, 父目录id 去递归获取children */
          const getAndSetDirChildren = async (item: TDir) => {
            const parentId = item.parent?.dirId;
            // const [resItem, errItem] = await apiQueryFileByDir({
            const resultQueryFileItem = await apiQueryFileByDir({
              dirId: item.dirId,
            });
            // console.log("目录res", item.dirId, item.dirName, resItem);
            if (resultQueryFileItem.err) return item;
            // 排除 非目录文件/ 根目录/ 自身/ 父目录(上一级)
            const afterFilterList =
              resultQueryFileItem.data.driveListFiles.filter(
                (i): i is TFileItem =>
                  i !== null &&
                  i.isDir &&
                  !["root", item.dirId, parentId].includes(i.id)
              );
            // console.log("afterFilterList", afterFilterList);
            if (!afterFilterList.length) return item;
            item.children = await Promise.all(
              afterFilterList.map((i) =>
                getAndSetDirChildren({
                  dirId: i.id,
                  dirName: lastOfArray(i.fullName),
                  parent: item,
                })
              )
            );
            return item;
          };
          // res.data.driveListFiles 提取文件夹的出来
          const resIsDirList = resultQueryFile.data.driveListFiles.filter(
            (i): i is TFileItem => i !== null && i.isDir && i.id !== "root"
          );
          const withChildrensDirList = await Promise.all(
            resIsDirList.map((i) =>
              getAndSetDirChildren({
                dirId: i.id,
                dirName: lastOfArray(i.fullName),
                parent: {
                  dirId: "root",
                  dirName: "root",
                  parent: null,
                },
              })
            )
          );
          const rootDir: TDir = {
            dirId: "root",
            dirName: t("metanet.allFiles"),
            parent: null,
            children: withChildrensDirList,
          };
          saveToMetanetModalTableData.push(rootDir);
          saveToMetanetModalTableLoading.value = false;
        });
      };
      /** 设置要移动的idList,操作类型 */
      const saveToMetanetModalPreAction = (item: TFileItem[]) => {
        if (checkLoginStatusAndOpenModal() === false) {
          return;
        }
        // 重置为全部文件
        saveToMetanetModalSelectedDir.value = {
          dirId: "root",
          dirName: "全部文件",
          parent: null,
        };
        // 如果保存的目标文件夹 用户又保存到他自己的相同目录下
        saveToMetanetModalSelectedFileList.value.length = 0;
        saveToMetanetModalSelectedFileList.value.push(...item);
        isShowSaveToMetanetModal.value = true;
        // 每次打开弹窗都获取最新的文件夹数据
        saveToMetanetModalTableData.length = 0;
        getAndSetSaveToMetanetModalTableData();
      };
      return {
        isShowSaveToMetanetModal,
        onSaveToMetanetModalConfirm,
        saveToMetanetModalTableRowClassName,
        saveToMetanetModalTableCustomRow,
        saveToMetanetTableColumns,
        saveToMetanetModalTableLoading,
        saveToMetanetModalTableData,
        saveToMetanetModalPreAction,
      };
    }
    return {
      isCodeResolved,
      inputCode,
      isValid,
      userPreview,
      expiredText,
      confirmLoading,
      lockPageLoading,
      onConfirmCode,
      columns,
      selectedRowKeys,
      selectedRows,
      fileData,
      onRecordDownload,
      onRecordCollect,
      onRecordScore,
      onBatchDownload,
      onBatchCollect,
      onBatchScore,
      ...useSaveToMetanetModal(),
    };
  },
});
</script>

<style scoped>
</style>