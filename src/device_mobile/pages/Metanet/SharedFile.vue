<template>
  <div
    class="w-full h-full"
    :style="{
      background: '#404A66',
    }"
  >
    <div v-if="lockPageLoading" class="w-full h-full relative">
      <div class="absolute inset-0 bg-white opacity-10"></div>
      <div class="absolute top-16 inset-x-0 text-center pt-28">
        <van-loading size="40" color="#0094ff" vertical>加载中...</van-loading>
      </div>
    </div>
    <div v-else class="w-full h-full relative">
      <header class="h-11 px-4 flex items-center text-white">
        <div @click="onClickLogo">
          <div v-html="svgStr"></div>
        </div>
        <div
          class="
            flex-1
            text-center
            flex
            items-center
            justify-center
            font-14
            relative
          "
        >
          <!-- <img
            class="w-4 h-4 mr-1"
            src="~@/assets/images/calendar.png"
            alt=""
          /> -->
          📅
          <span class="mr-1">{{ insertedAtText }}</span>
          <!-- <img
            class="w-4 h-4 mr-1"
            src="~@/assets/images/hourglass.png"
            alt=""
          /> -->
          ⏳
          <span>{{ expiredText }}</span>
          <div
            class="absolute-center-y right-4"
            :style="{
              'font-size': '22px',
            }"
          >
            <MLocaleSwither class="cursor-pointer font-20 text-white" />
          </div>
        </div>
        <div @click="onUserIconClick" class="flex-center">
          <!-- 头像 -->
          <div
            v-if="isUserLoggedIn"
            class="
              rounded-full
              w-5
              h-5
              flex
              items-center
              justify-center
              text-white
              font-12
            "
            :style="{
              border: '.5px solid white',
              background:
                'linear-gradient(45deg, rgb(0, 172, 193), rgb(0, 213, 226))',
            }"
          >
            {{ myInfo.userName[0].toUpperCase() }}
          </div>
          <van-icon v-else color="#fff" size="20px" name="user-circle-o" />
        </div>
        <!-- <div @click="onShowRightPopup">
          <van-icon
            :style="{
              transform: 'rotate(90deg)',
            }"
            size="24"
            color="white"
            name="more-o"
          />
        </div> -->
      </header>
      <template v-if="!isValid">
        <div>
          <van-empty image="error" description="分享已过期或已被取消" />
        </div>
      </template>
      <template v-if="isValid">
        <div
          class="absolute bg-white pt-10"
          :style="{
            top: '100px',
            bottom: '40px',
            left: '16px',
            right: '16px',
            'border-radius': '15px',
          }"
        >
          <div
            class="
              absolute
              inline-block
              w-7
              h-7
              flex
              items-center
              justify-center
              font-18
            "
            @click="onCollect"
            :style="{
              top: '-36px',
              left: 0,
            }"
          >
            <van-icon
              v-if="isCurrentShareCollected"
              name="star"
              color="orange"
            />
            <van-icon color="#fff" v-else name="star-o" />
          </div>
          <div
            class="
              absolute
              inline-block
              px-1
              w-7
              h-7
              flex
              items-center
              justify-center
            "
            @click="onCollect"
            :style="{
              top: '-36px',
              right: 0,
              color: 'white',
            }"
          >
            <MSvgIcon icon="share" :size="18" />
          </div>

          <!-- 头像 -->
          <div
            class="
              absolute
              rounded-full
              w-16
              h-16
              flex
              items-center
              justify-center
              text-white text-2xl
              mb-3
            "
            :style="{
              border: '1px solid white',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              background:
                'linear-gradient(45deg, rgb(0, 172, 193), rgb(0, 213, 226))',
            }"
          >
            {{ userPreview.username[0].toUpperCase() }}
          </div>
          <div class="text-center font-semibold font-20 mx-3 mb-2">
            {{ userPreview.username }}
          </div>
          <div class="text-gray-400 text-center"></div>
          <template v-if="!isCodeResolved">
            <div class="px-6 mb-4">
              <van-field
                class="rounded-full"
                :style="{
                  border: '1px solid #E6E6E6',
                  'text-align': 'center',
                }"
                v-model="inputCode"
                input-align="center"
                placeholder="请输入访问码"
              />
            </div>
            <div class="px-6">
              <van-button
                block
                class="h-12"
                :style="{
                  'border-radius': '999px',
                }"
                size="normal"
                type="primary"
                :loading="isLoadingConfirmCode"
                :disabled="inputCode.length === 0"
                @click="onConfirmCode"
              >
                提取文件
              </van-button>
            </div>
          </template>
          <template v-else>
            <div
              ref="fileTableRef"
              class="mx-1 rounded-full"
              :style="{
                padding: '2px 0px',
                border: '1px solid #f2f2f2',
              }"
            >
              <div v-if="isCurrentShareFolder" class="px-2 font-semibold">
                <!-- <div v-else>全部文件/3200/所发生的</div> -->
                <div class="flex items-center justify-center h-6">
                  <van-icon
                    size="16px"
                    class="mr-2.5"
                    name="info-o"
                    @click="onShowDescriptionPopup"
                    color="#404A66"
                  />
                  <div
                    class="
                      flex-1 flex
                      items-center
                      whitespace-nowrap
                      overflow-hidden overflow-x-scroll
                    "
                    :style="{
                      transition: 'max-width .3s ease-in',
                      'max-width': shouldCollapseHistoryDirBar ? '0px' : '100%',
                    }"
                  >
                    <template v-for="(dir, idx) in historyDir" :key="dir.dirId">
                      <div
                        class="historyDirItem"
                        :class="{
                          'text-gray-400': idx === historyDir.length - 1,
                        }"
                        @click="onUpperLevel(idx)"
                      >
                        {{ dir.dirName }}
                      </div>
                      <span
                        v-if="idx !== historyDir.length - 1"
                        class="px-2 text-gray-400"
                        >></span
                      >
                    </template>
                    <template v-if="isShowDescriptionModalFileNameInAddressBar">
                      <div class="historyDirItem">
                        <span class="px-2 text-gray-400">></span>
                        {{ currentDescriptionModalFileName }}
                      </div>
                    </template>
                  </div>
                  <van-icon
                    :class="{
                      'ml-2.5': !shouldCollapseHistoryDirBar,
                    }"
                    v-if="isUserLoggedIn"
                    color="#404A66"
                    size="16px"
                    name="edit"
                  />
                </div>
              </div>
              <!-- 如果不是文件夹, 信息图标 , 登录后加评论图标 -->
              <div v-else class="flex items-center justify-center h-6">
                <!-- TODO detailInfo -->
                <van-icon
                  color="#404A66"
                  size="16px"
                  class="mr-2"
                  name="info-o"
                  @click="onShowDescriptionPopup"
                />
                <!-- 登录后显示评论按钮 -->
                <van-icon
                  v-if="isUserLoggedIn"
                  color="#404A66"
                  size="16px"
                  name="edit"
                />
              </div>
            </div>

            <!-- 文件列表 -->
            <div
              class="mt-1 relative"
              :style="{
                overflow: 'hidden',
                'overflow-y': 'scroll',
                height: 'calc(100% - 80px)',
              }"
            >
              <van-loading
                v-if="isLoadingListData"
                class="absolute top-6 listLoading"
                size="36px"
              />
              <template v-if="fileData.length === 0">
                <!-- <div class="pt-4 pl-4 text-gray-400 text-center">空文件夹</div> -->
                <van-empty description="空文件夹" />
              </template>
              <template v-else>
                <div
                  class="px-3 py-2 flex items-center fileItem"
                  v-for="record in fileData"
                  :key="record.id"
                >
                  <div class="mr-2 relative" @click="onItemIconClick(record)">
                    <MFileTypeIcon
                      class="w-9 h-9"
                      :type="record.userFile.fileType"
                    />
                    <div
                      v-if="isCanFilePreview(record)"
                      class="
                        absolute
                        text-white
                        bottom-0
                        font-12
                        bg-gray-400
                        opacity-60
                        left-0
                        right-0
                        text-center
                      "
                    >
                      预览
                    </div>
                  </div>
                  <div
                    class="flex-1 text-overflow-3 mr-2"
                    @click="onItemNameClick(record)"
                  >
                    <div class="font-medium text-overflow-2">
                      {{ lastOfArray(record.userFile.fullName) }}
                    </div>
                    <div class="font-12 text-gray-400 text-overflow-2">
                      <template v-if="record.userFile.info.description">
                        <template
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
                            <van-tag
                              v-if="tag"
                              :key="tag"
                              :color="TAG_COLOR_LIST[idx]"
                              class="mr-1"
                              >{{ tag }}</van-tag
                            >
                          </template>
                        </template>
                      </template>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center font-12 mb-1">
                      <van-icon class="text-gray-500" size="14px" name="like" />
                      <span>66</span>
                    </div>
                    <div class="flex items-center font-12">
                      <van-icon color="#404A66" size="14px" name="chat-o" />
                      <span>66</span>
                    </div>
                  </div>
                  <div class="w-8 flex justify-end">
                    <div
                      v-if="!record.checked"
                      class="bg-gray-300 rounded-full w-2 h-2 mr-1.5"
                      @click="record.checked = true"
                    ></div>
                    <van-checkbox
                      v-else
                      checked-color="#404A66"
                      v-model="record.checked"
                    />
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
        <!-- 工具栏 -->
        <transition name="no-mode-fade">
          <MFooterBar v-if="selectedRows.length">
            <div class="flex items-center">
              <!-- background-color: #E1F4FF; color: #06A7FF; -->
              <!-- 下载 -->
              <!-- <div
                class="rounded-full w-12 h-12 flex-center mr-4"
                :style="{
                  'background-color': 'rgba(64, 74, 102,.2)',
                  color: '#404A66',
                }"
                @click="onDownload"
              >
                <MSvgIcon icon="download" :size="24" />
              </div> -->
              <van-button
                round
                :style="{
                  'background-color': 'rgba(64, 74, 102,.2)',
                  color: '#404A66',
                  border: 'none',
                }"
                class="h-12 w-12 mr-4 rounded-full"
                @click="onDownload"
                :loading="isLoadingDownloadData"
                color="#404A66"
              >
                <MSvgIcon icon="download" :size="24" />
              </van-button>
              <!-- background-color: #E1F4FF; color: #06A7FF; -->
              <!-- 压缩下载 -->
              <div
                class="rounded-full w-12 h-12 flex-center"
                :style="{
                  'background-color': 'rgba(64, 74, 102,.2)',
                  color: '#404A66',
                }"
              >
                <MSvgIcon icon="zip" :size="24" />
              </div>
            </div>

            <!-- 保存 -->
            <van-button
              round
              type="primary"
              class="h-12 w-32 font-semibold font-15 justify-self-end"
              @click="saveToMetanetModalPreAction"
              :loading="isLoadingDirData"
              color="#404A66"
              >保存到网盘</van-button
            >
          </MFooterBar>
        </transition>
      </template>
    </div>
    <!-- 保存到目标文件夹弹窗 -->
    <van-popup
      v-if="isValid"
      v-model:show="popupState.isShow"
      round
      position="bottom"
    >
      <van-cascader
        title="请选择目标文件夹"
        :field-names="{
          text: 'dirName',
          value: 'dirId',
          children: 'children',
        }"
        v-model="popupState.dirId"
        :options="dirData"
        close-icon="success"
        @close="onClosePopup"
        @change="onChangePopup"
      />
    </van-popup>
    <!-- 点击的文件的全部描述信息 -->
    <van-popup
      round
      class="rounded p-4 font-14"
      v-model:show="isShowDescriptionPopup"
      @close="onCloseDescriptionPopup"
      :style="{
        width: '300px',
      }"
    >
      <!-- 标题 -->
      <div
        class="font-semibold text-center font-16 mb-2 text-overflow-3"
        :style="{
          'margin-top': '-8px',
        }"
      >
        {{ `${currentDescriptionModalFileName}` }}
      </div>
      <div
        :style="{
          'max-height': 'calc(100vh - 200px)',
          overflow: 'scroll',
        }"
      >
        <MMdParser v-if="currentDescription" :content="currentDescription" />
        <div v-else class="text-gray-400 text-center">无描述信息</div>
      </div>
    </van-popup>
    <!-- 右边工具栏 -->
    <!-- <van-popup
      v-model:show="isShowRightPopup"
      position="right"
      :style="{ height: '100%' }"
    >
      <div class="p-4 w-40 font-medium">
        <div @click="onCloseRightPopup" class="text-right mb-2">
          <van-icon name="cross" size="22px" />
        </div>
        <div
          v-if="isValid"
          @click="onCollect"
          class="py-3 w-20 flex items-center"
        >
          <van-icon class="mr-2" size="20px" name="star-o" />
          收藏
        </div>
        <div
          @click="onLogIn"
          v-if="!isUserLoggedIn"
          class="py-3 w-20 flex items-center"
        >
          <van-icon class="mr-2" size="20px" name="user-circle-o" />
          登入
        </div>
        <div
          @click="onLogOut"
          v-if="isUserLoggedIn"
          class="py-3 w-20 flex items-center"
        >
          <van-icon class="mr-2" size="20px" name="revoke" />
          登出
        </div>
      </div>
    </van-popup> -->
    <!-- 底部预览pdf弹窗 -->
    <van-popup
      v-model:show="isShowBottomPopup"
      position="bottom"
      :style="{ height: '100%' }"
    >
      <div class="h-14 flex items-center justify-between van-hairline--bottom">
        <div class="font-16 font-semibold pl-4">
          {{ currentPreviewPdfName }}
        </div>
        <div @click="onCloseBottomPopup" class="p-4">
          <van-icon name="cross" size="22px" />
        </div>
      </div>
      <div
        v-if="isLoadingPdf"
        class="absolute top-16 inset-x-0 text-center pt-28"
      >
        <van-loading size="40" color="#0094ff" vertical>加载中...</van-loading>
      </div>
      <div
        v-else
        class="overflow-auto"
        :style="{
          height: 'calc(100% - 3.5rem)',
        }"
        id="pdfCanvas"
      ></div>
    </van-popup>
  </div>
