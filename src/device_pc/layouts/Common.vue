<template>
  <div class="w-full h-full">
    <a-layout
      hasSider
      prefixCls="ant-layout"
      class="ant-layout"
      :style="{
        'min-height': '100%',
      }"
      id="global-layout-component"
    >
      <!-- 左边菜单区 -->
      <a-layout-sider
        class="relative"
        v-model:collapsed="collapsed"
        :trigger="null"
        collapsible
      >
        <!-- logo -->
        <div id="siderLogoBox" class="flex h-12 items-center justify-center">
          <div id="siderLogoSvg" v-html="svgLogoStr"></div>
          <div id="siderLogoText" class="text-white text-lg font-bold pl-3">
            <!-- {{ PRODUCT_NAME }} -->
          </div>
        </div>
        <!-- 切换黑白主题 -->
        <!-- :inline-collapsed="collapsed" -->
        <a-menu
          mode="inline"
          theme="dark"
          :inline-collapsed="collapsed"
          v-model:openKeys="openKeys"
          v-model:selectedKeys="selectedKeys"
          @click="onMenuSelect"
        >
          <a-menu-item key="dashboard">
            <PieChartOutlined />
            <span>{{ $t("metanet.dashboard") }}</span>
          </a-menu-item>
          <!-- <a-sub-menu key="sub1">
            <template #title>
              <span class="flex items-center">
                <MailOutlined />
                <span>Navigation One</span>
              </span>
            </template>
            <a-menu-item key="5">Option 5</a-menu-item>
            <a-menu-item key="6">Option 6</a-menu-item>
            <a-menu-item key="7">Option 7</a-menu-item>
            <a-menu-item key="8">Option 8</a-menu-item>
          </a-sub-menu> -->
          <a-sub-menu key="metanet">
            <template #title>
              <span class="flex items-center">
                <CloudServerOutlined />
                <span>{{ $t("metanet.metanet") }}</span>
              </span>
            </template>
            <!-- TODO 跟路由相关联 v-for -->
            <a-menu-item key="file" class="relative">
              <div class="flex items-center">
                <FolderOpenOutlined />
                {{ $t("metanet.file") }}
                <i v-if="navFileTabCount > 0" class="navItemDot">{{
                  navFileTabCount
                }}</i>
              </div>
            </a-menu-item>
            <a-menu-item key="share">
              <ShareAltOutlined />
              {{ $t("metanet.shareButton") }}
            </a-menu-item>
            <a-menu-item key="publish">
              <GlobalOutlined />
              {{ $t("metanet.publish") }}
            </a-menu-item>
            <a-menu-item key="collect">
              <StarOutlined />
              {{ $t("metanet.collectionButton") }}
            </a-menu-item>
            <a-menu-item key="recycle">
              <SyncOutlined />
              {{ $t("metanet.recycle") }}
            </a-menu-item>
            <!-- <a-menu-item key="account">{{ $t("common.account") }}</a-menu-item>
            <a-menu-item key="metanet">{{ $t("common.metanet") }}</a-menu-item>
            <a-menu-item key="security">{{
              $t("common.security")
            }}</a-menu-item> -->
          </a-sub-menu>
          <a-sub-menu key="transport">
            <template #title>
              <span class="flex items-center">
                <SwapOutlined
                  :style="{
                    transform: 'rotate(90deg)',
                  }"
                />
                <span> {{ $t("metanet.transport") }}</span>
              </span>
            </template>
            <a-menu-item key="uploading">
              <div class="flex items-center">
                <CloudUploadOutlined />
                {{ $t("metanet.uploadButton") }}
                <i v-if="uploadingCount > 0" class="navItemDot">{{
                  uploadingCount
                }}</i>
              </div>
            </a-menu-item>
            <a-menu-item key="uploadHistory">
              <div class="flex items-center">
                <HistoryOutlined />
                {{ $t("metanet.uploadHistory") }}
                <i v-if="uploadSuccessCount > 0" class="navItemDot">{{
                  uploadSuccessCount
                }}</i>
              </div>
            </a-menu-item>
            <a-menu-item key="peerTransfer">
              <UploadOutlined />
              {{ $t("metanet.peerTransfer") }}
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
        <!-- nkn 状态 -->
        <transition name="no-mode-fade">
          <div
            v-if="collapsed"
            key="1"
            class="
              nknStatus
              fixed
              w-6
              h-6
              flex
              items-center
              justify-center
              bottom-0
              text-white
              py-1
              bg-white
              rounded-full
            "
            :style="{
              left: '28px',
              bottom: '20px',
              color: 'rgba(0, 0, 0, 0.85)',
            }"
          >
            <!-- 状态区 -->
            <!-- nkn节点状态 -->
            <!-- <a-tooltip :title="`nkn节点: ${nknClientConnectStatusMap.count}/4`"> -->
            <div class="cursor-pointer flex items-center justify-center">
              <LoadingOutlined v-if="isLoadingNknMulticlient" class="font-14" />
              <img
                v-else
                class="inline-block"
                :src="require(`@/assets/images/wifi_${nknStatusCount}.png`)"
                :style="{
                  width: '14px',
                  height: '14px',
                }"
              />
            </div>
            <!-- </a-tooltip> -->
          </div>
          <div
            v-else
            key="2"
            class="
              nknStatus
              fixed
              w-44
              bottom-0
              text-white
              py-1
              bg-white
              rounded-full
            "
            :style="{
              left: '12px',
              right: '14px',
              bottom: '20px',
              color: 'rgba(0, 0, 0, 0.85)',
            }"
          >
            <!-- 状态区 -->
            <!-- nkn节点状态 -->
            <template v-if="isLoadingNknMulticlient">
              <div class="flex items-center justify-center font-14">
                <LoadingOutlined class="mr-2" />
                初始化nkn节点
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-center">
                <!-- @click="onResetNknMultiClient" -->
                <img
                  class="inline-block mr-2"
                  :src="require(`@/assets/images/wifi_${nknStatusCount}.png`)"
                  :style="{
                    width: '14px',
                    height: '14px',
                  }"
                />
                <div v-if="lockBeforeCollapsed">
                  nkn节点 : {{ nknStatusCount }}/4
                </div>
              </div>
            </template>

            <!-- </a-tooltip> -->
          </div>
        </transition>
      </a-layout-sider>
      <a-layout prefixCls="ant-layout">
        <a-layout-header class="">
          <div
            class="bg-white flex items-center px-0"
            :style="{
              'min-height': '48px',
            }"
          >
            <menu-unfold-outlined
              v-if="collapsed"
              class="trigger"
              @click="onChangeCollapsed"
            />
            <menu-fold-outlined
              v-else
              class="trigger"
              @click="onChangeCollapsed"
            />
            <!-- 面包屑 sub/item -->
            <!-- <a-breadcrumb class="inline-block">
              <a-breadcrumb-item v-for="item in breadArr" :key="item">
                {{ item }}
              </a-breadcrumb-item>
            </a-breadcrumb> -->
            <!-- 撑开中间 -->
            <div class="flex-1">
              <nav
                id="navBox"
                class="bg-white px-2 py-1 pt-2 flex flex-wrap items-center"
              >
                <!-- 激活状态 hover 状态  关闭按钮(hover放大) -->
                <div
                  v-for="item in navList"
                  :key="item.uniqueId"
                  @click="onClickNavTab(item)"
                  class="
                    relative
                    border-solid border
                    whitespace-nowrap
                    rounded-sm
                    py-px
                    pl-3
                    pr-1
                    cursor-move
                    mr-2
                    mb-1
                    flex
                    items-center
                  "
                  :class="{
                    navTabBox: item.routeName !== 'Dashboard',
                    'border-transparent':
                      activeNavUniqueId === exactUniqueTabId(item.routePath),
                    activeNavItem:
                      activeNavUniqueId === exactUniqueTabId(item.routePath),
                    'border-gray-200':
                      activeNavUniqueId !== exactUniqueTabId(item.routePath),
                  }"
                  :style="{
                    height: '25px',
                    'line-height': '20px',
                  }"
                >
                  <!-- 'text-white': -->
                  <!-- activeNavUniqueId === exactUniqueTabId(item.routePath), -->
                  <template v-if="!item.routePath.includes('/metanet/file')">
                    <span class="text-xs pr-2 cursor-pointer">
                      <PieChartOutlined
                        v-if="item.routePath.includes('dashboard')"
                        class="mr-1"
                      />
                      <ShareAltOutlined
                        v-else-if="item.routePath.includes('metanet/share')"
                        class="mr-1"
                      />
                      <GlobalOutlined
                        v-else-if="item.routePath.includes('metanet/publish')"
                        class="mr-1"
                      />
                      <StarOutlined
                        v-else-if="item.routePath.includes('metanet/collect')"
                        class="mr-1"
                      />
                      <SyncOutlined
                        v-else-if="item.routePath.includes('metanet/recycle')"
                        class="mr-1"
                      />
                      <CloudUploadOutlined
                        v-else-if="
                          item.routePath.includes('transport/uploading')
                        "
                        class="mr-1"
                      />
                      <HistoryOutlined
                        v-else-if="
                          item.routePath.includes('transport/uploadHistory')
                        "
                        class="mr-1"
                      />
                      <UploadOutlined
                        v-else-if="
                          item.routePath.includes('transport/peerTransfer')
                        "
                        class="mr-1"
                      />
                      {{ $t(`${item.title}`) }}
                    </span>
                    <!-- 当只有一个的时候不能关闭 -->
                    <!-- 预留个15.15的box -->
                    <span
                      class="
                        navItemCloseBox
                        inline-block
                        w-3.5
                        h-3.5
                        rounded-full
                        cursor-pointer
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <CloseOutlined
                        v-if="navList.length > 1"
                        @click.stop="onCloseNavItem(item.routePath)"
                        class="transform scale-75"
                      />
                    </span>
                  </template>
                  <a-tooltip
                    v-else
                    placement="top"
                    overlayClassName="tabToolTip"
                  >
                    <template #title>
                      <!-- <div class="text-xs flex items-center">
                    <div class="mr-1">路径:</div>
                    <div>
                      {{ getFileWindowTips(item, "path") }}
                    </div>
                  </div>
                  <div class="font-12 flex items-center">
                    <div class="mr-1">描述:</div>
                    <div>
                      <template
                        v-if="getFileWindowTips(item, 'desc').tagArr.length"
                      >
                        <a-tag
                          :style="{
                            height: '16px',
                            'line-height': '16px',
                          }"
                          class="inline-block"
                          color="orange"
                          v-for="item in getFileWindowTips(item, 'desc').tagArr"
                          :key="item"
                          >{{ item }}</a-tag
                        > </template
                      >{{ getFileWindowTips(item, "desc").text }}
                    </div>
                  </div> -->
                      <span class="mr-2">
                        {{ getFileWindowTips(item, "path") }}
                      </span>
                      <template
                        v-if="getFileWindowTips(item, 'desc').tagArr.length"
                      >
                        <a-tag
                          :style="{
                            height: '16px',
                            'line-height': '16px',
                          }"
                          class="inline-block"
                          color="orange"
                          v-for="item in getFileWindowTips(item, 'desc').tagArr"
                          :key="item"
                          >{{ item }}</a-tag
                        ></template
                      >{{ getFileWindowTips(item, "desc").text }}
                    </template>
                    <div class="flex items-center">
                      <span class="text-xs pr-2 cursor-pointer">
                        <FolderOpenOutlined class="mr-1" />
                        {{ $t(`${item.title}`) }}
                        <!-- {{ getFileWindowTips(item, "path") }} -->
                      </span>
                      <!-- 当只有一个的时候不能关闭 -->
                      <!-- 预留个15.15的box -->
                      <span
                        class="
                          navItemCloseBox
                          w-3.5
                          h-3.5
                          rounded-full
                          inline-block
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <CloseOutlined
                          v-if="navList.length > 1"
                          @click.stop="onCloseNavItem(item.routePath)"
                          class="transform scale-75"
                        />
                      </span>
                    </div>
                  </a-tooltip>
                </div>
              </nav>
            </div>
            <div
              class="flex items-center h-full px-4"
              :style="{
                'font-size': '18px',
              }"
            >
              <XLocaleSwither
                class="cursor-pointer text-gray-600 localeSwitcher"
              />
            </div>
            <!-- <div class="px-2 mr-4 h-full flex items-center cursor-pointer"> -->
            <!-- </div> -->

            <!-- 头像 用户名 -->
            <!-- <a-avatar :size="24" class="leading-8">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="pl-2">{{ username }}</span> -->

            <a-dropdown
              :trigger="['hover']"
              placement="bottomRight"
              overlayClassName="avatarDropdown"
            >
              <div
                class="
                  px-4
                  h-full
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                "
              >
                <!-- hover:bg-gray-100 -->
                <!-- <a-avatar :size="24" class="leading-8">
                  <template #icon><UserOutlined /></template>
                </a-avatar> -->
                <div
                  class="
                    relative
                    w-6
                    h-6
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-xs text-white
                  "
                  :style="{
                    background: 'linear-gradient(45deg, #00acc1, #00d5e2)',
                  }"
                >
                  {{ detailInfo.username[0].toUpperCase() }}
                  <div
                    class="absolute top-0 right-0 rounded-full"
                    :style="{
                      width: '10px',
                      height: '10px',
                      top: '-2px',
                      right: '-2px',
                      border: '2px solid white',
                      background: userStatusColorMap[currentUserStatus].color,
                      transition: 'all .s ease-in-out',
                    }"
                  ></div>
                </div>
                <!-- <span class="pl-2">{{ detailInfo.username }}</span> -->
              </div>
              <template #overlay>
                <a-menu>
                  <div
                    class="px-4 pt-2 pb-3 flex items-center"
                    :style="{
                      'border-bottom': '1px solid #eee',
                    }"
                  >
                    <div
                      class="
                        w-16
                        h-16
                        flex
                        mr-3
                        items-center
                        justify-center
                        rounded-lg
                        text-xl text-white
                      "
                      :style="{
                        background: 'linear-gradient(45deg, #00acc1, #00d5e2)',
                      }"
                    >
                      {{ detailInfo.username[0].toUpperCase() }}
                    </div>

                    <div>
                      <div class="text-base">
                        {{ detailInfo.username }}
                      </div>
                      <div class="opacity-70">{{ detailInfo.email }}</div>
                      <div class="flex items-center">
                        <div
                          class="rounded-full w-2 h-2 mr-2"
                          :style="{
                            width: '6px',
                            height: '6px',
                            background:
                              userStatusColorMap[currentUserStatus].color,
                            transition: 'all .2s ease-in-out',
                          }"
                        ></div>
                        <div class="opacity-70">
                          {{ userStatusColorMap[currentUserStatus].text }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <a-menu-item
                    key="Account"
                    class="
                      relative
                      setStatus
                      pl-4
                      mt-2
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span class="opacity-70">设置状态</span>
                    <span>
                      <RightOutlined
                        :style="{
                          'font-size': '10px',
                        }"
                      />
                    </span>
                    <!-- 设置状态 hover才显示的box -->
                    <div
                      class="
                        setStatusOptions
                        absolute
                        bg-white
                        px-4
                        py-4
                        cursor-default
                      "
                      :style="{
                        width: '254px',
                        'border-radius': '24px',
                        'box-shadow': '0 2px 8px rgb(0 0 0 / 15%)',
                        display: 'none',
                        left: '-248px',
                        top: '-30px',
                      }"
                    >
                      <div
                        class="
                          setStatusOptionsItem
                          flex
                          items-center
                          px-2
                          py-1
                          cursor-pointer
                        "
                        v-for="(value, key) in userStatusColorMap"
                        :key="key"
                        @click="setUserStatus(key)"
                      >
                        <div
                          class="rounded-full w-2 h-2 mr-2"
                          :style="{
                            width: '8px',
                            height: '8px',
                            background: value.color,
                            'margin-top':
                              key === 'offline'
                                ? '-32px'
                                : key === 'busy'
                                ? '-15px'
                                : '0px',
                          }"
                        ></div>
                        <div class="flex-1">
                          <div class="flex items-center justify-between">
                            <div
                              :class="{
                                'opacity-70': key !== currentUserStatus,
                              }"
                            >
                              {{ value.text }}
                            </div>
                            <div v-if="key === currentUserStatus">
                              <CheckOutlined
                                :style="{
                                  color: userStatusColorMap.online.color,
                                  'font-size': '11px',
                                }"
                              />
                            </div>
                          </div>
                          <div
                            v-if="value.tips"
                            class="opacity-40 whitespace-normal flex-1 text-xs"
                          >
                            {{ value.tips }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </a-menu-item>
                  <a-menu-item
                    @click="onAvatarDropdownMenuClick('Account')"
                    key="Account"
                    class="pl-4 flex items-center opacity-70"
                  >
                    账户
                  </a-menu-item>
                  <a-menu-item
                    @click="onAvatarDropdownMenuClick('Security')"
                    key="Security"
                    class="pl-4 mb-2 flex items-center opacity-70"
                  >
                    安全
                  </a-menu-item>
                  <div
                    class="w-full"
                    :style="{
                      'border-top': '1px solid #eee',
                    }"
                  ></div>
                  <a-menu-item
                    key="Logout"
                    class="
                      pl-4
                      mt-2
                      flex
                      items-center
                      mb-1
                      opacity-70
                      overflow-hidden
                    "
                    @click="onAvatarDropdownMenuClick('Logout')"
                  >
                    登出
                    <!-- <LogoutOutlined />{{ $t("common.dropdownItemLoginOut") }} -->
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <!-- tabbar -->
        </a-layout-header>
        <a-layout-content
          class="bg-white mx-4 my-4 rounded-xl"
          :style="{
            minHeight: 'calc(100vh - 100px)',
          }"
        >
          <router-view class="p-4 pb-6" v-slot="{ Component }">
            <keep-alive :include="keepAliveList">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script lang="ts">
