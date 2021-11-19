<template>
  <div
    class="w-full h-full"
    :style="{
      background: '#404A66',
    }"
  >
    <header class="h-11 px-4 flex items-center text-white mb-4">
      <div @click="onClickLogo">
        <div v-html="svgStr"></div>
      </div>
      <!-- 中间的面包屑 -->
      <div class="flex-1">
        <MBreadCrump
          class="flex items-center justify-center"
          :titleArr="titleArr"
        />
      </div>
      <div
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
    </header>
    <section
      class="bg-white mx-4 pt-2"
      :style="{
        'border-radius': '15px',
        height: 'calc(100vh - 100px)',
      }"
    >
      <div
        class="mx-1 rounded-full h-6 flex items-center px-2"
        :style="{
          border: '1px solid #f2f2f2',
        }"
      >
        <van-icon
          size="16px"
          class="mr-2.5"
          name="info-o"
          color="#404A66"
          @click="onShowDescriptionPopup"
        />
        <!-- 中间的路径信息 -->
        <div
          class="
            flex-1 flex
            items-center
            whitespace-nowrap
            overflow-hidden overflow-x-scroll
          "
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
        <!-- TODO 当前目录是否已经分享 -->
        <van-icon
          v-if="
            currentClickItem.name.length > 0
              ? isCurClickItemShared
              : isCurFolderShared
          "
          size="16px"
          name="star"
          color="orange"
        />
        <van-icon v-else size="16px" name="star-o" color="#404A66" />
      </div>
      <!-- 列表 -->
      <div
        class="mt-1 relative"
        :style="{
          overflow: 'hidden',
          'overflow-y': 'scroll',
          height: 'calc(100% - 40px)',
        }"
      >
        <van-loading
          v-if="tableLoading"
          class="absolute top-6 listLoading"
          size="36px"
        />
        <template v-if="tableData.length === 0">
          <!-- <div class="pt-4 pl-4 text-gray-400 text-center">空文件夹</div> -->
          <van-empty description="空文件夹" />
        </template>
        <template v-else>
          <div
            class="px-3 py-2 flex items-center fileItem"
            v-for="record in tableData"
            :key="record.id"
          >
            <div class="mr-2 relative" @click="onItemIconClick(record)">
              <MFileTypeIcon class="w-9 h-9" :type="record.fileType" />
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
                {{ lastOfArray(record.fullName) }}
              </div>
              <div class="font-12 text-gray-400 text-overflow-2">
                <template v-if="record.info.description">
                  <template
                    v-if="
                      cacheFormatDescription(record.info.description).tagArr
                        .length
                    "
                  >
                    <template
                      v-for="(tag, idx) in cacheFormatDescription(
                        record.info.description
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
              <!-- <div class="flex items-center font-12 mb-1">
              <van-icon class="text-gray-500" size="14px" name="like" />
              <span>66</span>
            </div>
            <div class="flex items-center font-12">
              <van-icon color="#404A66" size="14px" name="chat-o" />
              <span>66</span>
            </div> -->
              <div class="font-12 text-gray-400">
                {{ record.isDir ? "" : formatBytes(+record.info.size) }}
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
    </section>
    <!-- 工具栏 -->
    <transition name="no-mode-fade">
      <MFooterBar v-if="selectedRows.length">
        <div class="flex items-center">
          <!-- background-color: #E1F4FF; color: #06A7FF; -->
          <!-- 下载 -->
          <div
            class="rounded-full w-12 h-12 flex-center mr-4"
            :style="{
              'background-color': 'rgba(64, 74, 102,.2)',
              color: '#404A66',
            }"
            @click="onDownload"
          >
            <MSvgIcon icon="download" :size="24" />
          </div>
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
      </MFooterBar>
    </transition>
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
  </div>
</template>

