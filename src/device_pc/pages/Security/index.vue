<template>
  <div
    class="h-full"
    :style="{
      padding: '0',
      background: '#f0f2f5',
      'border-radius': '0',
    }"
  >
    <section class="bg-white rounded-md mb-6">
      <div class="relative h-14 flex items-center justify-between px-6">
        <div class="font-semibold font-16">应用</div>
        <a-button @click="onEditUserInfo">
          <PlusOutlined />
          添加应用
        </a-button>
      </div>
      <!-- 下边框线 -->
      <div
        :style="{
          height: '1px',
          background: '#eff2f9',
          margin: '0 -16px',
        }"
      ></div>
      <!-- 头像,签名与bsv比价信息 -->
      <div class="p-6 flex items-start justify-between">
        <div
          class="rounded p-4"
          :style="{
            width: '240px',
            height: '120px',
            'box-shadow': '0px 2px 8px rgba(0, 0, 0, 0.15)',
          }"
        >
          <div class="font-semibold font-14 italic">default app</div>
        </div>
      </div>
      <div
        :style="{
          height: '1px',
          background: '#eff2f9',
        }"
      ></div>
      <div class="px-6 py-6 flex items-center">
        <div
          v-for="(obj, key) in userVerifyForm"
          :key="key"
          class="flex-1 pl-5 relative"
        >
          <XStatusDot
            :type="obj.isVerified ? 'success' : 'default'"
            class="absolute"
            :style="{
              top: '8px',
              left: '6px',
            }"
          />
          <div class="mb-0.5">
            <span class="mr-2">{{ obj.label }}</span>
            <span v-if="key === 'email'">{{ obj.val }}</span>
          </div>
          <div>
            <span v-if="obj.isVerified">已验证</span>
            <span v-else class="text-gray-400">未验证</span>
          </div>
          <div></div>
        </div>
      </div>
    </section>
    <div class="flex">
      <div
        :style="{
          width: 'calc((100% - 16px)/3)',
          'margin-right': '16px',
        }"
      >
        <section class="bg-white rounded-md mb-4">
          <div
            class="flex items-center justify-between h-14 px-6"
            :style="{
              'border-bottom': '1px solid #eff2f9',
            }"
          >
            <div class="font-semibold font-16 mr-4">安全设备</div>
            <a-button @click="onAddSecurityDevice">
              <PlusOutlined />
              添加设备
            </a-button>
          </div>
          <div class="p-6 flex items-center justify-between">
            <div class="flex-center-y">
              <img
                class="w-10 h-10 mb-1"
                src="~@/assets/svg/nkn_circle.svg"
                alt=""
              />
              <div class="text-gray-400 font-12">未绑定</div>
            </div>
          </div>
        </section>
        <section class="bg-white rounded-md">
          <div
            class="flex items-center justify-between h-14 px-6"
            :style="{
              'border-bottom': '1px solid #eff2f9',
            }"
          >
            <div class="font-semibold font-16 mr-4">恢复信息</div>
            <div class="flex items-center">
              <a-button class="mr-2">
                <PlusOutlined />
                添加信息
              </a-button>
              <a-button>
                <FormOutlined />
                修改密码
              </a-button>
            </div>
          </div>
          <!-- <span class="ant-color-danger"> 删除 </span> -->
          <div class="p-6 flex items-center">
            <div class="flex-center-y mr-6">
              <XSvgIcon icon="at" :size="40" class="ant-color-blue-6" />
              <div class="font-12 text-gray-400">未激活</div>
            </div>
            <div class="flex-center-y">
              <XSvgIcon icon="sms" :size="40" class="ant-color-blue-6" />
              <div class="font-12 text-gray-400">未激活</div>
            </div>
          </div>
        </section>
      </div>
      <section
        class="bg-white rounded-md"
        :style="{
          width: 'calc(((100% - 16px)/3)*2)',
        }"
      >
        <div
          class="h-14 px-6 flex items-center justify-between"
          :style="{
            'border-bottom': '1px solid #eff2f9',
          }"
        >
          <div class="font-semibold font-16">权限</div>
          <a-button @click="onAddAsset">
            <FormOutlined class="align-middle" />
            编辑
          </a-button>
        </div>
        <div class="p-6 flex items-center justify-between">
          <div class="text-gray-400">webDav...TODO</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  FormOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  QrcodeOutlined,
  PlusOutlined,
  WarningFilled,
} from "@ant-design/icons-vue";
import { useUserStore } from "@/store";
import { message } from "ant-design-vue";
import { apiGetBsvExchangeRate } from "@/apollo/api";
import { XStatusDot, XQrCode, XSvgIcon } from "../../components";
import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    FormOutlined,
    InfoCircleOutlined,
    CopyOutlined,
    QrcodeOutlined,
    PlusOutlined,
    WarningFilled,
    //
    XStatusDot,
    XQrCode,
    XSvgIcon,
  },
  setup() {
    const { t } = useI18n();
    const userStore = useUserStore();
    //
    /** 添加设备 */
    const onAddSecurityDevice = () => {
      message.info("TODO");
    };
    return {
      userStore,
      onAddSecurityDevice,
    };
  },
});
</script>

<style scoped></style>
