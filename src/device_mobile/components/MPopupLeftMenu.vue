<template>
  <van-popup
    :show="visible"
    @update:show="updateVisible"
    position="left"
    :style="{
      height: '100%',
      width: '250px',
    }"
  >
    <header
      class="px-6 py-7"
      :style="{
        'background-color': '#fafafb',
      }"
    >
      <div class="font-16 font-semibold mb-1">
        {{ userStore.username }}
      </div>
      <!-- 进度条 -->
      <van-progress
        class="mb-0.5"
        :percentage="diskInfo.usedPercent"
        stroke-width="5"
        :show-pivot="false"
      />
      <div class="font-12 text-gray-400">
        {{ diskInfo.usedSpace }} / {{ diskInfo.totalSpace }}

        <span class="ml-4"> {{ diskInfo.usedPercent }}% </span>
      </div>
    </header>
    <!-- 菜单区 -->
    <section class="pl-6 py-4">
      <!-- 网盘 -->
      <div
        class="pt-4"
        :class="{
          expand: expandKeys.includes(0),
        }"
      >
        <div class="pr-6 flex items-center" @click="onExpand(0)">
          <MSvgIcon class="mr-2" icon="CloudServerOutlined" :size="20" />
          <span class="leading-none">{{ $t("metanet.metanet") }}</span>
          <van-icon class="ml-auto" name="arrow" />
        </div>

        <!-- submenu -->
        <div class="subMenu pt-2">
          <!-- 文件 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{ subMenuItemActive: isRouteIncludes('/metanet/file') }"
          >
            <MSvgIcon class="mr-2" icon="FolderOpenOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.file") }}</div>
          </div>
          <!-- 分享 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{ subMenuItemActive: isRouteIncludes('/metanet/share') }"
          >
            <MSvgIcon class="mr-2" icon="ShareAltOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.shareButton") }}</div>
          </div>
          <!-- 发布 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{ subMenuItemActive: isRouteIncludes('/metanet/publish') }"
          >
            <MSvgIcon class="mr-2" icon="GlobalOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.publish") }}</div>
          </div>
          <!-- 收藏 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{ subMenuItemActive: isRouteIncludes('/metanet/collect') }"
          >
            <MSvgIcon class="mr-2" icon="StarOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.collectionButton") }}</div>
          </div>
          <!-- 回收站 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{ subMenuItemActive: isRouteIncludes('/metanet/recycle') }"
          >
            <MSvgIcon class="mr-2" icon="SyncOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.recycle") }}</div>
          </div>
        </div>
      </div>
      <!-- 传输 -->
      <div
        class="pt-4"
        :class="{
          expand: expandKeys.includes(1),
        }"
      >
        <div class="pr-6 flex items-center" @click="onExpand(1)">
          <MSvgIcon class="mr-2" icon="SwapOutlined" :size="20" />
          <span class="leading-none">{{ $t("metanet.transport") }}</span>
          <van-icon class="ml-auto" name="arrow" />
        </div>
        <!-- submenu -->
        <div class="subMenu pt-2">
          <!-- 上传 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{
              subMenuItemActive: isRouteIncludes('/transport/uploading'),
            }"
          >
            <MSvgIcon class="mr-2" icon="CloudUploadOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.uploadButton") }}</div>
          </div>
          <!-- 历史 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{
              subMenuItemActive: isRouteIncludes('/transport/uploadHistory'),
            }"
          >
            <MSvgIcon class="mr-2" icon="HistoryOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.uploadHistory") }}</div>
          </div>
          <!-- 空投 -->
          <div
            class="relative flex items-center pl-6 py-2"
            :class="{
              subMenuItemActive: isRouteIncludes('/transport/peerTransfer'),
            }"
          >
            <MSvgIcon class="mr-2" icon="UploadOutlined" :size="18" />
            <div class="subMenuText">{{ $t("metanet.peerTransfer") }}</div>
          </div>
        </div>
      </div>
      <div
        class="pt-4"
        :class="{
          expand: expandKeys.includes(2),
        }"
      >
        <div class="pr-6 flex items-center" @click="onExpand(2)">
          <MSvgIcon class="mr-2" icon="translate" :size="20" />
          <span class="leading-none">{{ curLocale }}</span>
          <van-icon class="ml-6" name="arrow" />
        </div>
        <!-- submenu -->
        <div class="subMenu pt-2">
          <div
            v-for="item in localeSelectList"
            :key="item.name"
            class="relative flex items-center pl-7 py-2"
            @click="onSelectLocale(item)"
          >
            <div class="subMenuText">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </section>
  </van-popup>