<script lang="ts">
import {
  apiGetPreviewToken,
  apiLoopQueryFileByDir,
  apiQueryFileByDir,
  ParamsQueryFileByDir,
  TFileItem,
  TFileList,
  // TFileList,
} from "@/apollo/api";
import { FILE_TYPE_MAP, TAG_COLOR_LIST } from "@/constants";
import { useBaseStore, useUserStore } from "@/store";
import {
  getFileType,
  lastOfArray,
  useSvgWhiteLogo,
  cacheFormatDescription,
  makePreviewImgUrl,
  transformRawDescription,
  useDelay,
  formatBytes,
  downloadFileByUrl,
} from "@/utils";
import dayjs from "dayjs";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import {
  computed,
  defineComponent,
  onActivated,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import {
  MBreadCrump,
  MFileTypeIcon,
  MMdParser,
  MSvgIcon,
  MFooterBar,
} from "../../components";
import pdfjsLib from "pdfjs-dist";

type THistoryDirItem = {
  dirName: string;
  dirId?: string;
  isShared: boolean;
};
/** 文件夹详情缓存,dirId作为key */
const idMapDescriptionCache = new Map<
  string,
  { fileName: string; descSource: string }
>();

type TableList = Array<TFileItem & { checked: boolean }>;

export default defineComponent({
  components: {
    MBreadCrump,
    MFileTypeIcon,
    MMdParser,
    MSvgIcon,
    MFooterBar,
  },
  setup() {
    const svgStr = useSvgWhiteLogo();
    const [route, router] = [useRoute(), useRouter()];
    const userStore = useUserStore();
    const baseStore = useBaseStore();
    const isUserLoggedIn = computed(() => userStore.isLoggedIn);

    const myInfo = computed(() => {
      const userName = userStore.username;
      return { userName };
    });
    const tableData = ref<TableList>([]);
    const titleArr = reactive<string[]>([]);
    titleArr.push("网盘");
    titleArr.push("文件");
    /** logo的点击 */
    const onClickLogo = () => {
      if (!isUserLoggedIn.value) {
        router.push({
          name: "Login",
        });
      } else {
        // 已经登录就跳转到account
        // router.push("/account");
        baseStore.changeMobileLeftPopupVisible(true);
      }
    };
    // 记录目录
    const historyDir = ref<THistoryDirItem[]>([
      {
        dirName: "~",
        dirId: "root",
        isShared: false,
      },
    ]);
    /** 请求的 fullName (排除根目录) */
    const requestDirNameList = computed(() =>
      historyDir.value.slice(1).map((i) => i.dirName)
    );
    /** 当前目录是否分享 */
    const isCurFolderShared = computed(() => {
      const dirArr = historyDir.value;
      return lastOfArray(dirArr).isShared;
    });

    /** 当前表格点击的项 */
    const currentClickItem = reactive({
      id: "",
      name: "",
    });
    const resetCurrentClickItem = () => {
      currentClickItem.id = "";
      currentClickItem.name = "";
    };
    /** 当前点击的item 是否分享 */
    const isCurClickItemShared = computed(() => {
      if (currentClickItem.id.length === 0) return false;
      return tableData.value.find((item) => item?.id === currentClickItem.id)
        ?.isShared;
    });
    // const selectedRows = ref<TFileItem[]>([]);
    const selectedRows = computed(() =>
      tableData.value.filter((record) => record.checked)
    );
    const tableLoading = ref(false);
    const isLoadingAllTableData = ref(false);
    /** 路由params里的name */
    const paramsFileName = ref("");
    onMounted(() => {
      console.log("onMounted");
      // 只会执行一次?
      // console.log("onActivated");
      if (!route.path.includes("metanet/file")) {
        return;
      }
      // metanet/file?id=2&path=~/材料清单
      const routeDirPath = route.query.path as string;

      console.log("routeDirPath", routeDirPath);
      /** 导航到根目录 */
      const routerToDefaultFilePath = () => {
        console.log("call-routerToDefaultFilePath");
        router.replace({
          name: "MetanetFile",
          query: { id: "1", path: "~" },
        });
      };
      paramsFileName.value = (route.params.name as string) || "";
      // console.log("paramsFileName", paramsFileName.value);
      if (routeDirPath) {
        // 删除原来~ 后面的路径
        historyDir.value.splice(1);
        // ~/test1/test222
        // 正确的目录应该是 ~ 开头的
        const pathArr = routeDirPath.split("/");
        if (pathArr[0] !== "~") {
          routerToDefaultFilePath();
          return;
        }
        historyDir.value.push(
          ...pathArr.slice(1).map((item) => ({
            dirName: item,
            isShared: false,
          }))
        );
        // ~路径不传后端
        const dirFullName = historyDir.value.slice(1).map((i) => i.dirName);
        getAndSetTableDataFn({
          fullName: dirFullName,
        }).catch(() => {
          console.log("路由的路径不存在数据,即将导航到根目录", dirFullName);
          routerToDefaultFilePath();
        });
      } else {
        // 如果没有path 重新给个path
        routerToDefaultFilePath();
      }
    });
    onBeforeRouteUpdate(async (to, from) => {
      // console.log("beforeRouteUpdate", to, from);
      // 浏览器的后退 前进点击, 这时候historyDir没有及时响应,所以这里修改
      const routeDirPath = to.query.path as string;
      console.log("routeDirPath", routeDirPath);
      if (routeDirPath) {
        const pathArr = routeDirPath.split("/");
        if (pathArr.length !== historyDir.value.length) {
          // console.log("用路由update守卫去改变historyDir然后请求数据");
          historyDir.value.splice(1);
          historyDir.value.push(
            ...pathArr.slice(1).map((item) => ({
              dirName: item,
              isShared: false,
            }))
          );
          onRefreshTableData();
        }
      }
    });

    // 提供一个函数给外部
    let getAndSetTableDataFn = (
      params: Omit<ParamsQueryFileByDir, "pageNumber" | "pageSize">
    ) => {
      return new Promise((resolve, reject) => {
        // 重置当前点击表格项
        resetCurrentClickItem();
        tableLoading.value = true;
        // apiLoopQueryFileByDir
        // 先请求第一页
        isLoadingAllTableData.value = true;
        apiQueryFileByDir({ ...params, pageNumber: 1, pageSize: 20 }).then(
          (resultQueryFile) => {
            if (resultQueryFile.err || !resultQueryFile.data.driveListFiles) {
              reject("result-no-list");
              return;
            }
            // 如果返回的 fullName 是空数组的话 代表是根目录
            // 排除null 和 fullName是当前目录的数据(当前目录若不是root , 要加...返回上一级)
            // console.log("网盘文件获取", res);
            const filterDriveListFiles = (dataList: TFileList) =>
              dataList
                // 排序 文件夹在前
                // 加上类型
                .map((i) => {
                  if (!i) return i;
                  if (!i.fullName.length) return null;
                  const obj = { ...i };
                  // 如果目标文件夹是根目录,注册当前目录的id为root
                  if (params.fullName?.length === 0) {
                    historyDir.value[historyDir.value.length - 1].isShared =
                      false;
                  }
                  // 如果是当前目录, 注册fileWindow的路径和描述信息,然后返回null , 下一步把它去除(为了填到表格)
                  if (
                    obj.id === params.dirId ||
                    (obj.fullName.length === params.fullName?.length &&
                      obj.fullName.every(
                        (item, idx) => item === params.fullName?.[idx]
                      ))
                  ) {
                    // 注册当前目录的id
                    // 注册当前目录是否已分享
                    historyDir.value[historyDir.value.length - 1].isShared =
                      obj.isShared;
                    // 这里注册当前文件夹的 dirId 给 historyDir
                    historyDir.value[historyDir.value.length - 1].dirId =
                      obj.id;
                    setCurrentDescriptionModalData(
                      obj.id,
                      lastOfArray(obj.fullName),
                      obj.info.description || ""
                    );
                    return null;
                  }
                  // 如果是父级目录, 返回null , 下一步把它去除
                  const hArr = historyDir.value;
                  if (
                    hArr.length > 1 &&
                    lastOfArray(obj.fullName) === hArr[hArr.length - 2].dirName
                  ) {
                    // obj.fullName = ["..."];
                    return null;
                  } else {
                    // 等于名字最后一项, 因为返回的是 [父级目录,item文件夹名] 所以取最后一个
                    obj.fullName = [lastOfArray(obj.fullName)];
                  }
                  obj.fileType = getFileType({
                    isDir: obj.isDir,
                    fileName: obj.fullName[0],
                  });
                  return obj;
                })
                // filter 里用类型守卫去除null
                .filter((i): i is TFileItem => i !== null);
            // 排序文件夹,上级目录... 到表格最前面
            // .sort(sortByDirType);
            tableData.value = filterDriveListFiles(
              resultQueryFile.data.driveListFiles
            ).map((i) => ({ ...i, checked: false }));
            if (resultQueryFile.data.driveListFiles.length) {
              // 这里从第二页开始, 因为上面请求了第一页
              apiLoopQueryFileByDir({ ...params, startPage: 2 }).then(
                (loopRes) => {
                  tableData.value.push(
                    ...filterDriveListFiles(
                      loopRes.data?.driveListFiles ?? []
                    ).map((i) => ({ ...i, checked: false }))
                  );
                  isLoadingAllTableData.value = false;
                }
              );
            } else {
              isLoadingAllTableData.value = false;
            }
            // console.log("tabledData", tableData);
            // 如果路由里有参数
            if (paramsFileName.value) {
              const found = tableData.value.find(
                (item) =>
                  item && lastOfArray(item.fullName) === paramsFileName.value
              );
              if (found) found.checked = true;
              // TODO 从分享跳转到这里的时候
              // if (found) {
              //   selectedRows.value.push(found);
              //   selectedRowKeys.value.push(found.id);
              //   // currentClickItem.id = found.id;
              //   // currentClickItem.name = lastOfArray(found.fullName);
              // }
              paramsFileName.value = "";
            }
            tableLoading.value = false;
            resolve(resultQueryFile.data.driveListFiles);
          }
        );
      });
    };
    /** 清除当前组件的select数据, 然后重新获取表格数据 */
    const onRefreshTableData = () => {
      console.log("call onRefreshTableData");
      // getAndSetTableDataFn({ dirId: curFolderId.value });
      getAndSetTableDataFn({ fullName: requestDirNameList.value });
    };
    // 返回当前目录的上一级
    const onUpperLevel = (dirIdx: number) => {
      // 1. 如果点的是当前文件夹
      if (dirIdx === historyDir.value.length - 1) {
        // 1.1 如果有 描述文件栏
        if (isShowDescriptionModalFileNameInAddressBar.value) {
          isShowDescriptionModalFileNameInAddressBar.value = false;
          const _dirId = historyDir.value[dirIdx].dirId;
          if (_dirId) setCurrentDescriptionModalDataFromCache(_dirId);
        } else if (dirIdx === 0) {
          historyDir.value.splice(1);
          onRefreshTableData();
          router.push({
            name: "MetanetFile",
            query: {
              id: "1",
              path: historyDir.value.map((i) => i.dirName).join("/"),
            },
          });
          setCurrentDescriptionModalDataFromCache("root");
        }
      } else {
        // 2. 如果点的不是当前文件夹
        // 2.1 如果有 描述文件栏
        if (isShowDescriptionModalFileNameInAddressBar.value) {
          isShowDescriptionModalFileNameInAddressBar.value = false;
          const _dirId = historyDir.value[dirIdx].dirId;
          if (_dirId) setCurrentDescriptionModalDataFromCache(_dirId);
        }
        historyDir.value.splice(dirIdx + 1);
        const dirId = lastOfArray(historyDir.value).dirId;
        onRefreshTableData();
        router.push({
          name: "MetanetFile",
          query: {
            id: "1",
            path: historyDir.value.map((i) => i.dirName).join("/"),
          },
        });
        if (dirId) setCurrentDescriptionModalDataFromCache(dirId);
      }
    };

    // const onUpperLevel = () => {
    //   const len = historyDir.value.length;
    //   // 1. 如果只有根目录
    //   if (len === 1) {
    //     // message.info("已经是根目录");
    //     setCurrentDescriptionModalDataFromCache("root");
    //     return;
    //   }
    //   // 2 跳到上一级
    //   const idx = historyDir.value.length - 2;
    //   onClickHistoryDirUpperLevel(idx);
    // };
    // /** 点击目录历史的面包屑 */
    // const onClickHistoryDirUpperLevel = (idx: number) => {
    //   const showInRoutePath = historyDir.value
    //     .slice(0, idx + 1)
    //     .map((i) => i.dirName)
    //     .join("/");
    //   historyDir.value.splice(idx + 1);
    //   onRefreshTableData();
    //   router.push({
    //     name: "MetanetFile",
    //     query: {
    //       id: "1",
    //       path: showInRoutePath,
    //     },
    //   });
    // };
    const isCanFilePreview = (record: TFileItem) => {
      // 文件或pdf
      const f = record;
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
    /** 是否正在加载pdf */
    const isLoadingPdf = ref(false);
    const isShowBottomPopup = ref(false);
    /** 当前预览的pdf的文件名 */
    const currentPreviewPdfName = ref("");
    const onShowBottomPopup = () => {
      isShowBottomPopup.value = true;
    };
    const onCloseBottomPopup = () => {
      isShowBottomPopup.value = false;
      currentPreviewPdfName.value = "";
    };
    let destoryPdfLoadingTask: (() => void) | null = null;
    /** 点击icon */
    const onItemIconClick = async (record: TFileItem) => {
      const fileType = getFileType({
        isDir: record.isDir,
        fileName: lastOfArray(record.fullName),
      });
      if (/folder$/g.test(fileType)) {
        // 1.是文件夹
        // 1.1 change historyDir
        // historyDir.value.push({
        //   dirId: record.id,
        //   dirName: lastOfArray(record.fullName),
        // });
        // getSetDriveList(record.userFile.id);
        historyDir.value.push({
          dirName: lastOfArray(record.fullName),
          isShared: record.isShared,
        });
        onRefreshTableData();
        router.push({
          name: "MetanetFile",
          query: {
            id: "1",
            path: historyDir.value.map((i) => i.dirName).join("/"),
          },
        });
        isShowDescriptionModalFileNameInAddressBar.value = false;
        // 1.2 change fileData
      } else if (FILE_TYPE_MAP.image.includes(fileType)) {
        // 2.是图片
        const { user, space, id: fileId, fullName } = record;
        // 分享的预览用的token 是该分享数据的token
        const resultPreviewToken = await apiGetPreviewToken();
        // console.log("resultPreviewToken", resultPreviewToken);
        if (resultPreviewToken.err) return;
        const token = resultPreviewToken.data.drivePreviewToken;
        const tableImgList = tableData.value.filter(
          (item) =>
            item !== null && FILE_TYPE_MAP.image.includes(item.fileType ?? "")
        );
        const toPreviewList = tableImgList.map((item) => ({
          src: makePreviewImgUrl(
            token,
            item?.user.id ?? "",
            item?.space ?? "",
            item?.id ?? "",
            item?.fullName.slice(-1)[0] ?? "",
            item?.updatedAt ?? ""
          ),
          w: 0,
          h: 0,
          title: item?.info.description
            ? transformRawDescription(item?.info.description)
            : "",
        }));
        // 找出当前点击的图片的 openIndex
        const startImgIdx = tableImgList.findIndex((i) => i?.id === record.id);
        baseStore.setPhotoSwipeAndShow(toPreviewList, { index: startImgIdx });
      } else if (fileType === "pdf") {
        // 先清理上一次的任务(如果有)
        if (destoryPdfLoadingTask) {
          destoryPdfLoadingTask();
        }
        // console.log("pdf-类型");
        const { user, space, id: fileId, fullName } = record;
        const resultPreviewToken = await apiGetPreviewToken();
        // console.log("resultPreviewToken", resultPreviewToken);
        if (resultPreviewToken.err) return;
        const token = resultPreviewToken.data.drivePreviewToken;
        const pdfUrl = `https://drive-s.owaf.io/preview/${
          user.id
        }/${space.toLowerCase()}/${fileId}/${
          fullName.slice(-1)[0]
        }?token=${token}&t=${dayjs(record.updatedAt).format("YYYYMMDDHHmmss")}`;
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
        console.log("TODO-其他类型");
      }
    };
    /** 地址栏的最后一个元素滑动进入视图 */
    const scrollLastAddressItemIntoView = () => {
      const lastHistoryDirItemElement = [
        ...document.querySelectorAll(".historyDirItem"), // TODO change class
      ].pop();
      // console.log("lastHistoryDirItemElement", lastHistoryDirItemElement);
      // 地址栏最后一个进入视图
      if (lastHistoryDirItemElement) {
        lastHistoryDirItemElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    };
    /** 点击名字 */
    const onItemNameClick = async (record: TFileItem) => {
      // console.log("onItemNameClick");
      const e = record;
      if (!e) return;
      // 如果是文件夹, 就进入文件夹, 更新地址栏和详情数据
      if (e.isDir) {
        // historyDir.value.push({
        //   dirId: e.id,
        //   dirName: lastOfArray(e.fullName),
        // });
        // getSetDriveList(e.id);
        historyDir.value.push({
          dirName: lastOfArray(e.fullName),
          isShared: e.isShared,
        });
        onRefreshTableData();
        router.push({
          name: "MetanetFile",
          query: {
            id: "1",
            path: historyDir.value.map((i) => i.dirName).join("/"),
          },
        });
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
        // throw Error(`没有找到改文件id ${id}的缓存`);
        console.log(`没有找到改文件id ${id}的缓存`);
        currentDescriptionModalFileName.value = "";
        currentDescription.value = "";
        return;
      }
      const { fileName, descSource } = e;
      currentDescriptionModalFileName.value = fileName;
      currentDescription.value = descSource;
    };
    const isShowDescriptionPopup = ref(false);
    const onShowDescriptionPopup = () => {
      isShowDescriptionPopup.value = true;
    };
    const onCloseDescriptionPopup = () => {
      isShowDescriptionPopup.value = false;
    };
    /** 下载 */
    const onDownload = () => {
      selectedRows.value.forEach((record) => {
        const { user, fullName, space, id: fileId } = record;
        // apiGetPreviewToken().then((resultPreviewToken) => {
        // if (resultPreviewToken.err) return;
        apiGetPreviewToken().then((resultPreviewToken) => {
          if (resultPreviewToken.err) return;
          const downloadToken = resultPreviewToken.data.drivePreviewToken;
          // const token = resultPreviewToken.data.drivePreviewToken;
          const url = `https://drive-s.owaf.io/download/${
            user.id
          }/${space.toLowerCase()}/${fileId}/${
            fullName.slice(-1)[0]
          }?token=${downloadToken}&t=${dayjs(record.updatedAt).format(
            "YYYYMMDDHHmmss"
          )}`;
          downloadFileByUrl(url, fullName.slice(-1)[0]);
        });
        // });
      });
    };
    ///
    return {
      svgStr,
      myInfo,
      titleArr,
      tableData,
      historyDir,
      selectedRows,
      onClickLogo,
      onUpperLevel,
      currentClickItem,
      isCurFolderShared,
      tableLoading,
      resetCurrentClickItem,
      isCurClickItemShared,
      isCanFilePreview,
      lastOfArray,
      cacheFormatDescription,
      TAG_COLOR_LIST,
      onItemIconClick,
      onItemNameClick,
      isShowDescriptionPopup,
      isShowDescriptionModalFileNameInAddressBar,
      currentDescription,
      currentDescriptionModalFileName,
      onShowDescriptionPopup,
      onCloseDescriptionPopup,
      onDownload,
      formatBytes,
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