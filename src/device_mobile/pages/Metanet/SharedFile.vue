<template>
  <div
    class="w-full h-full"
    :style="{
      background: '#404A66',
    }"
  >
    <div v-if="lockPageLoading" class="w-full h-full relative">
      <div class="absolute inset-0 bg-white opacity-10"></div>
      <div class="absolute inset-0 text-center pt-28">
        <van-loading size="40" color="#0094ff" vertical>加载中...</van-loading>
      </div>
    </div>
    <div v-else class="w-full h-full relative">
      <header class="h-11 px-4 flex items-center text-white">
        <div>
          <div v-html="svgStr"></div>
        </div>
        <div
          class="flex-1 text-center flex items-center justify-center font-14"
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
        </div>
        <div @click="onUserIconClick">
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
          <div class="van-hairline--bottom text-gray-400 text-center"></div>
          <div class="pb-2"></div>
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
              v-if="isCurrentShareFolder"
              class="px-4 font-semibold"
            >
              <div v-if="historyDir.length === 1" class="flex items-center">
                <div>
                  <van-icon
                    color="#404A66"
                    size="16px"
                    class="mr-2"
                    name="info-o"
                    @click="onShowDetailInfo"
                  />
                </div>
                <!-- 共有{{ fileData.length }}个文件 -->
                <div class="flex-1">/</div>
                <div v-if="isUserLoggedIn">
                  <van-icon color="#404A66" size="16px" name="edit" />
                </div>
              </div>
              <!-- <div v-else>全部文件/3200/所发生的</div> -->
              <div v-else class="flex items-center">
                <div>
                  <van-icon
                    size="16px"
                    class="mr-2"
                    name="info-o"
                    @click="onShowDetailInfo"
                    color="#404A66"
                  />
                  <!-- :color="currentDetailInfo.name ? '#404A66' : '#9CA3AF'" -->
                  <!-- 9CA3AF is text-gray-400 -->
                  <!-- color="#404A66" -->
                </div>
                <div class="flex-1 flex items-center truncate">
                  <template v-for="(dir, idx) in historyDir" :key="dir.dirId">
                    <div
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
                  <template v-if="currentDetailInfo.name">
                    <span class="px-2 text-gray-400">></span>
                    <span class="truncate">
                      {{ currentDetailInfo.name }}
                    </span>
                  </template>
                </div>
                <div v-if="isUserLoggedIn">
                  <van-icon color="#404A66" size="16px" name="edit" />
                </div>
              </div>
            </div>
            <!-- 如果不是文件夹, 信息图标 , 登录后加评论图标 -->
            <div v-else class="flex items-center justify-center">
              <!-- TODO detailInfo -->
              <van-icon
                color="#404A66"
                size="16px"
                class="mr-1 w-6 h-6 flex items-center justify-center"
                name="info-o"
                @click="onShowDetailInfo"
              />
              <!-- 登录后显示评论按钮 -->
              <van-icon
                v-if="isUserLoggedIn"
                color="#404A66"
                size="16px"
                class="mr-1 w-6 h-6 flex items-center justify-center"
                name="edit"
              />
            </div>
            <!-- 文件列表 -->
            <div
              class="mt-1"
              :style="{
                overflow: 'hidden',
                'overflow-y': 'scroll',
                height: 'calc(100% - 80px)',
              }"
            >
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
                  <div class="flex-1" @click="onItemNameClick(record)">
                    <div class="font-medium">
                      {{ lastOfArray(record.userFile.fullName) }}
                    </div>
                    <div class="font-12 text-gray-400">
                      <template v-if="!record.userFile.info.description"
                        >-</template
                      >
                      <template v-else>
                        <template
                          v-if="
                            cacheFormatDescription(
                              record.userFile.info.description
                            ).tagArr.length
                          "
                        >
                          <van-tag
                            v-for="(tag, idx) in cacheFormatDescription(
                              record.userFile.info.description
                            ).tagArr"
                            :key="tag"
                            :color="TAG_COLOR_LIST[idx]"
                            class="mr-1"
                            >{{ tag }}</van-tag
                          >
                        </template>
                        <template v-else>-</template>
                        <!-- {{
                          cacheFormatDescription(
                            record.userFile.info.description
                          ).text || "&nbsp;"
                        }} -->
                      </template>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center font-12 mb-1">
                      <van-icon color="#E63F48" size="14px" name="like" />
                      <span>111</span>
                    </div>
                    <div class="flex items-center font-12">
                      <van-icon color="#404A66" size="14px" name="chat-o" />
                      <span>111</span>
                    </div>
                  </div>
                  <div
                    class="w-10 flex justify-end"
                    v-if="!record.userFile.isDir"
                  >
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
                  <div v-else class="w-10"></div>
                </div>
              </template>
            </div>
          </template>
        </div>
        <!-- 工具栏 -->
        <transition name="no-mode-fade">
          <footer
            v-if="selectedRows.length"
            class="
              absolute
              py-2
              px-4
              flex
              items-center
              justify-between
              bg-white
              bottom-0
              left-0
              right-0
            "
            :style="{
              'box-shadow': '0 2px 6px #404a66',
            }"
          >
            <div>
              <!-- background-color: #E1F4FF; color: #06A7FF; -->
              <!-- 下载 -->
              <van-button
                round
                class="h-12 mr-4 font-semibold font-15"
                :style="{
                  'background-color': 'rgba(64, 74, 102,.2)',
                  color: '#06A7FF',
                  border: 'none',
                }"
                @click="onDownload"
              >
                <template #icon>
                  <img
                    class="w-6 h-6"
                    src="~@/assets/images/mobile/download.png"
                    alt=""
                  />
                </template>
              </van-button>
            </div>
            <!-- 保存 -->
            <div>
              <van-button
                round
                type="primary"
                class="h-12 w-32 font-semibold font-15"
                @click="saveToMetanetModalPreAction"
                :loading="isLoadingDirData"
                color="#404A66"
                >保存到网盘</van-button
              >
            </div>
          </footer>
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
      v-model:show="isShowDetailPopup"
      @close="onCloseDetailPopup"
      :style="{
        width: '300px',
      }"
    >
      <template v-if="showDetailInfo.name">
        <div
          v-for="(value, key) in showDetailInfo"
          :key="key"
          class="flex items-center flex-wrap"
        >
          <div
            class="text-gray-400 mr-1"
            :style="{
              width: '58px',
            }"
          >
            {{ translateDetailKey(key) }}
          </div>
          <div v-if="key !== 'desc'">{{ value }}</div>
          <div v-else class="flex flex-wrap flex-1 mt-1">
            <template v-if="value.tagArr.length">
              <van-tag
                size="medium"
                class="mb-1 mr-1"
                v-for="(tag, idx) in value.tagArr"
                :color="TAG_COLOR_LIST[idx]"
                :key="tag"
                >{{ tag }}</van-tag
              >
            </template>
            <span>{{ value.text }}</span>
          </div>
        </div>
      </template>
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
      <div v-if="isLoadingPdf" class="absolute inset-0 text-center pt-28">
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
  apiGetPreviewToken,
  apiPriviewSharedFile,
  apiQueryCollectList,
  apiQueryFileByDir,
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
} from "@/utils";
import dayjs from "dayjs";
import { Dialog, Toast } from "vant";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { MFileTypeIcon, MSvgIcon } from "../../components";
import { api as viewerApi } from "v-viewer";
import { useUserStore } from "@/store";
import { FILE_TYPE_MAP, TAG_COLOR_LIST } from "@/constants";
import pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import { onClickOutside } from "@vueuse/core";
import { TDetailInfo } from "@/device_pc/pages/Metanet/components/ModalDetail.vue";
import { cloneDeep } from "lodash-es";

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
const dirIdDetailInfoMap: { [key: string]: TDetailInfo } = {};