</template>

<script lang="ts">
import {
  apiCollectCreateByShare,
  apiCollectDelete,
  apiDriveSaveShareFile,
  apiGetPreviewToken,
  apiPriviewSharedFile,
  apiQueryCollectList,
  apiLoopQueryFileByDir,
  apiQuerySharedFile,
  apiSecondUpload,
  QueryShareFileItem,
  TFileItem,
} from "@/apollo/api";
import {
  getFileType,
  lastOfArray,
  formatBytes,
  useSvgWhiteLogo,
  cacheFormatDescription,
  DescObj,
  cacheFn,
  downloadFileByUrl,
  useDelay,
  transformRawDescription,
  makeFileUrl,
} from "@/utils";
import dayjs from "dayjs";
import { Dialog, Toast } from "vant";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import {
  MFileTypeIcon,
  MSvgIcon,
  MMdParser,
  MLocaleSwither,
  MFooterBar,
} from "../../components";
import { useBaseStore, useUserStore } from "@/store";
import { FILE_TYPE_MAP, TAG_COLOR_LIST } from "@/constants";
import pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { onClickOutside } from "@vueuse/core";

type SelectedItem = {
  id: string;
  token: string;
};
type TDir = {
  dirId: string;
  dirName: string;
  parent: null | TDir;
  children?: TDir[];
};
type ListItem = {
  userFile: QueryShareFileItem["userFile"];
  checked: boolean;
  id: string; // 分享的id(没有就用空)
  token: string;
};
type DetailInfo = {
  name: string;
  type: string;
  size: string;
  insertedAt: string;
  updatedAt: string;
  desc: DescObj;
};

