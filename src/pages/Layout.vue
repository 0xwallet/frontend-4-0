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
      <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
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
            <span>Dashboard</span>
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
                <FolderOutlined />
                <span>网盘</span>
              </span>
            </template>
            <!-- TODO 跟路由相关联 v-for -->
            <a-menu-item key="file">{{ $t("metanet.file") }}</a-menu-item>
            <a-menu-item key="share">{{
              $t("metanet.shareButton")
            }}</a-menu-item>
            <a-menu-item key="publish">{{ $t("metanet.publish") }}</a-menu-item>
            <a-menu-item key="collect">{{
              $t("metanet.collectionButton")
            }}</a-menu-item>
            <a-menu-item key="recycle">{{ $t("metanet.recycle") }}</a-menu-item>
            <!-- <a-menu-item key="account">{{ $t("common.account") }}</a-menu-item>
            <a-menu-item key="metanet">{{ $t("common.metanet") }}</a-menu-item>
            <a-menu-item key="security">{{
              $t("common.security")
            }}</a-menu-item> -->
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout prefixCls="ant-layout">
        <a-layout-header class="">
          <div class="bg-white flex items-center px-0 h-12">
            <menu-unfold-outlined
              v-if="collapsed"
              class="trigger"
              @click="() => (collapsed = !collapsed)"
            />
            <menu-fold-outlined
              v-else
              class="trigger"
              @click="() => (collapsed = !collapsed)"
            />
            <!-- 面包屑 sub/item -->
            <a-breadcrumb class="inline-block">
              <a-breadcrumb-item v-for="item in breadArr" :key="item">
                {{ item }}
              </a-breadcrumb-item>
            </a-breadcrumb>
            <!-- 撑开中间 -->
            <div class="flex-1"></div>
            <div class="flex items-center h-full w-12">
              <XLocaleSwither
                class="cursor-pointer text-base text-gray-600 localeSwitcher"
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
              :trigger="['click']"
              placement="bottomRight"
              overlayClassName="avatarDropdown"
            >
              <div
                class="
                  w-12
                  mr-4
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
                      transition: 'all .2s ease-in-out',
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
                  >
                    登出
                    <!-- <LogoutOutlined />{{ $t("common.dropdownItemLoginOut") }} -->
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <!-- tabbar -->
          <nav
            class="border-t border-gray-100 bg-white px-6 h-9 flex items-center"
          >
            <!-- 激活状态 hover 状态  关闭按钮(hover放大) -->
            <div
              v-for="item in navList"
              :key="item.routeName"
              @click="onClickNavTab(item)"
              class="
                relative
                border-solid border
                rounded-sm
                py-px
                pl-3
                pr-1
                cursor-pointer
                mr-2
              "
              :class="{
                navTabBox: item.routeName !== 'Dashboard',
                'border-transparent': activeNavKey === item.title,
                'bg-blue-600': activeNavKey === item.title,
                'text-white': activeNavKey === item.title,
                'border-gray-200': activeNavKey !== item.title,
              }"
              :style="{
                transition: '.3s',
                height: '25px',
                'line-height': '20px',
              }"
            >
              <i
                v-if="
                  item.routeName === 'MetanetTransport' && uploadingCount > 0
                "
                class="
                  absolute
                  flex
                  items-center
                  justify-center
                  w-5
                  h-5
                  bg-red-600
                  rounded-full
                  text-white
                "
                :style="{
                  right: '-2px',
                  top: '-10px',
                  'font-size': '12px',
                  'font-style': 'normal',
                  transform: 'scale(.8)',
                }"
                >{{ uploadingCount }}</i
              >
              <span class="text-xs">
                {{ $t(`${item.title}`) }}
              </span>
              <!-- 当只有一个的时候不能关闭 -->
              <!-- 预留个15.15的box -->
              <span class="inline-block w-3.5 h-3.5">
                <!-- && activeNavKey === item -->
                <CloseOutlined
                  v-if="navList.length > 1"
                  @click.stop="onCloseNavItem(item.title)"
                  class="
                    navItemClose
                    text-xs
                    transform
                    scale-75
                    hover:scale-100
                  "
                />
              </span>
            </div>
          </nav>
        </a-layout-header>
        <a-layout-content
          class="bg-white mx-4 my-4"
          :style="{
            minHeight: '280px',
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
  reactive,
  Ref,
  ref,
  watch,
} from "vue";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FolderOutlined,
  UserOutlined,
  LogoutOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  PieChartOutlined,
  RightOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";
