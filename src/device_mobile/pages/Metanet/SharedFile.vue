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
          <img
            class="w-4 h-4 mr-1"
            src="~@/assets/images/calendar.png"
            alt=""
          />
          <span class="mr-1">{{ insertedAtText }}</span>
          <img
            class="w-4 h-4 mr-1"
            src="~@/assets/images/hourglass.png"
            alt=""
          />
          <span>{{ expiredText }}</span>
        </div>
        <div @click="onShowRightPopup">
          <van-icon
            :style="{
              transform: 'rotate(90deg)',
            }"
            size="24"
            color="white"
            name="more-o"
          />
        </div>
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
          <div class="van-hairline--bottom text-gray-400 text-center mb-3 pb-4">
            <div class="inline-block px-10" @click="onCollect">
              <van-icon
                v-if="isCurrentShareCollected"
                name="star"
                color="orange"
              />
              <van-icon v-else name="star-o" />
              {{ curShareCollectedCount }}
            </div>
          </div>
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
                class="h-12 rounded-full"
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
            <div v-if="isShowDirNavBar" class="px-4 font-semibold">
              <div v-if="historyDir.length === 1">
                共有{{ fileData.length }}个文件
              </div>
              <!-- <div v-else>全部文件/3200/所发生的</div> -->
              <div v-else class="flex items-center">
                <template v-for="(dir, idx) in historyDir" :key="dir.dirId">
                  <div
                    :class="{
                      'text-gray-400': idx === historyDir.length - 1,
                    }"
                    @click="onUpperLevel(idx)"
                  >
                    {{ dir.dirName }}
                  </div>
                  <span v-if="idx !== historyDir.length - 1" class="px-1"
                    >/</span
                  >
                </template>
              </div>
            </div>
            <!-- 文件列表 -->
            <div
              :style="{
                overflow: 'hidden',
                'overflow-y': 'scroll',
                height: 'calc(100% - 110px)',
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
                  <div class="mr-2">
                    <MFileTypeIcon
                      class="w-9 h-9"
                      :type="record.userFile.fileType"
                    />
                  </div>
                  <div class="flex-1" @click="onItemClick(record)">
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
                            v-for="tag in cacheFormatDescription(
                              record.userFile.info.description
                            ).tagArr"
                            :key="tag"
                            color="orange"
                            >{{ tag }}</van-tag
                          >
                        </template>
                        {{
                          cacheFormatDescription(
                            record.userFile.info.description
                          ).text || "&nbsp;"
                        }}
                      </template>
                    </div>
                  </div>
                  <div class="pl-7" v-if="!record.userFile.isDir">
                    <van-checkbox v-model="record.checked" />
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>
        <!-- 工具栏 -->
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
        >
          <div>
            <!-- background-color: #E1F4FF; color: #06A7FF; -->
            <!-- 下载 -->
            <van-button
              round
              class="h-12 mr-4 font-semibold font-15"
              :style="{
                'background-color': '#E1F4FF',
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
              >保存到网盘</van-button
            >
          </div>
        </footer>
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
        @close="onClosePopup"
        @change="onChangePopup"
      />
    </van-popup>
    <!-- 右边工具栏 -->
    <van-popup
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
import { MFileTypeIcon } from "../../components";
import {
  directive as viewer,
  component as Viewer,
  api as viewerApi,
} from "v-viewer";
import { useUserStore } from "@/store";
import { FILE_TYPE_MAP } from "@/constants";

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

function sortByDirType(a: ListItem, b: ListItem) {
  return a.userFile?.isDir ? (b.userFile?.fullName[0] === "..." ? 1 : -1) : 1;
}

export default defineComponent({
  directives: {
    viewer: viewer({
      debug: true,
    }),
  },
  components: {
    MFileTypeIcon,
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
    /** 是否显示文件夹导航栏 */
    const isShowDirNavBar = ref(true);
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
    /** 收藏 */
    const onCollect = async () => {
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
      if (checkLoginStatusAndRedirect()) {
        return;
      }
      // console.log("onDownload");
      selectedRows.value.forEach((record) => {
        if (!record.userFile) return;
        const { user, fullName, space, id: fileId } = record.userFile;
        apiGetPreviewToken().then((resultPreviewToken) => {
          if (resultPreviewToken.err) return;
          useDelay(100).then(() => {
            const token = resultPreviewToken.data.drivePreviewToken;
            const url = `https://drive-s.owaf.io/download/${
              user.id
            }/${space.toLowerCase()}/${fileId}/${
              fullName.slice(-1)[0]
            }?token=${token}`;
            downloadFileByUrl(url, fullName.slice(-1)[0]);
          });
        });
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

    /** 右边的弹层 */
    function useRightPopup() {
      const isShowRightPopup = ref(false);
      const onShowRightPopup = () => {
        isShowRightPopup.value = true;
      };
      const onCloseRightPopup = () => {
        isShowRightPopup.value = false;
      };
      const onLogIn = () => {
        router.push({
          name: "Login",
          query: { redirect: route.fullPath },
        });
      };
      const onLogOut = () => {
        localStorage.clear();
        window.location.reload();
      };
      return {
        isShowRightPopup,
        onShowRightPopup,
        onCloseRightPopup,
        onLogIn,
        onLogOut,
      };
    }
    // const onFinishPopup = () => {
    //   console.log("onFinishPopup", popupState);
    // };
    /** 获取文件信息 */
    const getSetFileData = async () => {
      fileData.value.length = 0;
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
    const historyDir = ref<{ dirId: string; dirName: string }[]>([
      { dirId: "root", dirName: "全部文件" },
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
          if (!item || item.id === dirId) return;
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
    const onItemClick = (record: ListItem) => {
      // console.log("onItemClick", record);
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
        // 1.2 change fileData
      } else if (FILE_TYPE_MAP.image.includes(fileType)) {
        // 2.是图片
        // 把当前所有的图片类型都加到列表上
        previewImages.value.length = 0;
        fileData.value.forEach((item) => {
          if (
            !item.userFile ||
            !FILE_TYPE_MAP.image.includes(
              getFileType({
                isDir: item.userFile.isDir,
                fileName: lastOfArray(item.userFile.fullName),
              })
            )
          ) {
            return;
          }
          const { user, space, id: fileId, fullName } = item.userFile;
          const token = item.token;
          const url = `https://drive-s.owaf.io/preview/${
            user.id
          }/${space.toLowerCase()}/${fileId}/${
            fullName.slice(-1)[0]
          }?token=${token}`;
          previewImages.value.push(url);
        });
        onShowViewer();
      } else {
        // 3.其他类型
        console.log("TODO-其他类型");
      }
    };
    const onShowViewer = () => {
      const $viewer = viewerApi({
        options: {
          toolbar: {
            zoomIn: 0,
            zoomOut: 0,
            oneToOne: 1,
            reset: 0,
            prev: 1,
            play: {
              show: 0,
              size: "large",
            },
            next: 1,
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
      svgStr,
      lockPageLoading,
      selectedRows,
      inputCode,
      isCodeResolved,
      isValid,
      userPreview,
      currentShareToken,
      // currentShareId,
      isShowDirNavBar,
      isLoadingConfirmCode,
      isCurrentShareCollected,
      isUserLoggedIn,
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
      onItemClick,
      dayjs,
      formatBytes,
      lastOfArray,
      cacheFormatDescription,
      onShowViewer,
      ...useRightPopup(),
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