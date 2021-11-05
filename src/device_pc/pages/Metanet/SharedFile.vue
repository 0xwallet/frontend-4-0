<template>
  <div
    class="w-full h-full"
    :style="{
      background: '#f0f2f5',
    }"
  >
    <header class="px-12 h-14 mb-6 bg-white flex items-center justify-between">
      <div
        class="flex items-center justify-center cursor-pointer"
        :style="{
          filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
        }"
        @click="onClickLogo"
      >
        <!-- TODO hover effect -->
        <XSvgIcon icon="logo" :size="28" />
      </div>
      <div
        class="
          flex-1
          font-14
          text-gray-400 text-center
          pt-1
          flex
          items-center
          justify-center
          relative
        "
      >
        📅
        <span class="mx-1">{{ insertedAtText }}</span>
        ⏳
        {{ expiredText }}
        <!-- 多语言icon -->
        <div
          class="absolute-center-y right-4"
          :style="{
            'font-size': '22px',
          }"
        >
          <XLocaleSwither class="cursor-pointer text-gray-600 localeSwitcher" />
        </div>
      </div>
      <div
        v-if="!isUserLoggedIn"
        class="flex-center cursor-pointer text-gray-600"
        @click="onClickUnLoggInUserIcon"
      >
        <XSvgIcon icon="user" :size="26" />
      </div>
      <XUserAvatar v-else class="w-6 h-6" />
    </header>
    <main class="px-20">
      <a-spin :spinning="lockPageLoading">
        <template #indicator>
          <LoadingOutlined />
        </template>
        <div
          class="bg-white rounded-xl"
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
                    <a-input
                      v-model:value="inputCode"
                      placeholder="请输入访问码"
                    />
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
                    <!-- <div class="font-12 text-gray-400 pt-1 flex items-center">
                      📅
                      <span class="mx-1">{{ insertedAtText }}</span>
                      ⏳
                      {{ expiredText }}
                    </div> -->
                    <div class="flex-1"></div>
                    <div
                      class="font-22 text-gray-500 px-1 mr-2"
                      @click="onCollectShare"
                    >
                      <a-tooltip title="收藏">
                        <StarFilled
                          v-if="isCurrentShareCollected"
                          :style="{ color: '#faad14' }"
                        />
                        <StarOutlined v-else />
                      </a-tooltip>
                    </div>
                    <div class="font-22 text-gray-500 px-2">
                      <a-tooltip title="转发">
                        <XSvgIcon
                          class="cursor-pointer"
                          icon="share"
                          :size="22"
                        />
                      </a-tooltip>
                    </div>
                  </div>
                  <!-- 功能区 -->
                  <div class="pt-3 px-3 mb-3 flex items-center">
                    <!-- 文件夹类型才显示路径 -->
                    <!-- <div v-if="isCurrentShareFolder" class="mr-2 flex items-center">
                  <template v-for="(dir, idx) in historyDir" :key="dir.dirId">
                    <a
                      :class="{
                        'text-gray-400': idx === historyDir.length - 1,
                      }"
                      @click="onUpperLevel(idx)"
                    >
                      {{ dir.dirName }}
                    </a>
                    <span
                      v-if="idx !== historyDir.length - 1"
                      class="px-2 text-gray-400"
                      >></span
                    >
                  </template>
                </div> -->
                    <div
                      ref="fileTableRef"
                      class="flex-1 flex items-center px-3 mr-2"
                      :style="{
                        height: '28px',
                        'border-radius': '50px',
                        'background-color': '#f7f7f8',
                      }"
                    >
                      <a-tooltip title="描述信息">
                        <a
                          class="mr-2"
                          href="javascript:;"
                          @click="onShowDescriptionModal"
                        >
                          <InfoCircleOutlined />
                        </a>
                      </a-tooltip>
                      <div
                        v-if="isCurrentShareFolder"
                        class="mr-2 flex-1 flex items-center"
                      >
                        <template
                          v-for="(dir, idx) in historyDir"
                          :key="dir.dirId"
                        >
                          <a
                            :class="{
                              'text-gray-400': idx === historyDir.length - 1,
                            }"
                            @click="onUpperLevel(idx)"
                          >
                            {{ dir.dirName }}
                          </a>
                          <span
                            v-if="idx !== historyDir.length - 1"
                            class="px-2 text-gray-400"
                            >></span
                          >
                        </template>
                        <!-- 点击了文件名(非文件夹),地址栏显示 -->
                        <!-- TODO -->
                        <template
                          v-if="isShowDescriptionModalFileNameInAddressBar"
                        >
                          <span class="px-2 text-gray-400">></span>
                          {{ currentDescriptionModalFileName }}
                        </template>
                      </div>
                      <div v-else class="flex-1"></div>
                      <a-tooltip title="评论">
                        <a href="javascript:;" @click="onCommentShare">
                          <EditOutlined />
                        </a>
                      </a-tooltip>
                    </div>
                    <div>
                      <!-- <a-button shape="round" class="mr-2" @click="onCollectShare">
                    <HeartFilled
                      v-if="isCurrentShareCollected"
                      :style="{ color: '#faad14' }"
                    />
                    <HeartOutlined v-else />
                    <span class="text-gray-400">{{
                      curShareCollectedCount
                    }}</span>
                  </a-button> -->
                      <a-button
                        shape="round"
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
                        shape="round"
                        :disabled="selectedRowKeys.length === 0"
                        class="mr-2"
                        @click="onBatchDownload"
                      >
                        <DownloadOutlined />
                        下载
                      </a-button>
                      <a-button
                        shape="round"
                        :disabled="selectedRowKeys.length === 0"
                        @click="onZipDownload"
                      >
                        <XSvgIcon icon="zip" :size="14" />
                        <span> 压缩下载 </span>
                      </a-button>
                      <!-- <a-button
                    shape="round"
                    :disabled="selectedRowKeys.length === 0"
                    @click="onBatchScore"
                  >
                    <HighlightOutlined />
                    评价
                  </a-button> -->
                    </div>
                  </div>
                  <!-- 表格区 -->
                  <XTableFiles
                    class="px-3"
                    rowKey="id"
                    :columns="columns"
                    :data="fileData"
                    :loading="isLoadingListData"
                    v-model:selectedRows="selectedRows"
                    v-model:selectedRowKeys="selectedRowKeys"
                  >
                    <template #name="{ record }">
                      <div class="relative flex items-center">
                        <!-- 空白就是blank 文件夹就是folder -->
                        <div class="relative flex-shrink-0">
                          <XFileTypeIcon
                            class="w-6 h-6 cursor-pointer"
                            :type="record.userFile.fileType"
                            @click="onItemIconClick(record)"
                          />
                          <div
                            v-if="isCanFilePreview(record)"
                            class="
                              absolute
                              text-white
                              bottom-0
                              font-12
                              bg-gray-400
                              opacity-70
                              left-0
                              right-0
                              text-center
                            "
                            :style="{
                              height: '14px',
                              'line-height': '14px',
                            }"
                          >
                            <div
                              class="cursor-pointer"
                              :style="{
                                transform: 'scale(.833)',
                              }"
                              @click="onItemIconClick(record)"
                            >
                              预览
                            </div>
                          </div>
                        </div>

                        <a
                          href="javascript:;"
                          class="mx-2"
                          :title="$lastOfArray(record.userFile.fullName)"
                          @click="onItemNameClick(record)"
                        >
                          {{ $lastOfArray(record.userFile.fullName) }}
                        </a>
                        <!-- class="truncate" -->
                        <div
                          class="text-overflow-2"
                          v-if="
                            cacheFormatDescription(
                              record.userFile.info.description
                            ).tagArr.length
                          "
                        >
                          <template
                            v-for="(tag, idx) in cacheFormatDescription(
                              record.userFile.info.description
                            ).tagArr"
                          >
                            <a-tag
                              v-if="tag"
                              :key="tag"
                              :color="TAG_COLOR_LIST[idx]"
                              class="mr-1"
                              >{{ tag }}</a-tag
                            >
                          </template>
                        </div>
                        <!-- hover 才显示的shortCut栏 -->
                        <!-- 非上级目录 -->
                        <div
                          class="
                            tableShortcut
                            hidden
                            inline-block
                            absolute
                            right-0
                          "
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
                          <!-- 评价 -->
                          <!-- <a-tooltip title="评价">
                        <a
                          class="shortcutButton ml-1"
                          href="javascript:;"
                          @click="onRecordScore(record)"
                          ><HighlightOutlined
                        /></a>
                      </a-tooltip> -->
                        </div>
                      </div>
                    </template>
                    <template #hash="{ record }">
                      <XTdHash
                        v-if="record.userFile && record.userFile.hash"
                        :hash="record.userFile.hash"
                      />
                    </template>
                    <template #feedBack>
                      <div class="flex">
                        <div class="flex items-center mr-2">
                          <!-- v-if="isCurrentShareCollected" -->
                          <!-- :style="{ color: '#E54148' }" -->
                          <HeartFilled class="mr-1 text-gray-500" />
                          <!-- <HeartOutlined v-else class="mr-1" /> -->
                          <!-- {{ record.collectedCount }} -->
                          66
                        </div>
                        <div class="flex items-center">
                          <CommentOutlined class="mr-1" />
                          <!-- <HeartFilled /> -->
                          <!-- {{ record.commentCount || "--" }} -->
                          66
                        </div>
                      </div>
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
                    :tableLoading="saveToMetanetModalTableLoading"
                    :confirmLoading="saveToMetanetModalConfirmLoading"
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
    </main>
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowDescriptionModal"
      :title="`描述信息-${currentDescriptionModalFileName}`"
      :footer="null"
    >
      <XMdParser v-if="currentDescription" :content="currentDescription" />
      <div v-else class="text-gray-400 text-center">暂无描述</div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  h,
  onActivated,
  onDeactivated,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  apiCollectCreateByShare,
  apiDriveSaveShareFile,
  apiGetPreviewToken,
  apiPriviewSharedFile,
  apiQueryCollectList,
  apiQueryDirSize,
  apiLoopQueryFileByDir,
  apiQuerySharedFile,
  apiSecondUpload,
  QueryShareFileItem,
  TFileItem,
} from "@/apollo/api";
import dayjs from "dayjs";
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from "vue-router";
import { message } from "ant-design-vue";
import {
  XFileTypeIcon,
  XTableFiles,
  XSvgIcon,
  XTdHash,
  XModalDir,
  XUserAvatar,
  XMdParser,
  XLocaleSwither,
} from "../../components";
import { useI18n } from "vue-i18n";
import {
  downloadFileByUrl,
  formatBytes,
  getFileType,
  lastOfArray,
  cacheFormatDescription,
  makeShareUrlByUri,
  cacheFn,
  useDelay,
  transformRawDescription,
  makePreviewImgUrl,
} from "@/utils";
import {
  ExportOutlined,
  DownloadOutlined,
  HeartFilled,
  HeartOutlined,
  HighlightOutlined,
  LoadingOutlined,
  WarningFilled,
  CommentOutlined,
  StarOutlined,
  StarFilled,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import { TDir } from "./components/FileItem.vue";
import { useBaseStore, useUserStore } from "@/store";
import { FILE_TYPE_MAP, TAG_COLOR_LIST } from "@/constants";
import ModalDetail, { TDetailInfo } from "./components/ModalDetail.vue";
import { onClickOutside } from "@vueuse/core";

type ListItem = {
  userFile: QueryShareFileItem["userFile"];
  checked: boolean;
  id: string; // 分享的id(没有就用空)
  token: string;
};

function sortByDirType(a: ListItem, b: ListItem) {
  return a.userFile?.isDir ? (b.userFile?.fullName[0] === "..." ? 1 : -1) : 1;
}

const idMapDescriptionCache = new Map<
  string,
  { fileName: string; descSource: string }
>();

export default defineComponent({
  name: "MetanetSharedFile",
  components: {
    XFileTypeIcon,
    XTableFiles,
    XSvgIcon,
    XTdHash,
    XModalDir,
    XUserAvatar,
    XMdParser,
    XLocaleSwither,
    ExportOutlined,
    DownloadOutlined,
    HeartFilled,
    HeartOutlined,
    HighlightOutlined,
    LoadingOutlined,
    WarningFilled,
    CommentOutlined,
    StarOutlined,
    StarFilled,
    InfoCircleOutlined,
    EditOutlined,
    //
    ModalDetail,
  },
  setup() {
    // 根据uri
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const baseStore = useBaseStore();
    const userStore = useUserStore();
    const currentUri = ref("");
    const currentShareToken = ref("");
    const currentShareId = ref("");
    /** 创建时间 */
    const insertedAtText = ref("");
    /** 描述弹窗的标题 */
    const currentDescriptionModalFileName = ref("");
    /** 显示的描述信息 */
    const currentDescription = ref("");
    /** 地址栏是否显示描述文件的名称 */
    const isShowDescriptionModalFileNameInAddressBar = ref(false);
    /** 设置详情弹窗的标题和内容 */
    const setCurrentDescriptionModalData = (
      id: string,
      fileName: string,
      descSource: string
    ) => {
      currentDescriptionModalFileName.value = fileName;
      currentDescription.value = descSource;
      if (!idMapDescriptionCache.has(id)) {
        idMapDescriptionCache.set(id, {
          fileName,
          descSource,
        });
      }
    };
    const setCurrentDescriptionModalDataFromCache = (id: string) => {
      const e = idMapDescriptionCache.get(id);
      if (!e) {
        throw Error(`没有找到改文件id ${id}的缓存`);
      }
      const { fileName, descSource } = e;
      currentDescriptionModalFileName.value = fileName;
      currentDescription.value = descSource;
    };
    /** 如果分享是文件夹, 这个文件夹的dirId */
    let firstFolderDirId = "0";
    const fileTableRef = ref(null);
    /** 点击除了表格的其他地方, 重置当前点击项(还原地址栏),除了地址栏的收藏icon
     *  文件夹的情况下才开启, 单文件不用变更地址栏和详情
     */
    const useClickOutSideWhenShareIsFolder = () => {
      // onClickOutside(fileTableRef, (e) => {
      //   if (!isShowDescriptionModal.value) {
      //     setTimeout(() => {
      //       // console.log("e", e.target);
      //       // 已经打开弹窗的情况下, 不重置描述弹窗内容
      //       if (isShowDescriptionModal.value) {
      //         return;
      //       }
      //       isShowDescriptionModalFileNameInAddressBar.value = false;
      //       // 设置回当前文件夹的详情
      //       const len = historyDir.value.length;
      //       if (len === 1) {
      //         // 全部文件
      //         setCurrentDescriptionModalDataFromCache(firstFolderDirId);
      //       } else {
      //         // 二/3级文件夹
      //         setCurrentDescriptionModalDataFromCache(
      //           historyDir.value.length
      //             ? lastOfArray(historyDir.value).dirId
      //             : firstFolderDirId
      //         );
      //       }
      //     }, 100);
      //   }
      // });
    };

    /** 当前这个分享的收藏数 */
    const curShareCollectedCount = ref(0);
    /** 是否正在加载列表中的数据 */
    const isLoadingListData = ref(false);
    /** 当前的分享是否收藏过 */
    const isCurrentShareCollected = ref(false);
    /** 当前的分享是否是单个文件夹 */
    const isCurrentShareFolder = ref(false);
    const userPreview = reactive({
      avatar: "",
      bio: "",
      email: "",
      username: "",
    });
    /** 用户是否登录状态 */
    const isUserLoggedIn = computed(() => {
      return userStore.isLoggedIn;
    });
    /** 检查登录转态并返回是否登录,未登录就打开登录弹窗 */
    const checkLoginStatusThenOpenModalSignIn = (): boolean => {
      if (!isUserLoggedIn.value) {
        baseStore.changeIsShowLoginModal(true);
        // router.push({
        //   name: "Login",
        //   query: {
        //     redirect: route.fullPath,
        //   },
        // });
        return true;
      }
      return false;
    };
    /** 点击logo */
    const onClickLogo = () => {
      // 1. 用户未登录就导航到登录页
      if (!isUserLoggedIn.value) {
        router.push({
          name: "Login",
        });
      } else {
        // 2. 用户登录了就导航到文件tab页
        const windowId = baseStore.getNewOpenWindowId();
        // console.log(`左菜单栏点击的,获取的还未激活的windoId,${windowId}`);
        router.push({
          name: "MetanetFile",
          query: {
            id: windowId,
            path: "~",
          },
        });
      }
    };
    /** 点击未登录状态下的usericon */
    const onClickUnLoggInUserIcon = () => {
      checkLoginStatusThenOpenModalSignIn();
      // router.push({
      //   name: "Login",
      //   query: {
      //     redirect: route.fullPath,
      //   },
      // });
    };
    const selectedRowKeys = ref<string[]>([]);
    const selectedRows = ref<ListItem[]>([]);
    /** 清除当前选中的数据 */
    const clearSelected = () => {
      selectedRows.value.length = 0;
      selectedRowKeys.value.length = 0;
    };
    const fileData = ref<ListItem[]>([]);
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
    /** 目录面包屑
     * 当点击第一个的时候是用share 的api,所以这里第一个dirId不会被用到 */
    const historyDir = ref<{ dirId: string; dirName: string }[]>([
      // { dirId: "none", dirName: "/" },
    ]);
    /** 点击上一级 */
    const onUpperLevel = (dirIdx: number) => {
      // 1. 如果点的是当前文件夹
      if (dirIdx === historyDir.value.length - 1) {
        // 1.1 如果有 描述文件栏
        if (isShowDescriptionModalFileNameInAddressBar.value) {
          isShowDescriptionModalFileNameInAddressBar.value = false;
          const _dirId = historyDir.value[dirIdx].dirId;
          setCurrentDescriptionModalDataFromCache(_dirId);
        } else if (dirIdx === 0) {
          // 1.2 如果没有 描述文件栏 且是根目录, 收起所有地址栏
          historyDir.value.length = 0;
          getSetFileData();
          setCurrentDescriptionModalDataFromCache(firstFolderDirId);
        }
      } else {
        // 2. 如果点的不是当前文件夹
        // 2.1 如果有 描述文件栏
        if (isShowDescriptionModalFileNameInAddressBar.value) {
          isShowDescriptionModalFileNameInAddressBar.value = false;
          const _dirId = historyDir.value[dirIdx].dirId;
          setCurrentDescriptionModalDataFromCache(_dirId);
        }
        historyDir.value.splice(dirIdx + 1);
        const dirId = lastOfArray(historyDir.value).dirId;
        getSetDriveList(dirId);
        setCurrentDescriptionModalDataFromCache(dirId);
      }
    };
    /** 点击文件图标 */
    const onItemIconClick = async (record: ListItem) => {
      // console.log("onItemIconClick", record);
      if (!record.userFile) return;
      const fileType = getFileType({
        isDir: record.userFile.isDir,
        fileName: lastOfArray(record.userFile.fullName),
      });
      if (/folder$/g.test(fileType)) {
        // 1.是文件夹
        // 1.1 change historyDir
        historyDir.value.push({
          dirId: record.userFile.id,
          dirName: lastOfArray(record.userFile.fullName),
        });
        getSetDriveList(record.userFile.id);
        setCurrentDescriptionModalData(
          record.userFile.id,
          lastOfArray(record.userFile.fullName),
          record.userFile.info.description || ""
        );
        isShowDescriptionModalFileNameInAddressBar.value = false;
        // 1.2 change fileData
      } else if (FILE_TYPE_MAP.image.includes(fileType)) {
        const { user, space, id: fileId, fullName } = record.userFile;
        // 分享的预览用的token 是该分享数据的token
        const token = record.token;
        const tableImgList = fileData.value.filter(
          (item) =>
            item.userFile !== null &&
            FILE_TYPE_MAP.image.includes(item.userFile.fileType ?? "")
        );
        const toPreviewList = tableImgList.map((item) => ({
          src: makePreviewImgUrl(
            token,
            item.userFile?.user.id ?? "",
            item.userFile?.space ?? "",
            item.userFile?.id ?? "",
            item.userFile?.fullName.slice(-1)[0] ?? "",
            item.userFile?.updatedAt ?? ""
          ),
          w: 0,
          h: 0,
          title: item.userFile?.info.description
            ? transformRawDescription(item.userFile?.info.description)
            : "",
        }));
        // 找出当前点击的图片的 openIndex
        const startImgIdx = tableImgList.findIndex((i) => i.id === record.id);
        // const url = `https://drive-s.owaf.io/preview/${
        //   user.id
        // }/${space.toLowerCase()}/${fileId}/${
        //   fullName.slice(-1)[0]
        // }?token=${token}&t=${dayjs(record.userFile.updatedAt).format(
        //   "YYYYMMDDHHmmss"
        // )}`;
        baseStore.setPhotoSwipeAndShow(toPreviewList, { index: startImgIdx });
      } else if (fileType === "pdf") {
        // console.log("pdf");
        const token = record.token;
        const { user, space, id: fileId, fullName } = record.userFile;
        const pdfUrl = `https://drive-s.owaf.io/preview/${
          user.id
        }/${space.toLowerCase()}/${fileId}/${
          fullName.slice(-1)[0]
        }?token=${token}&t=${dayjs(record.userFile.updatedAt).format(
          "YYYYMMDDHHmmss"
        )}`;
        window.open(pdfUrl, "_blank");
      } else {
        console.log("other-type");
      }
    };
    /** 文件是否可预览 */
    const isCanFilePreview = (record: ListItem) => {
      // 文件或pdf
      const f = record.userFile;
      if (!f) return false;
      const e = getFileType({
        isDir: f.isDir,
        fileName: lastOfArray(f.fullName),
      });
      if (FILE_TYPE_MAP.image.includes(e) || e === "pdf") {
        return true;
      }
      // 其他类型返回false
      return false;
    };
    /** 点击文件名, 地址栏显示, 设置详情数据 */
    const onItemNameClick = async (record: ListItem) => {
      // console.log("onItemNameClick");
      const e = record.userFile;
      if (!e) {
        return;
      }
      // 如果是文件夹, 就进入文件夹, 更新地址栏和详情数据
      if (e.isDir) {
        historyDir.value.push({
          dirId: e.id,
          dirName: lastOfArray(e.fullName),
        });
        getSetDriveList(e.id);
        setCurrentDescriptionModalData(
          e.id,
          lastOfArray(e.fullName),
          e.info.description || ""
        );
        isShowDescriptionModalFileNameInAddressBar.value = false;
      } else {
        // 如果是文件, 更新到地址栏, 并设置详情
        setCurrentDescriptionModalData(
          e.id,
          lastOfArray(e.fullName),
          e.info.description || ""
        );
        isShowDescriptionModalFileNameInAddressBar.value = true;
      }
    };
    /** 请求目录里面的数据 */
    const getSetDriveList = (dirId: string) => {
      const token = currentShareToken.value;
      isLoadingListData.value = true;
      apiLoopQueryFileByDir({
        dirId,
        token,
        startPage: 1,
      }).then((res) => {
        isLoadingListData.value = false;
        if (res.err || !res.data) {
          return;
        }
        fileData.value.length = 0;
        res.data.driveListFiles.forEach((item) => {
          if (!item || item.id === dirId || item.fullName.length === 0) return;
          fileData.value.push({
            id: item.id,
            checked: false,
            token: currentShareToken.value,
            userFile: {
              ...item,
              fileType: getFileType({
                isDir: item.isDir,
                fileName: lastOfArray(item.fullName),
              }),
            },
          });
        });
        fileData.value.sort(sortByDirType);
      });
    };
    /** 输入访问码后的确认 */
    const onConfirmCode = () => {
      // console.log("onConfirmCode");
      if (!inputCode.value.length) {
        // TODO 跟分享的时候一起 加入对分享码的输入校验
        message.warning("请输入访问码");
        return;
      }
      confirmLoading.value = true;
      getSetFileData().finally(() => {
        confirmLoading.value = false;
      });
    };
    const columns = [
      {
        title: t("metanet.name"),
        slots: { customRender: "name" },
        sortDirections: ["descend", "ascend"],
        sorter: (a: QueryShareFileItem, b: QueryShareFileItem) => {
          // 文件夹的排在前面
          if (a.userFile?.isDir && !b.userFile?.isDir) return 0;
          else if (!a.userFile?.isDir && b.userFile?.isDir) return 0;
          return lastOfArray(a.userFile?.fullName ?? []).localeCompare(
            lastOfArray(b.userFile?.fullName ?? [])
          );
        },
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
        sortDirections: ["descend", "ascend"],
        sorter: (a: QueryShareFileItem, b: QueryShareFileItem) => {
          // 文件夹的排在前面
          if (a.userFile?.isDir && !b.userFile?.isDir) return 0;
          else if (!a.userFile?.isDir && b.userFile?.isDir) return 0;
          const aSize = a.userFile?.info.size ?? 0;
          const bSize = b.userFile?.info.size ?? 0;
          return +aSize - +bSize;
        },
      },
      {
        title: "Hash",
        dataIndex: "hash",
        slots: { customRender: "hash" },
        width: 150,
      },
      {
        title: t("metanet.updatedAt"),
        dataIndex: "updatedAt",
        customRender: ({ record }: { record: QueryShareFileItem }) => {
          return record.userFile
            ? dayjs(record.userFile?.updatedAt).format("YYYY-MM-DD hh:mm")
            : "";
        },
        width: 180,
        sortDirections: ["descend", "ascend"],
        sorter: (a: QueryShareFileItem, b: QueryShareFileItem) => {
          // 文件夹的排在前面
          if (a.userFile?.isDir && !b.userFile?.isDir) return 0;
          else if (!a.userFile?.isDir && b.userFile?.isDir) return 0;
          return dayjs(a.userFile?.updatedAt).diff(
            dayjs(b.userFile?.updatedAt)
          );
        },
      },
      {
        title: "回馈",
        dataIndex: "feedBack",
        slots: { customRender: "feedBack" },
        width: 100,
      },
    ];
    /** 显示该分享 */
    const onShowDescriptionModal = (e: TFileItem) => {
      isShowDescriptionModal.value = true;
    };
    /** 评论该分享 */
    const onCommentShare = () => {
      message.info("TODO");
    };

    /** 是否显示描述弹窗 */
    const isShowDescriptionModal = ref(false);
    // watch(
    //   () => isShowDescriptionModal.value,
    //   (newVal) => {
    //     if (newVal === false) {
    //       currentDescription.value = "";
    //     }
    //   }
    // );
    // TODO 文件夹 支持上一级目录
    /** shortcut-下载 */
    const onRecordDownload = (record: ListItem) => {
      // if (checkLoginStatusThenOpenModalSignIn()) {
      //   return;
      // }
      // console.log("onRecordDownload", record);
      // TODO 判断有没登录
      if (!record.userFile) return;
      const { user, space, id: fileId, fullName } = record.userFile;
      const downloadToken = record.token;
      // apiGetPreviewToken().then((resultPreviewToken) => {
      if (!record.userFile) return;
      // if (resultPreviewToken.err) return;
      // const token = resultPreviewToken.data.drivePreviewToken;
      const url = `https://drive-s.owaf.io/download/${
        user.id
      }/${space.toLowerCase()}/${fileId}/${
        fullName.slice(-1)[0]
      }?token=${downloadToken}&t=${dayjs(record.userFile.updatedAt).format(
        "YYYYMMDDHHmmss"
      )}`;
      downloadFileByUrl(url, fullName.slice(-1)[0]);
      // });
    };
    /** shortcut -评价 */
    const onRecordScore = (record: ListItem) => {
      if (checkLoginStatusThenOpenModalSignIn()) {
        return;
      }
      // console.log("onRecordScore", record);
    };
    /** 批量下载 */
    const onBatchDownload = () => {
      // if (checkLoginStatusThenOpenModalSignIn()) {
      //   return;
      // }
      selectedRows.value.forEach((i) => {
        if (i.userFile && !i.userFile.isDir) {
          onRecordDownload(i);
        }
      });
    };
    /** 压缩下载 */
    const onZipDownload = () => {
      message.info("TODO");
    };
    /** 批量收藏 */
    const onCollectShare = async () => {
      if (checkLoginStatusThenOpenModalSignIn()) {
        return;
      }
      if (isCurrentShareCollected.value) {
        message.info("你已收藏过改分享");
        // const res = await apiCollectDelete({ id: currentShareId.value });
        // if (res.err || !res.data) {
        //   return;
        // }
        // isCurrentShareCollected.value = false;
        // Toast("取消收藏成功");
      } else {
        const res = await apiCollectCreateByShare({ id: currentShareId.value });
        if (res.err || !res.data) {
          return;
        }
        isCurrentShareCollected.value = true;
        curShareCollectedCount.value += 1;
        message.success("收藏成功");
      }
    };
    /** 分享到其他平台 */
    const onPlatformShare = () => {
      message.info("TODO");
    };
    /** 批量评价 */
    const onBatchScore = () => {
      if (checkLoginStatusThenOpenModalSignIn()) {
        return;
      }
      console.log("onBatchScore");
    };
    /** 获取文件信息 */
    const getSetFileData = async () => {
      isLoadingListData.value = true;
      const { data, err } = await apiQuerySharedFile({
        uri: currentUri.value,
        ...(!isCodeResolved.value
          ? {
              code: inputCode.value,
            }
          : {}),
      });
      isLoadingListData.value = false;
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
      // 注册当前分享的token
      currentShareToken.value = data.driveFindShare.token;
      currentShareId.value = data.driveFindShare.id;
      isCurrentShareFolder.value = data.driveFindShare.userFile.isDir;
      if (isCurrentShareFolder.value) {
        firstFolderDirId = data.driveFindShare.userFile.id;
        useClickOutSideWhenShareIsFolder();
      }
      // 直接注册详情
      setCurrentDescriptionModalData(
        data.driveFindShare.userFile.id,
        lastOfArray(data.driveFindShare.userFile.fullName),
        data.driveFindShare.userFile.info.description || ""
      );
      // 查询当前分享是否收藏过
      // isCurrentShareCollected
      apiQueryCollectList({ type: "SHARE" }).then((res) => {
        if (res.data) {
          isCurrentShareCollected.value = res.data.driveListCollections.some(
            (i) => i.item?.id === data.driveFindShare.id
          );
        }
      });
      curShareCollectedCount.value = data.driveFindShare.collectedCount;
      // 把用户输入过的存到sessionStorage 里
      sessionStorage.setItem(currentUri.value, inputCode.value);
      fileData.value.length = 0;
      fileData.value.push({
        // 改变fullname 和fileType
        ...data.driveFindShare,
        userFile: {
          ...data.driveFindShare.userFile,
          fullName: data.driveFindShare.userFile.fullName,
          fileType: getFileType({
            isDir: data.driveFindShare.userFile.isDir,
            fileName: lastOfArray(data.driveFindShare.userFile.fullName),
          }),
        },
        checked: false,
      });
      isValid.value = true;
      isCodeResolved.value = true;
    };
    // http://localhost:4000/#/metanet/sharedFile?uri=vQfgupqRey2465R5NCqtDg
    // vQfgupqRey2465R5NCqtDg
    // TODO 文件已经失效 userFile null
    const handleUriChange = (queryUri: string) => {
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
          const diffNow = dayjs(data.drivePreviewShare.expiredAt).diff(dayjs());
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
          insertedAtText.value = dayjs(
            data.drivePreviewShare.insertedAt
          ).format("YY-MM-DD");
          // 如果不需要访问码, 立即请求文件
          if (isCodeResolved.value === true) {
            getSetFileData().finally(() => {
              lockPageLoading.value = false;
            });
          } else if (sessionStorage.getItem(queryUri)) {
            // 如果sessionStorage 里有uri , 拿出来用
            inputCode.value = sessionStorage.getItem(queryUri) as string;
            getSetFileData().finally(() => {
              lockPageLoading.value = false;
            });
          } else {
            lockPageLoading.value = false;
          }
        });
      }
    };
    // TODO 解决两个分享页的tab 点击后数据没变的问题
    onMounted(() => {
      // console.log("onActivated-SharedFile-currentUri", currentUri);
      const queryUri = route.query.uri as string;
      if (queryUri) {
        handleUriChange(queryUri);
      }
    });
    /** 弹窗-保存到网盘 */
    function useSaveToMetanetModal() {
      const isShowSaveToMetanetModal = ref(false);
      const onSaveToMetanetModalConfirm = async () => {
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
        const targetDirId = saveToMetanetModalSelectedDir.value.dirId;
        let dir = saveToMetanetModalSelectedDir.value;
        const folderFullName = [dir.dirName];
        while (dir.parent) {
          dir = dir.parent;
          folderFullName.unshift(dir.dirName);
        }
        saveToMetanetModalConfirmLoading.value = true;
        // 根目录不用传
        if (folderFullName[0] === "全部文件") folderFullName.shift();
        await Promise.allSettled(
          saveToMetanetModalSelectedFileList.value.map((i) =>
            // apiSecondUpload({
            //   // 包含要保存的路径的文件全名数组
            //   fullName: [...folderFullName, lastOfArray(i.fullName)],
            //   description: i.info.description || "",
            //   fileHash: i.hash,
            // })
            apiDriveSaveShareFile({
              code: inputCode.value,
              fromUserFileId: i.id,
              id: currentShareId.value,
              toUserFileId: targetDirId,
            })
          )
        ).finally(() => {
          message.success("保存成功");
          saveToMetanetModalConfirmLoading.value = false;
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
      const saveToMetanetModalConfirmLoading = ref(false);
      const saveToMetanetModalTableData = reactive<TDir[]>([]);
      const saveToMetanetModalSelectedDir = ref<TDir>({
        dirId: "root",
        dirName: "全部文件",
        isExpend: true,
        parent: null,
      });
      const saveToMetanetModalSelectedFileList = ref<TFileItem[]>([]);
      const getAndSetSaveToMetanetModalTableData = () => {
        saveToMetanetModalTableLoading.value = true;
        // 2021-07-05 先递归处理所有的目录, 后续要按需加载
        apiLoopQueryFileByDir({
          fileType: "DIR",
          dirId: "root",
          startPage: 1,
        }).then(async (resultQueryFile) => {
          if (resultQueryFile.err) {
            // console.log("err", err);
            saveToMetanetModalTableLoading.value = false;
            return;
          }
          /** 根据目录id, 父目录id 去递归获取children */
          const getAndSetDirChildren = async (item: TDir) => {
            const parentId = item.parent?.dirId;
            // const [resItem, errItem] = await apiLoopQueryFileByDir({
            const resultQueryFileItem = await apiLoopQueryFileByDir({
              fileType: "DIR",
              dirId: item.dirId,
              startPage: 1,
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
                  isExpend: false,
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
                isExpend: false,
                parent: {
                  dirId: "root",
                  dirName: "全部文件",
                  isExpend: true,
                  parent: null,
                },
              })
            )
          );
          const rootDir: TDir = {
            dirId: "root",
            dirName: "全部文件",
            isExpend: true,
            parent: null,
            children: withChildrensDirList,
          };
          saveToMetanetModalTableData.push(rootDir);
          saveToMetanetModalTableLoading.value = false;
        });
      };
      /** 设置要移动的idList,操作类型 */
      const saveToMetanetModalPreAction = (itemList: TFileItem[]) => {
        if (checkLoginStatusThenOpenModalSignIn()) {
          return;
        }
        // 重置为全部文件
        saveToMetanetModalSelectedDir.value = {
          dirId: "root",
          dirName: "全部文件",
          isExpend: true,
          parent: null,
        };
        // 如果保存的目标文件夹 用户又保存到他自己的相同目录下
        saveToMetanetModalSelectedFileList.value.length = 0;
        // saveToMetanetModalSelectedFileList.value.push(...itemList);
        saveToMetanetModalSelectedFileList.value =
          saveToMetanetModalSelectedFileList.value.concat(itemList);
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
        saveToMetanetModalConfirmLoading,
        saveToMetanetModalTableData,
        saveToMetanetModalPreAction,
      };
    }
    // 手机导航后退的时候,检查有没先关闭图片预览
    onBeforeRouteLeave((to, from) => {
      if (baseStore.photoSwipe.isShow) {
        baseStore.setPhotoSwipeVisible(false);
        return false;
      }
      return true;
    });
    return {
      isCodeResolved,
      inputCode,
      isValid,
      userPreview,
      insertedAtText,
      fileTableRef,
      curShareCollectedCount,
      isCurrentShareCollected,
      isCurrentShareFolder,
      isLoadingListData,
      expiredText,
      confirmLoading,
      lockPageLoading,
      historyDir,
      onUpperLevel,
      onItemIconClick,
      isCanFilePreview,
      onItemNameClick,
      onConfirmCode,
      isUserLoggedIn,
      onClickLogo,
      onClickUnLoggInUserIcon,
      columns,
      selectedRowKeys,
      selectedRows,
      fileData,
      onShowDescriptionModal,
      onCommentShare,
      currentDescriptionModalFileName,
      currentDescription,
      isShowDescriptionModal,
      isShowDescriptionModalFileNameInAddressBar,
      onRecordDownload,
      onRecordScore,
      onBatchDownload,
      onZipDownload,
      onCollectShare,
      onPlatformShare,
      onBatchScore,
      ...useSaveToMetanetModal(),
      cacheFormatDescription,
      TAG_COLOR_LIST,
    };
  },
});
</script>

<style lang="less" scoped>
</style>