export default defineComponent({
  components: {
    MFileTypeIcon,
    MSvgIcon,
  },
  setup() {
    // 登录和未登录的
    // 未登录的是可以看的,但是点击功能后导航去登录页,登录完再返回来
    const svgStr = useSvgWhiteLogo();
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
    const fileData = ref<ListItem[]>([]);
    const previewImages = ref<string[]>([]);
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
    const checkLoginStatusAndRedirect = () => {
      if (!isUserLoggedIn.value) {
        router.push({
          name: "Login",
          query: { redirect: route.fullPath },
        });
        return true;
      }
      return false;
    };
    const myInfo = computed(() => {
      const userName = userStore.username;
      return { userName };
    });
    /** header 右边头像的点击 */
    const onUserIconClick = () => {
      if (checkLoginStatusAndRedirect()) {
        return;
      }
      // 已经登录就跳转到account
      router.push("/account");
    };
    /** 收藏 */
    const onCollect = async () => {
      if (checkLoginStatusAndRedirect()) {
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

    /** 下载 */
    const onDownload = () => {
      // if (checkLoginStatusAndRedirect()) {
      //   return;
      // }
      // console.log("onDownload");
      selectedRows.value.forEach((record) => {
        if (!record.userFile) return;
        const { user, fullName, space, id: fileId } = record.userFile;
        const downloadToken = record.token;
        // apiGetPreviewToken().then((resultPreviewToken) => {
        // if (resultPreviewToken.err) return;
        useDelay(100).then(() => {
          if (!record.userFile) return;
          // const token = resultPreviewToken.data.drivePreviewToken;
          const url = `https://drive-s.owaf.io/download/${
            user.id
          }/${space.toLowerCase()}/${fileId}/${
            fullName.slice(-1)[0]
          }?token=${downloadToken}&t=${dayjs(record.userFile.updatedAt).format(
            "YYYYMMDDHHmmss"
          )}`;
          downloadFileByUrl(url, fullName.slice(-1)[0]);
        });
        // });
      });
    };
    /** 保存到网盘 */
    const saveToMetanetModalPreAction = () => {
      if (checkLoginStatusAndRedirect()) {
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
      // 最后一个就是当前目录,不用点击
      if (dirIdx === historyDir.value.length - 1) {
        return;
      }
      // 如果点的是全部文件
      if (dirIdx === 0) {
        historyDir.value.splice(1);
        getSetFileData();
      } else {
        // 点击的不是第一个"全部文件",删除后面的目录
        historyDir.value.splice(dirIdx + 1);
        const dirId = lastOfArray(historyDir.value).dirId;
        getSetDriveList(dirId);
        onSetCurrentFolderDetailInfoByCache(dirId);
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
        apiQueryFileByDir({ dirId: "root" }).then(async (resultQueryFile) => {
          if (resultQueryFile.err) {
            // console.log("err", err);
            isLoadingDirData.value = false;
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
                  return apiSecondUpload({
                    // 包含要保存的路径的文件全名数组
                    fullName: [
                      ...folderFullName,
                      lastOfArray(i.userFile.fullName),
                    ],
                    description: i.userFile.info.description || "",
                    fileHash: i.userFile.hash || "",
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
    // const onFinishPopup = () => {
    //   console.log("onFinishPopup", popupState);
    // };
    /** 获取文件信息 */
    const getSetFileData = async () => {
      const { data, err } = await apiQuerySharedFile({
        uri: currentUri.value,
        ...(!isCodeResolved.value || inputCode.value
          ? {
              code: inputCode.value,
            }
          : {}),
      });
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
      if (isCurrentShareFolder.value === false) {
        // 如果当前分享是一个文件, 注册详情信息
        onSetCurrentDetailInfo(e);
      } else {
        onSetCurrentFolderDetailInfo(e);
      }

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
      if (isCurrentShareFolder.value) {
        // wait dom ready
        useDelay().then(() => {
          // 文件夹的话就启动详情相关监听
          useClickOutSide();
        });
      }
    };
    /** 目录面包屑
     * 当点击第一个的时候是用share 的api,所以这里第一个dirId不会被用到 */
    const historyDir = ref<{ dirId: string; dirName: string }[]>([
      { dirId: "none", dirName: "/" },
    ]);
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
      apiQueryFileByDir({
        dirId,
        token,
      }).then((res) => {
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
    /** 点击预览图片 */
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
        const e = record.userFile;
        onSetCurrentFolderDetailInfo(e);
        // 1.2 change fileData
      } else if (FILE_TYPE_MAP.image.includes(fileType)) {
        // 2.是图片
        previewImages.value.length = 0;
        const { user, space, id: fileId, fullName } = record.userFile;
        // 分享的预览用的token 是该分享数据的token
        const token = record.token;
        const url = `https://drive-s.owaf.io/preview/${
          user.id
        }/${space.toLowerCase()}/${fileId}/${
          fullName.slice(-1)[0]
        }?token=${token}&t=${dayjs(record.userFile.updatedAt).format(
          "YYYYMMDDHHmmss"
        )}`;
        previewImages.value.push(url);
        onShowViewer();
      } else if (fileType === "pdf") {
        console.log("pdf-类型");
        const { user, space, id: fileId, fullName } = record.userFile;
        const token = record.token;
        const pdfUrl = `https://drive-s.owaf.io/preview/${
          user.id
        }/${space.toLowerCase()}/${fileId}/${
          fullName.slice(-1)[0]
        }?token=${token}&t=${dayjs(record.userFile.updatedAt).format(
          "YYYYMMDDHHmmss"
        )}`;
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
        PDFjs.getDocument(pdfUrl)
          .promise.then((pdf) => {
            isLoadingPdf.value = false;
            useDelay(10).then(async () => {
              viewer = document.getElementById("pdfCanvas");
              thePdf = pdf;
              const renderQueue = [];
              console.time("全部pdf页面渲染时间");
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
            if (pageNumber === thePdf.numPages) {
              console.timeEnd("全部pdf页面渲染时间");
            }
          });
        };
        //
      } else {
        // 3.其他类型
        console.log("TODO-其他类型");
      }
    };
    // const currentDetailItem
    /** 点击文件名 */
    const onItemNameClick = async (record: ListItem) => {
      const e = record.userFile;
      if (!e) return;
      if (e.isDir) {
        // 1.如果是文件夹, 打开文件夹
        historyDir.value.push({
          dirId: e.id,
          dirName: lastOfArray(e.fullName),
        });
        getSetDriveList(e.id);
        onSetCurrentFolderDetailInfo(e);
      } else {
        // 2.如果是文件
        onSetCurrentDetailInfo(e);
      }
    };
    const fileTableRef = ref(null);
    const useClickOutSide = () => {
      // console.log("useClickOutSide");
      /** 点击除了表格的其他地方, 重置当前点击项(还原地址栏),除了地址栏的收藏icon */
      onClickOutside(fileTableRef, (e) => {
        // console.log("e", e.target);
        const target = e.target as HTMLElement;
        if (
          (target.nodeName === "path" &&
            target.outerHTML.includes("64C264.6")) ||
          (target.nodeName === "svg" &&
            target.innerHTML.includes("64C264.6")) ||
          (target.nodeName === "a" && target.innerHTML.includes("64C264.6"))
        ) {
          // 如果是点击地址栏中的详情按钮, 保持detailInfo
          return;
        }
        if (isShowDetailPopup.value === false) {
          onResetCurrentDetailInfo();
        }
      });
    };
    /** 当前文件夹的详情 */
    const currentFolderDetailInfo = reactive<DetailInfo>({
      name: "",
      type: "",
      size: "",
      insertedAt: "",
      updatedAt: "",
      desc: {
        tagArr: [],
        text: "",
      },
    });
    /** 设置当前文件夹详情 */
    const onSetCurrentFolderDetailInfo = (e: TFileItem) => {
      if (dirIdDetailInfoMap[e.id]) {
        Object.assign(currentFolderDetailInfo, dirIdDetailInfoMap[e.id]);
        return;
      }
      currentFolderDetailInfo.name = lastOfArray(e.fullName);
      currentFolderDetailInfo.type = getFileType({
        isDir: e.isDir,
        fileName: lastOfArray(e.fullName),
      });
      currentFolderDetailInfo.size = formatBytes(+e.info.size);
      currentFolderDetailInfo.insertedAt = dayjs(e.insertedAt).format(
        "YYYY年MM月DD日hh:mm"
      );
      currentFolderDetailInfo.updatedAt = dayjs(e.updatedAt).format(
        "YYYY年MM月DD日hh:mm"
      );
      currentFolderDetailInfo.desc = cacheFormatDescription(
        e.info.description || ""
      );
      dirIdDetailInfoMap[e.id] = cloneDeep(currentFolderDetailInfo);
    };
    /** 根据文件夹id拿缓存去设置 当前文件夹详情 */
    const onSetCurrentFolderDetailInfoByCache = (dirId: string) => {
      // console.log("what,why", dirIdDetailInfoMap);
      const cacheFolderDetailInfo = dirIdDetailInfoMap[dirId];
      if (cacheFolderDetailInfo) {
        Object.assign(currentFolderDetailInfo, cacheFolderDetailInfo);
      }
    };
    /** 重置当前文件夹详情 */
    const onResetCurrentFolderDetailInfo = () => {
      currentFolderDetailInfo.name = "";
      currentFolderDetailInfo.type = "";
      currentFolderDetailInfo.size = "";
      currentFolderDetailInfo.insertedAt = "";
      currentFolderDetailInfo.updatedAt = "";
      currentFolderDetailInfo.desc.tagArr = [];
      currentFolderDetailInfo.desc.text = "";
    };
    /** 是否显示详情弹窗 */
    const isShowDetailPopup = ref(false);
    /** 当前文件详情信息 */
    const currentDetailInfo = reactive<DetailInfo>({
      name: "",
      type: "",
      size: "",
      insertedAt: "",
      updatedAt: "",
      desc: {
        tagArr: [],
        text: "",
      },
    });
    /** 设置当前详情弹窗 */
    const onSetCurrentDetailInfo = (e: TFileItem) => {
      currentDetailInfo.name = lastOfArray(e.fullName);
      currentDetailInfo.type = getFileType({
        isDir: e.isDir,
        fileName: lastOfArray(e.fullName),
      });
      currentDetailInfo.size = formatBytes(+e.info.size);
      currentDetailInfo.insertedAt = dayjs(e.insertedAt).format(
        "YYYY年MM月DD日hh:mm"
      );
      currentDetailInfo.updatedAt = dayjs(e.updatedAt).format(
        "YYYY年MM月DD日hh:mm"
      );
      currentDetailInfo.desc = cacheFormatDescription(e.info.description || "");
    };
    /** 重置当前详情弹窗 */
    const onResetCurrentDetailInfo = () => {
      currentDetailInfo.name = "";
      currentDetailInfo.type = "";
      currentDetailInfo.size = "";
      currentDetailInfo.insertedAt = "";
      currentDetailInfo.updatedAt = "";
      currentDetailInfo.desc.tagArr = [];
      currentDetailInfo.desc.text = "";
    };
    /** 显示的详情 */
    const showDetailInfo = computed(() => {
      return currentDetailInfo.name
        ? currentDetailInfo
        : currentFolderDetailInfo;
    });
    /** record详细描述信息的弹窗 */
    function useDetailPopup() {
      const onShowDetailInfo = () => {
        if (currentDetailInfo.name || currentFolderDetailInfo.name) {
          isShowDetailPopup.value = true;
        }
      };
      const onCloseDetailPopup = () => {
        isShowDetailPopup.value = false;
      };
      /** 将key转换成中文 */
      const translateDetailKey = (key: keyof DetailInfo) => {
        return DETAIL_INFO_MAP[key];
      };
      return {
        fileTableRef,
        isShowDetailPopup,
        currentFolderDetailInfo,
        currentDetailInfo,
        showDetailInfo,
        onShowDetailInfo,
        onCloseDetailPopup,
        translateDetailKey,
      };
    }
    const onShowViewer = () => {
      const $viewer = viewerApi({
        options: {
          toolbar: {
            zoomIn: 0,
            zoomOut: 0,
            oneToOne: 1,
            reset: 0,
            prev: 0,
            play: {
              show: 0,
              size: "large",
            },
            next: 0,
            rotateLeft: 0,
            rotateRight: 0,
            flipHorizontal: 0,
            flipVertical: 0,
          },
          movable: true,
          // initialViewIndex: 1,
        },
        images: previewImages.value,
      });
      $viewer.show();
      // 经测试 关闭后会自动回收内存
    };
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
      myInfo,
      onUserIconClick,
      onCollect,
      onDownload,
      saveToMetanetModalPreAction,
      onConfirmCode,
      previewImages,
      expiredText,
      insertedAtText,
      curShareCollectedCount,
      onUpperLevel,
      fileData,
      dirData,
      isLoadingDirData,
      popupState,
      onChangePopup,
      onClosePopup,
      historyDir,
      // onFinishPopup,
      onItemIconClick,
      onItemNameClick,
      dayjs,
      formatBytes,
      lastOfArray,
      cacheFormatDescription,
      ...useDetailPopup(),
      onShowViewer,
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