import { pick, remove } from "lodash-es";
import { useRoute, useRouter } from "vue-router";
import { PRODUCT_NAME } from "@/constants";
import { useSvgWhiteLogo } from "@/hooks";
import { XLocaleSwither } from "@/components";
import { useTransportStore, useUserStore } from "@/store";
import { Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";

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
type TNavItem = { routeName: string; title: string };
type UserStatus = "online" | "leave" | "busy" | "offline";
export default defineComponent({
  components: {
    // icon
    FolderOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    CloseOutlined,
    PieChartOutlined,
    RightOutlined,
    CheckOutlined,
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
      // 默认打开网盘
      const openKeys = ref(["metanet"]);
      const selectedKeys = ref([""]);
      /** 面包屑 */
      const breadArr = ref<string[]>([]);
      // 观察路由path 改变菜单
      watch(
        () => route,
        (newRoute) => {
          const pathStr = newRoute.path;
          // console.log("routeNewVal", pathStr, openKeys.value);
          // console.log("pathStr", pathStr);
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
          activeNavKey.value = newRouteTitle;
          if (!navList.some((v) => v.title === newRouteTitle)) {
            const item: TNavItem = {
              routeName: newRoute.name as string,
              title: newRouteTitle,
            };
            // 保证dashboard 是第一个
            isDashBoard ? navList.unshift(item) : navList.push(item);
          }
        },
        {
          immediate: true,
          deep: true,
        }
      );
      const collapsed = ref(false);
      const onMenuSelect = ({ item, key, keyPath }: TMenuSelect) => {
        // key: "account"
        // keyPath: (2) ["account", "general"]
        // console.log("选中的菜单key", key, keyPath);
        // console.log("route", route);
        const toRoute = "/" + keyPath.reverse().join("/");
        if (toRoute !== route.path) {
          // console.log("router.push", item);
          // /general/account
          // router.push 会自动判断与当前页面是否重复
          router.push(toRoute);
        }
      };
      return { breadArr, openKeys, selectedKeys, collapsed, onMenuSelect };
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
            onOk: userStore.signOutAndClear,
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
      console.log("detailInfo", detailInfo);
      return {
        detailInfo,
        onAvatarDropdownMenuClick,
      };
    }
    const activeNavKey = ref("");
    // 默认显示dashboard
    const navList: TNavItem[] = reactive([
      {
        routeName: "Dashboard",
        title: "common.dashboard",
      },
      // {
      //   // TODO 删除这个
      //   routeName: "MetanetTransport",
      //   title: "metanet.transport",
      // },
    ]);
    /** nav tab栏 */
    function useNavTabs() {
      // console.log("route", route);
      // activeNavKey = ref(route.meta.title as string);
      // navList = reactive([route.meta.title as string]);
      const onClickNavTab = (item: TNavItem) => {
        // router.push()
        // console.log("onClickNavTab", item);
        // 如果不是当前的路由的tab , 就跳转
        if (item.title !== route.meta.title) {
          router.push({ name: item.routeName });
        }
      };
      const onCloseNavItem = (itemTitle: string) => {
        // console.log("onCloseNavItem", itemTitle, activeNavKey.value);
        // 1 如果关闭的是当前,路由到上一个且数组移除
        // 2 如果关闭的是其他,直接数组移除
        if (itemTitle === activeNavKey.value) {
          // router.push;
          if (navList.length > 1) {
            const foundIndex = navList.findIndex((v) => v.title === itemTitle);
            remove(navList, (v) => v.title === itemTitle);
            const toPushRouteName =
              foundIndex > 0
                ? // 代表有前一项,push 到前一项
                  navList[foundIndex - 1].routeName
                : // 没有前一项,push用下一项(也就是删除后的foundIndex的位置)
                  navList[foundIndex].routeName;
            router.push({ name: toPushRouteName });
          }
        } else {
          remove(navList, (v) => v.title === itemTitle);
        }
      };
      const uploadingCount = computed(() => {
        // return 10;
        return transPortStore.uploadingList.length;
      });
      /** 需要keep-alive 的组件 ,组件的name === 路由里注册的name,根据navTab 动态改变 */
      // const keepAliveList = [
      //   "MetanetFile",
      //   "MetanetShare",
      //   "MetanetPublish",
      //   "MetanetCollect",
      //   "MetanetRecycle",
      // ];
      const keepAliveList = computed(() =>
        navList.map((i) => i.routeName).filter((i) => i !== "Dashboard")
      );
      return {
        activeNavKey,
        navList,
        onClickNavTab,
        onCloseNavItem,
        uploadingCount,
        keepAliveList,
      };
    }
    return {
      ...useNavTabs(),
      ...useUserStatus(),
      ...useLayoutMenu(),
      ...useSvgLogo(),
      ...useUserDetailInfo(),
    };
  },
});
</script>

<style>
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
/* table 里的快捷键 */
.ant-table-row:hover .tableShortcut {
  display: inline-block;
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

// 面包屑下箭头图标垂直居中
:deep(.ant-breadcrumb-overlay-link) {
  .anticon-down {
    vertical-align: middle;
  }
}
.navItemClose {
  display: none;
}
.navTabBox {
  &:hover .navItemClose {
    display: inline-block;
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