import {
  computed,
  createVNode,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudServerOutlined,
  SwapOutlined,
  FolderOpenOutlined,
  ShareAltOutlined,
  GlobalOutlined,
  StarOutlined,
  SyncOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined,
  RightOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import { remove } from "lodash-es";
import { useRoute, useRouter } from "vue-router";
import { PRODUCT_NAME } from "@/constants";
import { XLocaleSwither } from "../components";
import { useBaseStore, useTransportStore, useUserStore } from "@/store";
import { Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { useLocalStorage } from "@vueuse/core";
import Sortable from "sortablejs";
import { exactUniqueTabId, useSvgWhiteLogo } from "@/utils";

type TMenuSelect = {
  domEvent: Event;
  item: {
    mode: string;
    eventKey: string;
    // ...
  };
  key: string;
  keyPath: string[];
  selectedKeys: string[];
};
type TBreadcrumb = {
  path: string;
  name: string;
  meta: {
    needAuth: boolean;
    title: string;
  };
};
type TNavItem = {
  // routeName: string;
  routePath: string;
  title: string;
  uniqueId: string; // navItem 唯一标识
};
type UserStatus = "online" | "leave" | "busy" | "offline";

export default defineComponent({
  components: {
    // icon
    CloudServerOutlined,
    SwapOutlined,
    FolderOpenOutlined,
    ShareAltOutlined,
    GlobalOutlined,
    StarOutlined,
    SyncOutlined,
    UploadOutlined,
    CloudUploadOutlined,
    HistoryOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    CloseOutlined,
    PieChartOutlined,
    RightOutlined,
    CheckOutlined,
    LoadingOutlined,
    // ExclamationCircleOutlined,
    //
    XLocaleSwither,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();
    const transPortStore = useTransportStore();
    const userStore = useUserStore();
    const baseStore = useBaseStore();
    // console.log("router", router);
    /** logo区域 */
    function useSvgLogo() {
      return { PRODUCT_NAME, svgLogoStr: useSvgWhiteLogo() };
    }
    /** 用户状态: */
    function useUserStatus() {
      const currentUserStatus = ref<UserStatus>("online");
      const setUserStatus = (s: UserStatus) => (currentUserStatus.value = s);
      const makeItem = (color: string, text: string, tips: string) => {
        return { color, text, tips };
      };
      const userStatusColorMap: {
        [key in UserStatus]: {
          color: string;
          text: string;
          tips: string;
        };
      } = {
        online: makeItem("#6dcc50", "在线", ""),
        leave: makeItem("#f9a646", "离开", ""),
        busy: makeItem("#ff625c", "忙碌", "您将不再收到任何聊天通知。"),
        offline: makeItem(
          "#a4a4a7",
          "离线",
          " 即使您处于离线状态，也可以访问网盘。"
        ),
      };
      return {
        currentUserStatus,
        setUserStatus,
        userStatusColorMap,
      };
    }
    /** 菜单数据 */
    function useLayoutMenu() {
      // console.log("route", route);
      // 默认打开网盘 传输
      const openKeys = ref(["metanet", "transport"]);
      const selectedKeys = ref([""]);
      /** 面包屑 */
      const breadArr = ref<string[]>([]);
      // 观察路由path 改变菜单
      watch(
        () => route,
        (newRoute) => {
          // console.log("route-newVal", newRoute.fullPath);
          const pathStr = newRoute.path;
          const fullPath = newRoute.fullPath;
          // console.log("routeNewVal", pathStr, openKeys.value);
          // console.log("pathStr", newRoute, pathStr);
          // /general/account
          const [s, subKey, itemKey] = pathStr.split("/");
          // filter undefinde itemKey
          breadArr.value = [subKey, itemKey]
            .filter((i) => !!i)
            .map((i) => t(`metanet.${i}`));
          // 这里先针对dashboard 特殊处理
          /** 是否dashboard 路由 */
          const isDashBoard = subKey === "dashboard";
          // openKeys.value = [subKey];
          if (isDashBoard) {
            selectedKeys.value = [subKey];
          } else {
            selectedKeys.value = [itemKey];
          }
          // 控制tab 栏
          const newRouteTitle = newRoute.meta.title as string;
          activeNavUniqueId.value = exactUniqueTabId(fullPath);
          if (
            !navList.value.some(
              (i) =>
                exactUniqueTabId(i.routePath) === exactUniqueTabId(fullPath)
            )
          ) {
            navList.value.push({
              routePath: fullPath,
              uniqueId: exactUniqueTabId(fullPath),
              title: newRouteTitle,
            });
          } else if (fullPath.includes("metanet/file")) {
            // 如果tab 有相同id的文件窗口了, 更新routePath
            const found = navList.value.find(
              (i) =>
                exactUniqueTabId(i.routePath) === exactUniqueTabId(fullPath)
            );
            if (found) found.routePath = fullPath;
          } else if (fullPath.includes("metanet/sharedFile")) {
            // 如果是分享页面,更新routePath
            const found = navList.value.find(
              (i) =>
                exactUniqueTabId(i.routePath) === exactUniqueTabId(fullPath)
            );
            if (found) found.routePath = fullPath;
          }
        },
        {
          immediate: true,
          deep: true,
        }
      );
      // 测试打印 navlist
      // watch(
      //   () => navList,
      //   (newVal) => {
      //     console.log("watch-navList", newVal);
      //   },
      //   {
      //     immediate: true,
      //     deep: true,
      //   }
      // );
      const collapsed = ref(false);
      const lockBeforeCollapsed = ref(true);
      const onChangeCollapsed = () => {
        if (collapsed.value === true) {
          collapsed.value = !collapsed.value;
          lockBeforeCollapsed.value = true;
        } else {
          lockBeforeCollapsed.value = false;
          setTimeout(() => {
            collapsed.value = !collapsed.value;
          }, 0);
        }
      };
      const onMenuSelect = ({ item, key, keyPath }: TMenuSelect) => {
        // key: "account"
        // keyPath: (2) ["account", "general"]
        // console.log("选中的菜单key", key, keyPath);
        const toRoute = "/" + keyPath.reverse().join("/");
        // console.log("onMenuSelect-toRoute", toRoute);
        // /metanet/file
        // console.log("toRouwte", toRoute, route);
        // 新开文件tab
        if (toRoute === "/metanet/file") {
          // 要打开的窗口id
          const windowId = baseStore.getNewOpenWindowId();
          // console.log(`左菜单栏点击的,获取的还未激活的windoId,${windowId}`);
          router.push({
            name: "MetanetFile",
            query: {
              id: windowId,
              path: "~",
            },
          });
        } else {
          if (toRoute !== route.fullPath) {
            // console.log("router.push", item);
            // /general/account
            router.push({
              path: toRoute,
            });
          }
        }
      };
      return {
        breadArr,
        openKeys,
        selectedKeys,
        collapsed,
        lockBeforeCollapsed,
        onChangeCollapsed,
        onMenuSelect,
        exactUniqueTabId,
      };
    }
    /** TODO 用api query回来带有头像的数据 */
    function useUserDetailInfo() {
      const onAvatarDropdownMenuClick = (key: string) => {
        // console.log("onAvatarDropdownMenuClick-key", key);
        if (key === "Logout") {
          Modal.confirm({
            icon: createVNode(ExclamationCircleOutlined),
            title: t("common.logoutTip"),
            content: t("common.logoutMessage"),
            onOk: () => {
              return new Promise<void>((resolve) => {
                userStore.signOutAndClear();
                setTimeout(() => {
                  resolve();
                  router.push({
                    name: "Login",
                    query: {
                      redirect: route.fullPath,
                    },
                  });
                }, 300);
              });
            },
          });
        } else {
          router.push({ name: key });
        }
      };
      const detailInfo = computed(() => {
        return {
          avatar: userStore.avatar,
          username: userStore.username,
          email: userStore.email,
        };
      });
      // console.log("detailInfo", detailInfo);
      return {
        detailInfo,
        onAvatarDropdownMenuClick,
      };
    }
    const activeNavUniqueId = ref("");
    // 默认显示dashboard
    // const navList: TNavItem[] = reactive([
    //   // {
    //   //   // routeName: "Dashboard",
    //   //   routePath: "/dashboard",
    //   //   title: "common.dashboard",
    //   //   icon: "dashboard", // 从属的父级菜单的icon
    //   // },
    // ]);
    const navList = useLocalStorage<TNavItem[]>("navList", []);
    /** navlist 中文件tab的数量 */
    const navFileTabCount = computed(() => {
      return navList.value.filter((i) => i.routePath.includes("metanet/file"))
        .length;
    });
    // 同时加载本地的fileWindow数据
    baseStore.loadStorageFileWindow();
    /** nav tab栏 */
    function useNavTabs() {
      // console.log("route", route);
      // activeNavUniqueId = ref(route.meta.title as string);
      // navList = reactive([route.meta.title as string]);
      const onClickNavTab = (item: TNavItem) => {
        // router.push()
        // console.log("onClickNavTab", item);
        // 如果不是当前的路由的tab , 就跳转
        if (item.routePath !== route.fullPath) {
          router.push(item.routePath);
        }
      };
      const onCloseNavItem = (itemRouteFullPath: string) => {
        // console.log("onCloseNavItem", itemRouteFullPath, activeNavUniqueId.value);
        // 1 如果关闭的是当前,路由到上一个且数组移除
        // 2 如果关闭的是其他,直接数组移除
        // metanet/file
        const closeItemUniqueId = exactUniqueTabId(itemRouteFullPath);
        if (closeItemUniqueId === activeNavUniqueId.value) {
          // router.push;
          const foundIndex = navList.value.findIndex(
            (v) => exactUniqueTabId(v.routePath) === closeItemUniqueId
          );
          // console.log("foundIndex", foundIndex);
          remove(
            navList.value,
            (v) => exactUniqueTabId(v.routePath) === closeItemUniqueId
          );
          if (itemRouteFullPath.includes("metanet/file")) {
            // 如果关闭的是文件窗口, 需要重置对应的窗口id
            baseStore.setWindowIdItem(+closeItemUniqueId, null);
          }
          const toRoutePath =
            foundIndex > 0
              ? // 代表有前一项,push 到前一项
                navList.value[foundIndex - 1].routePath
              : // 没有前一项,push用下一项(也就是删除后的foundIndex的位置)
                navList.value[foundIndex].routePath;
          // console.log("-----------", toRoutePath);
          router.push(toRoutePath);
        } else {
          remove(
            navList.value,
            (v) => exactUniqueTabId(v.routePath) === closeItemUniqueId
          );
          if (closeItemUniqueId.includes("metanet/file")) {
            // 如果关闭的是文件窗口, 需要重置对应的窗口id
            baseStore.setWindowIdItem(+closeItemUniqueId, null);
          }
        }
      };
      /** 获取文件窗口id 的路径或者描述信息 */
      const getFileWindowTips = (item: TNavItem, type: "path" | "tag") => {
        const windowId = exactUniqueTabId(item.routePath);
        // console.log(
        //   "windowId",
        //   item.routePath,
        //   windowId,
        //   baseStore.fileWindow,
        //   baseStore.fileWindow[windowId]
        // );
        return type === "path"
          ? baseStore.fileWindow[windowId]?.path || ""
          : baseStore.fileWindow[windowId]?.desc || { tagArr: [], text: "" };
      };
      /** 上传中的数量 */
      const uploadingCount = computed(() => {
        // return 10;
        return transPortStore.uploadingList.length;
      });
      // 首次打开装载本地存储里已完成的list
      transPortStore.loadStorageFinishedList();
      /** 上传成功的数量 */
      const uploadSuccessCount = computed(() => {
        return transPortStore.uploadSuccessList.length;
      });
      /** 需要keep-alive 的组件 ,组件的name === 路由里注册的name,根据navTab 动态改变 */
      // const keepAliveList = [
      //   "MetanetFile",
      //   "MetanetShare",
      //   "MetanetPublish",
      //   "MetanetCollect",
      //   "MetanetRecycle",
      //   "MetanetSharedFile" // TODO 多个链接怎么办
      // ];
      const mapPathToName = (path: string) => {
        // console.log("mappath", path);
        if (path.includes("/metanet/file")) return "MetanetFile";
        if (path.includes("/metanet/share")) return "MetanetShare";
        if (path.includes("/metanet/publish")) return "MetanetPublish";
        if (path.includes("/metanet/collect")) return "MetanetCollect";
        if (path.includes("/metanet/recycle")) return "MetanetRecycle";
        if (path.includes("/metanet/sharedFile")) return "MetanetSharedFile";
        if (path.includes("/transport/uploading")) return "TransportUpLoading";
        if (path.includes("/metanet/uploadHistory")) return "TransportHistory";
        if (path.includes("/metanet/peerTransfer"))
          return "TransportPeerTransfer";
        else return "";
      };
      const keepAliveList = computed(() => {
        const arr = navList.value
          .filter((i) => !i.routePath.includes("dashboard"))
          .map((i) => mapPathToName(i.routePath));
        // console.log("common-keepAliveList", arr);
        return arr;
      });
      let sortable: Sortable | null = null;
      onMounted(() => {
        const navBox = document.getElementById("navBox");
        if (!navBox) {
          console.log("navBox创建失败-找不到element");
          return;
        }
        sortable = Sortable.create(navBox, {
          animation: 150,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          // ghostClass: "blue-background-class",
        });
        // console.log("sortable", sortable);
      });
      onUnmounted(() => {
        if (sortable) {
          sortable.destroy();
          sortable = null;
        }
      });
      return {
        activeNavUniqueId,
        navList,
        navFileTabCount,
        onClickNavTab,
        onCloseNavItem,
        getFileWindowTips,
        uploadingCount,
        uploadSuccessCount,
        keepAliveList,
      };
    }
    /** nkn client 连接状态 */
    function useNknStatus() {
      // 正否正在加载nkn 节点
      const isLoadingNknMulticlient = computed(() => {
        return userStore.isLoadingMultiClient;
      });
      const nknStatusCount = ref(0);
      watch(
        () => isLoadingNknMulticlient.value,
        (newVal) => {
          if (newVal === false) {
            userStore.getMultiClient().then((multiClient) => {
              if (multiClient) {
                nknStatusCount.value = multiClient.readyClientIDs().length;
              }
            });
          }
        },
        { immediate: true }
      );
      /** 重置nkn 节点 */
      // const onResetNknMultiClient = () => {
      //   Modal.confirm({
      //     content: "重置nkn节点?",
      //     onOk: () => {
      //       console.log("重置节点");
      //     },
      //   });
      // };
      return {
        isLoadingNknMulticlient,
        nknStatusCount,
        // onResetNknMultiClient
      };
    }
    return {
      ...useNavTabs(),
      ...useUserStatus(),
      ...useLayoutMenu(),
      ...useSvgLogo(),
      ...useUserDetailInfo(),
      ...useNknStatus(),
    };
  },
});
</script>

<style lang="less">
#global-layout-component .trigger {
  font-size: 18px;
  /* line-height: 54px; */
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#global-layout-component .trigger:hover {
  color: #1890ff;
}
/* #global-layout-component .localeSwitcher:hover {
  color: #1890ff;
} */
/* 
.site-layout .site-layout-background {
  background: #fff;
} */
.tabToolTip {
  .ant-tooltip-inner {
    border-radius: 8px;
    white-space: nowrap; // 不换行
    width: fit-content;
    background: white;
    color: inherit;
    font-size: 12px;
    display: flex;
    align-items: center;
    padding: 0 10px;
  }
  .ant-tooltip-arrow-content {
    background: white;
    // display: none;
  }
}
/* table 里的快捷键 */
.ant-table-row:hover .tableShortcut {
  display: inline-block;
  background-color: #e6f7ff;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ant-table-row-hover .tableShortcut {
  display: inline-block;
  background-color: #e6f7ff;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ant-table-row-selected:hover .tableShortcut {
  background-color: #dcf4ff;
}

/* 表格加了排序后,hover表头不变色 -start */
.ant-table-thead
  > tr
  > th.ant-table-column-has-actions.ant-table-column-has-sorters:hover {
  background: #f7f7f8;
}
.ant-table-thead
  > tr
  > th
  .ant-table-header-column
  .ant-table-column-sorters:hover::before {
  background: #f7f7f8;
}
.ant-table-tbody > tr > td.ant-table-column-sort {
  background: transparent;
}
/* 表格加了排序后,hover表头不变色 -end */
#uploadDrawer {
  .ant-drawer-close {
    // color: yellow;
    // 这个 48 根据实测, 关联headerStyle的padding变动
    width: 47px;
    height: 47px;
    line-height: 47px;
  }
}