</template>

<script lang="ts">
import { apiQueryMeSpace } from "@/apollo/api";
import { useUserStore } from "@/store";
import { formatBytes } from "@/utils";
import { useLocalStorage } from "@vueuse/core";
import { remove } from "lodash-es";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { MSvgIcon } from "../components";

/** 当前展开的索引,0网盘,1传输,2国际化 */
type ExpandV = 0 | 1 | 2;

export default defineComponent({
  components: {
    MSvgIcon,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:visible"],
  setup(props, { emit }) {
    const globalComposer = useI18n();
    const [route, router] = [useRoute(), useRouter()];
    const updateVisible = (v: boolean) => {
      emit("update:visible", v);
    };
    const userStore = useUserStore();

    function useDiskInfo() {
      const diskInfo = reactive({
        usedSpace: "",
        totalSpace: "",
        usedPercent: "",
      });
      apiQueryMeSpace().then((resultQuerySpace) => {
        if (resultQuerySpace.err) return;
        const { usedSpace, totalSpace, availableSpace } =
          resultQuerySpace.data.me.driveSetting;
        diskInfo.usedSpace = formatBytes(+usedSpace);
        diskInfo.totalSpace = formatBytes(+totalSpace);
        diskInfo.usedPercent = ((+usedSpace / +totalSpace) * 100).toFixed(0);
      });
      return { diskInfo };
    }
    /** 是否路由包含对应字符串 */
    const isRouteIncludes = (str: string) => route.fullPath.includes(str);

    function useMenu() {
      const expandKeys = reactive<ExpandV[]>([]);
      // 根据路由自动展开
      watch(
        () => route,
        (newVal) => {
          if (newVal.fullPath.includes("metanet")) {
            if (!expandKeys.includes(0)) expandKeys.push(0);
          } else if (newVal.fullPath.includes("transport")) {
            if (!expandKeys.includes(1)) expandKeys.push(1);
          }
        },
        {
          // TODO deep performance?
          deep: true,
        }
      );
      const localeList = [
        { name: "简体中文", value: "zh_CN" },
        { name: "English", value: "en_US" },
      ];
      const curLocale = ref("");
      const localeSelectList = ref<{ name: string; value: string }[]>([]);
      watch(
        () => curLocale.value,
        (newVal) => {
          console.log("f-newVal", newVal);
          localeSelectList.value = localeList.filter((i) => i.name !== newVal);
        }
      );
      onMounted(() => {
        const v = localStorage.getItem("locale");
        if (v) {
          curLocale.value = localeList.find((i) => i.value === v)?.name ?? "";
        }
      });
      /** 展开菜单 */
      const onExpand = (v: ExpandV) => {
        expandKeys.includes(v)
          ? remove(expandKeys, (i) => i === v)
          : expandKeys.push(v);
      };
      const onSelectLocale = (item: { name: string; value: string }) => {
        // TODO 设置语言后刷新?
        curLocale.value = item.name;
        globalComposer.locale.value = item.value;
        useLocalStorage("locale", "zh_CN").value = item.value;
      };
      return {
        expandKeys,
        onExpand,
        curLocale,
        localeSelectList,
        onSelectLocale,
      };
    }

    return {
      updateVisible,
      userStore,
      ...useDiskInfo(),
      ...useMenu(),
      isRouteIncludes,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.van-icon) {
  transition: 0.3s;
}
.subMenu {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.2s ease-in-out;
  color: #666;
}
.subMenuText {
  height: 20px;
  line-height: 20px;
}
.subMenuItemActive {
  &::after {
    content: "";
    position: absolute;
    right: 1px;
    top: 3px;
    bottom: 3px;
    width: 2px;
    background: #d0021b;
  }
}
.expand {
  .van-icon {
    transform: rotate(90deg);
  }
  .subMenu {
    max-height: 520px;
    opacity: 1;
  }
}
</style>