const DETAIL_INFO_MAP = {
  name: "名称",
  type: "类型",
  size: "大小",
  insertedAt: "创建时间",
  updatedAt: "更新时间",
  desc: "描述",
};

function sortByDirType(a: ListItem, b: ListItem) {
  return a.userFile?.isDir ? (b.userFile?.fullName[0] === "..." ? 1 : -1) : 1;
}

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

/** 文件夹详情缓存,dirId作为key */
const idMapDescriptionCache = new Map<
  string,
  { fileName: string; descSource: string }
>();

export default defineComponent({
  components: {
    MFileTypeIcon,
    MSvgIcon,
    MMdParser,
    MLocaleSwither,
    MFooterBar,
  },
  setup() {
    // 登录和未登录的
    // 未登录的是可以看的,但是点击功能后导航去登录页,登录完再返回来
    const svgStr = useSvgWhiteLogo();
    const baseStore = useBaseStore();
    const lockPageLoading = ref(true);
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const isValid = ref(true);
    const currentUri = ref("");
    const currentShareToken = ref("");
    const currentShareId = ref("");
    /** 当前的分享是否是单个文件夹 */
    const isCurrentShareFolder = ref(false);
    /** 选中的文件 */
    // const selectedRows = ref<SelectedItem[]>([]);
    const selectedRows = computed(() =>
      fileData.value.filter((record) => record.checked)
    );
    /** 用户输入的访问码 */
    const inputCode = ref("");
    const userPreview = reactive({
      avatar: "",
      bio: "",
      email: "",
      username: "",
    });
    /**  通过访问码控制了没 */
    const isCodeResolved = ref(false);
    /** *后过期*/
    const expiredText = ref("");
    /** 创建时间 */
    const insertedAtText = ref("");
    /** 当前这个分享的收藏数 */
    const curShareCollectedCount = ref(0);
    /** 是否正在加载列表中的数据 */
    const isLoadingListData = ref(false);
    const fileData = ref<ListItem[]>([]);
    const isLoadingConfirmCode = ref(false);
    /** 当前的分享是否收藏过 */
    const isCurrentShareCollected = ref(false);
    /** 点击提取文件 */
    const onConfirmCode = () => {
      if (!inputCode.value.length) {
        Toast("请输入访问码");
        return;
      }
      isLoadingConfirmCode.value = true;
      getSetFileData().finally(() => {
        isLoadingConfirmCode.value = false;
      });
    };
    //  name: lastOfArray(e.fullName),
    //     type: getFileType({
    //       isDir: e.isDir,
    //       fileName: lastOfArray(e.fullName),
    //     }),
    //     size: formatBytes(+showSize),
    //     insertedAt: dayjs(e.insertedAt).format("YYYY年MM月DD日hh:mm"),
    //     updatedAt: dayjs(e.updatedAt).format("YYYY年MM月DD日hh:mm"),
    //     desc: cacheFormatDescription(e.info.description || ""),

    const isUserLoggedIn = computed(() => userStore.isLoggedIn);
    /** 检查未登录并跳转到登录页 */
    const checkLoginStatusThenOpenPopupLogin = () => {
      if (!isUserLoggedIn.value) {
        baseStore.changeIsShowLoginModal(true);
        // router.push({
        //   name: "Login",
        //   query: { redirect: route.fullPath },
        // });
        return true;
      }
      return false;
    };
    const myInfo = computed(() => {
      const userName = userStore.username;
      return { userName };
    });
    /** logo的点击 */
    const onClickLogo = () => {
      if (!isUserLoggedIn.value) {
        router.push({
          name: "Login",
        });
      } else {
        // 已经登录就跳转到account
        router.push("/account");
      }
    };
    /** header 右边头像的点击 */
    const onUserIconClick = () => {
      if (checkLoginStatusThenOpenPopupLogin()) {
        return;
      }
      // 已经登录就跳转到account
      router.push("/account");
    };
    /** 收藏 */
    const onCollect = async () => {
      if (checkLoginStatusThenOpenPopupLogin()) {
        return;
      }
      if (isCurrentShareCollected.value) {
        Toast("取消收藏TODO");
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
        Toast("收藏成功!");
      }
    };
    const isLoadingDownloadData = ref(false);
    /** 下载 */
    const onDownload = () => {
      // if (checkLoginStatusThenOpenPopupLogin()) {
      //   return;
      // }
      // console.log("onDownload");
      selectedRows.value.forEach((record) => {
        if (!record.userFile) return;
        const {
          user,
          fullName,
          space,
          id: fileId,
          updatedAt,
        } = record.userFile;
        const downloadToken = record.token;
        // apiGetPreviewToken().then((resultPreviewToken) => {
        // if (resultPreviewToken.err) return;
        useDelay(100).then(() => {
          if (!record.userFile) return;
          // const token = resultPreviewToken.data.drivePreviewToken;
          // const url = `https://drive-s.owaf.io/download/${
          //   user.id
          // }/${space.toLowerCase()}/${fileId}/${
          //   fullName.slice(-1)[0]
          // }?token=${downloadToken}&t=${dayjs(record.userFile.updatedAt).format(
          //   "YYYYMMDDHHmmss"
          // )}`;
          const url = makeFileUrl({
            urlType: "download",
            token: downloadToken,
            userId: user.id,
            space: space.toLowerCase(),
            fileId,
            fileName: fullName.slice(-1)[0],
            updateAt: updatedAt,
          });

          downloadFileByUrl({
            url,
            fileName: fullName.slice(-1)[0],
            onBeforeFetch: () => {
              isLoadingDownloadData.value = true;
            },
            onAfterFetch: () => {
              isLoadingDownloadData.value = false;
            },
          });
        });
        // });
      });
    };
    /** 保存到网盘 */
    const saveToMetanetModalPreAction = () => {
      if (checkLoginStatusThenOpenPopupLogin()) {
        return;
      }
      getSetSaveToMetanetModalTableData().then(() => {
        // open popup
        popupState.isShow = true;
        // 清空上一次的选择
        clearPopupSelectedDir();
      });
      // console.log("saveToMetanetModalPreAction");
    };
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
          shouldCollapseHistoryDirBar.value = true;
          useDelay(300).then(() => {
            historyDir.value.length = 0;
          });
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
    const dirData = ref<TDir[]>([]);
    const isLoadingDirData = ref(false);
    /** 递归请求设置目录数据 */
    const getSetSaveToMetanetModalTableData = () => {
      return new Promise<void>((resolve) => {
        dirData.value.length = 0;
        isLoadingDirData.value = true;
        // 2021-07-05 先递归处理所有的目录, 后续要按需加载
        apiLoopQueryFileByDir({
          fileType: "DIR",
          dirId: "root",
          startPage: 1,
        }).then(async (resultQueryFile) => {
          if (resultQueryFile.err) {
            // console.log("err", err);
            isLoadingDirData.value = false;
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
            dirName: "全部文件",
            parent: null,
            children: withChildrensDirList,
          };
          dirData.value.push(rootDir);
          isLoadingDirData.value = false;
          resolve();
        });
      });
    };
    const popupState = reactive<{
      isShow: boolean;
      dirId: string;
      dirFullName: string[];
    }>({
      isShow: false,
      dirId: "",
      dirFullName: [],
    });
    /** 清空上一次目标文件夹选择 */
    const clearPopupSelectedDir = () => {
      popupState.dirId = "";
      popupState.dirFullName = [];
    };
    const onChangePopup = ({
      selectedOptions,
    }: {
      selectedOptions: { dirId: string; dirName: string }[];
    }) => {
      // console.log("onChangePopup", selectedOptions);
      popupState.dirFullName = selectedOptions.map((i) => i.dirName);
    };
    const onClosePopup = () => {
      // console.log("关闭弹窗", popupState);
      popupState.isShow = false;
      if (popupState.dirId) {
        Dialog.confirm({
          message: `是否保存到"${popupState.dirFullName.join("/")}"?`,
          beforeClose: (action) =>
            new Promise((resolve) => {
              // 如果是取消操作,提前退出
              if (action !== "confirm") {
                resolve(true);
                return;
              }
              const folderFullName = popupState.dirFullName.slice(1); // 不用传第一个根目录
              Promise.all(
                selectedRows.value.map((i) => {
                  if (!i.userFile) return;
                  // return apiSecondUpload({
                  //   // 包含要保存的路径的文件全名数组
                  //   fullName: [
                  //     ...folderFullName,
                  //     lastOfArray(i.userFile.fullName),
                  //   ],
                  //   description: i.userFile.info.description || "",
                  //   fileHash: i.userFile.hash || "",
                  // });
                  return apiDriveSaveShareFile({
                    code: inputCode.value,
                    fromUserFileId: i.userFile.id,
                    id: currentShareId.value,
                    toUserFileId: popupState.dirId,
                  });
                })
              ).finally(() => {
                Toast.success("保存成功");
                resolve(true);
              });
            }),
        });
      }
    };
    /**  */
    /** 右边的弹层 */
    // function useRightPopup() {
    //   const isShowRightPopup = ref(false);
    //   const onShowRightPopup = () => {
    //     isShowRightPopup.value = true;
    //   };
    //   const onCloseRightPopup = () => {
    //     isShowRightPopup.value = false;
    //   };
    //   const onLogIn = () => {
    //     router.push({
    //       name: "Login",
    //       query: { redirect: route.fullPath },
    //     });
    //   };
    //   const onLogOut = () => {
    //     localStorage.clear();
    //     window.location.reload();
    //   };
    //   return {
    //     isShowRightPopup,
    //     onShowRightPopup,
    //     onCloseRightPopup,
    //     onLogIn,
    //     onLogOut,
    //   };
    // }
    /** 是否正在加载pdf */
    const isLoadingPdf = ref(false);
    const isShowBottomPopup = ref(false);
    /** 当前预览的pdf的文件名 */
    const currentPreviewPdfName = ref("");
    /** 底部的弹层 */
    function useBottomPopup() {
      const onShowBottomPopup = () => {
        isShowBottomPopup.value = true;
      };
      const onCloseBottomPopup = () => {
        isShowBottomPopup.value = false;
        currentPreviewPdfName.value = "";
      };
      return {
        isLoadingPdf,
        isShowBottomPopup,
        currentPreviewPdfName,
        onShowBottomPopup,
        onCloseBottomPopup,
      };
    }
    /** 当前打开的第一个文件夹的id */
    let firstFolderDirId = "0";
    // const onFinishPopup = () => {
    //   console.log("onFinishPopup", popupState);
    // };
    /** 获取文件信息 */
    const getSetFileData = async () => {
      isLoadingListData.value = true;
      const { data, err } = await apiQuerySharedFile({
        uri: currentUri.value,
        ...(!isCodeResolved.value || inputCode.value
          ? {
              code: inputCode.value,
            }
          : {}),
      });
      isLoadingListData.value = false;
      if (err || !data) return;
      if (data.driveFindShare === null) {
        Toast("访问码错误");
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
      const e = data.driveFindShare.userFile;
      if (isCurrentShareFolder.value) {
        firstFolderDirId = data.driveFindShare.userFile.id;
        useClickOutSideWhenShareIsFolder();
      }
      // 直接注册详情
      setCurrentDescriptionModalData(
        e.id,
        lastOfArray(e.fullName),
        e.info.description || ""
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
          fullName: data.driveFindShare.userFile.fullName.slice(-1),
          fileType: getFileType({
            isDir: data.driveFindShare.userFile.isDir,
            fileName: lastOfArray(data.driveFindShare.userFile.fullName),
          }),
        },
        checked: false,
      });
      // console.log("fileData", fileData);
      isValid.value = true;
      isCodeResolved.value = true;
    };
    /** 目录面包屑
     * 当点击第一个的时候是用share 的api,所以这里第一个dirId不会被用到 */
    const historyDir = ref<{ dirId: string; dirName: string }[]>([
      // { dirId: "none", dirName: "/" },
      // 默认改为空的
    ]);
    /** 是否折叠路径栏 */
    const shouldCollapseHistoryDirBar = ref(false);
    /** 地址栏的最后一个元素滑动进入视图 */
    const scrollLastAddressItemIntoView = () => {
      const lastHistoryDirItemElement = [
        ...document.querySelectorAll(".historyDirItem"),
      ].pop();
      // console.log("lastHistoryDirItemElement", lastHistoryDirItemElement);
      // 地址栏最后一个进入视图
      if (lastHistoryDirItemElement) {
        lastHistoryDirItemElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    };
    watch(
      () => historyDir.value,
      (newVal) => {
        // console.log("newVal", newVal);
        if (!newVal.length) {
          shouldCollapseHistoryDirBar.value = true;
        } else {
          shouldCollapseHistoryDirBar.value = false;
        }
        useDelay(0).then(scrollLastAddressItemIntoView);
      },
      { immediate: true, deep: true }
    );
    onMounted(() => {
      const queryUri = route.query.uri as string;
      // console.log("queryUri", queryUri);
      if (!queryUri) return;
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
        insertedAtText.value = dayjs(data.drivePreviewShare.insertedAt).format(
          "YY-MM-DD"
        );
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
    });
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
    let destoryPdfLoadingTask: (() => void) | null = null;
    /** 点击icon */
    const onItemIconClick = async (record: ListItem) => {
      // console.log("onItemIconClick", record);
      // if (notLoggedInAndRoute()) {
      //   console.log("未登录,跳转");
      //   return;
      // }
      // if (FILE_TYPE_MAP.image.includes(e)) return image;
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
        isShowDescriptionModalFileNameInAddressBar.value = false;
        // 1.2 change fileData
      } else if (FILE_TYPE_MAP.image.includes(fileType)) {
        // 2.是图片
        const { user, space, id: fileId, fullName } = record.userFile;
        // 分享的预览用的token 是该分享数据的token
        const token = record.token;
        const tableImgList = fileData.value.filter(
          (item) =>
            item.userFile !== null &&
            FILE_TYPE_MAP.image.includes(item.userFile.fileType ?? "")
        );
        const toPreviewList = tableImgList.map((item) => ({
          src: makeFileUrl({
            urlType: "preview",
            token: token,
            userId: item.userFile?.user.id ?? "",
            space: item.userFile?.space ?? "",
            fileId: item.userFile?.id ?? "",
            fileName: item.userFile?.fullName.slice(-1)[0] ?? "",
            updateAt: item.userFile?.updatedAt ?? "",
          }),
          w: 0,
          h: 0,
          title: item.userFile?.info.description
            ? transformRawDescription(item.userFile?.info.description)
            : "",
        }));
        // 找出当前点击的图片的 openIndex
        const startImgIdx = tableImgList.findIndex((i) => i.id === record.id);
        baseStore.setPhotoSwipeAndShow(toPreviewList, { index: startImgIdx });
      } else if (fileType === "pdf") {
        // 先清理上一次的任务(如果有)
        if (destoryPdfLoadingTask) {
          destoryPdfLoadingTask();
        }
        // console.log("pdf-类型");
        const { user, space, id: fileId, fullName } = record.userFile;
        const token = record.token;
        // const pdfUrl = `https://drive-s.owaf.io/preview/${
        //   user.id
        // }/${space.toLowerCase()}/${fileId}/${
        //   fullName.slice(-1)[0]
        // }?token=${token}&t=${dayjs(record.userFile.updatedAt).format(
        //   "YYYYMMDDHHmmss"
        // )}`;
        const pdfUrl = makeFileUrl({
          urlType: "preview",
          token,
          userId: user.id,
          space: space.toLowerCase(),
          fileId,
          fileName: fullName.slice(-1)[0],
          updateAt: record.userFile.updatedAt,
        });
        // console.log("pdfUrl", pdfUrl);
        isShowBottomPopup.value = true;
        currentPreviewPdfName.value = lastOfArray(fullName);
        isLoadingPdf.value = true;
        //
        // console.log("window", window);
        const PDFjs = (window as any).pdfjsLib as typeof pdfjsLib;
        // console.log("pdfjs", PDFjs);
        PDFjs.GlobalWorkerOptions.workerSrc =
          // "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js";
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.worker.min.js";
        let viewer: HTMLElement | null;
        let thePdf: PDFDocumentProxy;
        const pdfLoadingTask = PDFjs.getDocument(pdfUrl);
        destoryPdfLoadingTask = () => {
          pdfLoadingTask.destroy();
          destoryPdfLoadingTask = null;
        };
        pdfLoadingTask.promise
          .then((pdf) => {
            isLoadingPdf.value = false;
            useDelay(10).then(async () => {
              viewer = document.getElementById("pdfCanvas");
              thePdf = pdf;
              const renderQueue = [];
              // console.time("全部pdf页面渲染时间");
              for (let page = 1; page <= pdf.numPages; page++) {
                const canvas = document.createElement("canvas");
                canvas.className = "pdf-page-canvas";
                viewer?.appendChild(canvas);
                // renderPromiseLimit(() => renderPage(page, canvas));
                renderQueue.push(() => renderPage(page, canvas));
              }
              // let i = 0;
              // while (i < renderQueue.length) {
              //   await renderQueue[i]();
              //   i++;
              // }
              renderQueue.reduce((a, b) => a.then(b), Promise.resolve());
            });
          })
          .catch((err) => {
            isLoadingPdf.value = false;
            console.log("加载pdf出错", err);
          });
        const renderPage = async (pageNumber: number, canvas: any) => {
          if (!viewer) {
            // console.log("noViewer");
            return;
          }
          const page = await thePdf.getPage(pageNumber);
          // const unscaledViewport = page.getViewport({ scale: 1 });
          // const scale = viewer.clientWidth / unscaledViewport.width;
          // console.log("calc-scale", scale);
          // https://stackoverflow.com/questions/35400722/pdf-image-quality-is-bad-using-pdf-js
          // 清晰度解决,先放大,再缩小
          const scale = 2;
          const viewport = page.getViewport({ scale });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          // viewer.style.width = Math.floor(viewport.width / scale) + "pt";
          // viewer.style.height = Math.floor(viewport.height / scale) + "pt";
          const renderTask = page.render({
            canvasContext: canvas.getContext("2d"),
            viewport: viewport,
          });
          // console.time(`${pageNumber}`);
          return renderTask.promise.then(() => {
            // console.timeEnd(`${pageNumber}`);
            // if (pageNumber === thePdf.numPages) {
            //   console.timeEnd("全部pdf页面渲染时间");
            // }
          });
        };
        //
      } else {
        // 3.其他类型
        // console.log("TODO-其他类型");
        Toast("不支持预览该文件");
      }
    };
    /** 点击名字 */
    const onItemNameClick = async (record: ListItem) => {
      // console.log("onItemNameClick");
      const e = record.userFile;
      if (!e) return;
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

    const isShowDescriptionModalFileNameInAddressBar = ref(false);
    watch(
      () => isShowDescriptionModalFileNameInAddressBar.value,
      (newVal) => {
        if (newVal) {
          // 如果文件名显示在地址栏, 滑动它进入视图
          useDelay(0).then(scrollLastAddressItemIntoView);
        }
      }
    );
    const currentDescriptionModalFileName = ref("");
    const currentDescription = ref("");
    const setCurrentDescriptionModalData = (
      id: string,
      fileName: string,
      descSource: string
    ) => {
      currentDescriptionModalFileName.value = fileName;
      currentDescription.value = descSource;
      if (!idMapDescriptionCache.has(id)) {
        idMapDescriptionCache.set(id, { fileName, descSource });
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
    const isShowDescriptionPopup = ref(false);
    /** record详细描述信息的弹窗 */
    function useDescriptionPopup() {
      const onShowDescriptionPopup = () => {
        isShowDescriptionPopup.value = true;
      };
      const onCloseDescriptionPopup = () => {
        isShowDescriptionPopup.value = false;
      };
      return {
        isShowDescriptionPopup,
        currentDescriptionModalFileName,
        currentDescription,
        onShowDescriptionPopup,
        onCloseDescriptionPopup,
      };
    }
    const fileTableRef = ref(null);
    /** 点击除了表格的其他地方, 重置当前点击项(还原地址栏),除了地址栏的收藏icon
     *  文件夹的情况下才开启, 单文件不用变更地址栏和详情
     */
    const useClickOutSideWhenShareIsFolder = () => {
      // onClickOutside(fileTableRef, (e) => {
      //   // if (!isShowDescriptionPopup.value) {
      //   // setTimeout(() => {
      //   // console.log("e", e.target);
      //   // 已经打开弹窗的情况下, 不重置描述弹窗内容
      //   if (isShowDescriptionPopup.value) {
      //     return;
      //   }
      //   isShowDescriptionModalFileNameInAddressBar.value = false;
      //   // 设置回当前文件夹的详情
      //   const len = historyDir.value.length;
      //   if (len === 1) {
      //     // 全部文件
      //     setCurrentDescriptionModalDataFromCache(firstFolderDirId);
      //   } else {
      //     // 二/3级文件夹
      //     setCurrentDescriptionModalDataFromCache(
      //       historyDir.value.length
      //         ? lastOfArray(historyDir.value).dirId
      //         : firstFolderDirId
      //     );
      //   }
      //   // }, 100);
      //   // }
      // });
    };
    // 手机导航后退的时候,检查有没先关闭图片预览
    onBeforeRouteLeave((to, from) => {
      if (baseStore.photoSwipe.isShow) {
        baseStore.setPhotoSwipeVisible(false);
        return false;
      }
      return true;
    });
    return {
      TAG_COLOR_LIST,
      isCanFilePreview,
      svgStr,
      lockPageLoading,
      selectedRows,
      inputCode,
      isCodeResolved,
      isValid,
      userPreview,
      currentShareToken,
      // currentShareId,
      isCurrentShareFolder,
      isLoadingConfirmCode,
      isCurrentShareCollected,
      isUserLoggedIn,
      isLoadingDownloadData,
      myInfo,
      onClickLogo,
      onUserIconClick,
      onCollect,
      onDownload,
      saveToMetanetModalPreAction,
      onConfirmCode,
      expiredText,
      insertedAtText,
      isLoadingListData,
      curShareCollectedCount,
      onUpperLevel,
      fileData,
      dirData,
      isLoadingDirData,
      popupState,
      onChangePopup,
      onClosePopup,
      historyDir,
      shouldCollapseHistoryDirBar,
      // onFinishPopup,
      isShowDescriptionModalFileNameInAddressBar,
      onItemIconClick,
      onItemNameClick,
      dayjs,
      formatBytes,
      lastOfArray,
      cacheFormatDescription,
      fileTableRef,
      ...useDescriptionPopup(),
      // ...useRightPopup(),
      ...useBottomPopup(),
    };
  },
});
</script>

<style lang="less" scoped>
.fileItem {
  &:active,
  &:hover {
    background: #fafafb;
  }
}
</style>
<style lang="less">
.listLoading {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
}
</style>