.copyMoveModalRow > td {
  cursor: pointer;
  border: none !important;
  // border-bottom: 1px solid #eff2f9;
}

.copyMoveModalRowActive > td {
  background: #bae7ff;
}

.shortcutButton {
  cursor: pointer;
  font-size: 17px;
  color: #1890ff;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}
</style>

<style lang="less" scoped>
#siderLogoBox {
  transform: translateX(0);
  transition: transform 0.3s ease-out;
}
#siderLogoText {
  display: block;
}
.ant-layout-sider-collapsed {
  #siderLogoText {
    display: none;
  }
  #siderLogoBox {
    transform: translateX(0px);
  }
}

:deep(.ant-menu-sub > .ant-menu-item) {
  padding-left: 40px !important;
}
// 面包屑下箭头图标垂直居中
:deep(.ant-breadcrumb-overlay-link) {
  .anticon-down {
    vertical-align: middle;
  }
}
.activeNavItem {
  background-color: #f0f2f5;
}
.navItemCloseBox {
  &:hover {
    background: #ff7875;
    color: white;
    // #f2f2f2
  }
}
// 菜单旁边的小红点
.navItemDot {
  margin-left: 8px;
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #dc2626;
  color: white;
  border-radius: 999px;
  font-size: 12px;
  font-style: normal;
  transform: scale(0.78);
}
// .navItemClose {
// display: none;
// }
// .navTabBox {
//   &:hover .navItemClose {
//     // display: inline-block;
//   }
// }
// 左菜单收起来的时候
// .ant-menu-vertical {
//   [role="menuitem"] {
//     .anticon {
//       font-size: 22px !important;
//     }
//   }
// }
// nkn 状态
.nknStatus {
  transition: all 0.2s ease-out;
  &:hover {
    background: #f5f5f5;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  }
}
// 头像点击菜单栏
.avatarDropdown {
  .ant-dropdown-menu-vertical {
    border-radius: 12px;
  }
}
.setStatus {
  &:hover {
    .setStatusOptions {
      display: block !important;
    }
  }
}
.setStatusOptionsItem {
  border-radius: 4px;
  // padding: 6px 12px;
  &:hover {
    background: #f5f5f5;
  }
}
</style>