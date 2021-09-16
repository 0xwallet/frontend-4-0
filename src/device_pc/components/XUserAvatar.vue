<template>
  <a-dropdown
    :trigger="['hover']"
    placement="bottomRight"
    overlayClassName="avatarDropdown"
  >
    <div class="flex items-center justify-center cursor-pointer">
      <!-- hover:bg-gray-100 -->
      <!-- <a-avatar :size="24" class="leading-8">
                  <template #icon><UserOutlined /></template>
                </a-avatar> -->
      <div
        class="
          w-full
          h-full
          relative
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
                  background: userStatusColorMap[currentUserStatus].color,
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
          class="relative setStatus pl-4 mt-2 flex items-center justify-between"
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
            class="setStatusOptions absolute bg-white px-4 py-4 cursor-default"
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
          class="pl-4 mt-2 flex items-center mb-1 opacity-70 overflow-hidden"
          @click="onAvatarDropdownMenuClick('Logout')"
        >
          登出
          <!-- <LogoutOutlined />{{ $t("common.dropdownItemLoginOut") }} -->
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts">
import { useUserStore } from "@/store";
import { Modal } from "ant-design-vue";
import { computed, createVNode, defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import {
  ExclamationCircleOutlined,
  RightOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";

type UserStatus = "online" | "leave" | "busy" | "offline";

export default defineComponent({
  components: {
    RightOutlined,
    CheckOutlined,
  },
  setup() {
    const [route, router] = [useRoute(), useRouter()];
    const { t } = useI18n();
    const userStore = useUserStore();
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
    return {
      ...useUserStatus(),
      ...useUserDetailInfo(),
    };
  },
});
</script>

<style lang="less" scoped>
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