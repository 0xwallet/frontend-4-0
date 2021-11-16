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
        <van-icon size="16px" class="mr-2.5" name="info-o" color="#404A66" />
        <div class="flex-1"></div>
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
        class="mt-1"
        :style="{
          overflow: 'hidden',
          'overflow-y': 'scroll',
          height: 'calc(100% - 40px)',
        }"
      >
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
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import {
  apiLoopQueryFileByDir,
  apiQueryFileByDir,
  ParamsQueryFileByDir,
  TFileItem,
  TFileList,
} from "@/apollo/api";
import { FILE_TYPE_MAP, TAG_COLOR_LIST } from "@/constants";
import { useBaseStore, useUserStore } from "@/store";
import {
  getFileType,
  lastOfArray,
  useSvgWhiteLogo,
  cacheFormatDescription,
} from "@/utils";
import {
  computed,
  defineComponent,
  onActivated,
  onMounted,
  reactive,
  ref,
} from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { MBreadCrump, MFileTypeIcon } from "../../components";

type THistoryDirItem = {
  name: string;
  isShared: boolean;
};

export default defineComponent({
  components: {
    MBreadCrump,
    MFileTypeIcon,
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
    const tableData = ref<TFileList>([]);
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
        name: "~",
        isShared: false,
      },
    ]);
    /** 请求的 fullName (排除根目录) */
    const requestDirNameList = computed(() =>
      historyDir.value.slice(1).map((i) => i.name)
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
    const selectedRows = ref<TFileItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
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
            name: item,
            isShared: false,
          }))
        );
        // ~路径不传后端
        const dirFullName = historyDir.value.slice(1).map((i) => i.name);
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
              name: item,
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
      console.log("call getAndSetTableDataFn");
      return new Promise((resolve, reject) => {
        // 重置选中项目
        selectedRows.value.length = 0;
        selectedRowKeys.value.length = 0;
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
                    return null;
                  }
                  // 如果是父级目录, 返回null , 下一步把它去除
                  const hArr = historyDir.value;
                  if (
                    hArr.length > 1 &&
                    lastOfArray(obj.fullName) === hArr[hArr.length - 2].name
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
            );
            if (resultQueryFile.data.driveListFiles.length) {
              // 这里从第二页开始, 因为上面请求了第一页
              apiLoopQueryFileByDir({ ...params, startPage: 2 }).then(
                (loopRes) => {
                  tableData.value.push(
                    ...filterDriveListFiles(loopRes.data?.driveListFiles ?? [])
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
              if (found) {
                selectedRows.value.push(found);
                selectedRowKeys.value.push(found.id);
                // currentClickItem.id = found.id;
                // currentClickItem.name = lastOfArray(found.fullName);
              }
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
    const onUpperLevel = () => {
      const len = historyDir.value.length;
      // 1. 如果只有根目录
      if (len === 1) {
        // message.info("已经是根目录");
        return;
      }
      // 2 跳到上一级
      const idx = historyDir.value.length - 2;
      onClickHistoryDirUpperLevel(idx);
    };
    /** 点击目录历史的面包屑 */
    const onClickHistoryDirUpperLevel = (idx: number) => {
      const showInRoutePath = historyDir.value
        .slice(0, idx + 1)
        .map((i) => i.name)
        .join("/");
      historyDir.value.splice(idx + 1);
      onRefreshTableData();
      router.push({
        name: "MetanetFile",
        query: {
          id: "1",
          path: showInRoutePath,
        },
      });
    };
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
    return {
      svgStr,
      myInfo,
      titleArr,
      tableData,
      onClickLogo,
      currentClickItem,
      isCurFolderShared,
      resetCurrentClickItem,
      isCurClickItemShared,
      isCanFilePreview,
      lastOfArray,
      cacheFormatDescription,
      TAG_COLOR_LIST,
    };
  },
});
</script>

<style scoped>
</style>