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
        <div class="font-semibold font-16">个人信息</div>
        <a-button @click="onEditUserInfo">
          <FormOutlined />
          编辑个人资料
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
      <div class="py-6 flex items-start justify-between px-6">
        <div class="flex items-center">
          <!-- 头像 -->
          <div v-if="userStore.avatar"></div>
          <div
            v-else
            class="
              w-14
              h-14
              relative
              rounded-full
              flex
              items-center
              justify-center
              text-xl text-white
            "
            :style="{
              background: 'linear-gradient(45deg, #00acc1, #00d5e2)',
            }"
          >
            {{ userStore.username[0].toUpperCase() }}
          </div>
          <!-- 姓名与签名 -->
          <div class="ml-3">
            <div class="font-semibold font-16 mb-2">
              {{ userStore.username }}
            </div>
            <div class="font-12 text-gray-400">签名签名签名</div>
          </div>
        </div>
        <div v-if="bsvUsdExchangeRate" class="font-semibold">
          1 BSV = {{ bsvUsdExchangeRate }} USD
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
            class="flex items-center h-14 px-6"
            :style="{
              'border-bottom': '1px solid #eff2f9',
            }"
          >
            <div class="font-semibold font-16 mr-4">nkn公钥</div>
            <div class="font-14">
              <a href="https://nkn.org" target="_blank">
                <InfoCircleOutlined />
                How <span class="font-semibold">NKN</span> Works
              </a>
            </div>
          </div>
          <div class="p-6 flex items-center justify-between">
            <div
              class="truncate inline-block text-gray-400"
              :style="{
                width: 'calc(100% - 75px)',
              }"
            >
              <a-tooltip
                :title="userStore.multiClient ? userStore.multiClient.addr : ''"
              >
                <a href="javascript:;">
                  {{ userStore.multiClient ? userStore.multiClient.addr : "" }}
                </a>
              </a-tooltip>
            </div>
            <div class="flex items-center">
              <a-tooltip title="临时地址">
                <WarningFilled
                  class="mr-2"
                  :style="{
                    'font-size': '16px',
                    color: '#faad14',
                  }"
                />
              </a-tooltip>
              <a
                href="javascript:'"
                class="font-16 mr-2 ant-color-blue-6"
                @click="onCopyNknAddress"
              >
                <CopyOutlined />
              </a>
              <a
                href="javascript:'"
                class="font-16 ant-color-blue-6"
                @click="onShowNknAddressQrcode"
              >
                <QrcodeOutlined />
              </a>
            </div>
          </div>
        </section>
        <section class="bg-white rounded-md">
          <div
            class="flex items-center h-14 px-6"
            :style="{
              'border-bottom': '1px solid #eff2f9',
            }"
          >
            <div class="font-semibold font-16 mr-4">0xID</div>
            <div class="font-14">
              <a href="https://id.owaf.org" target="_blank">
                <InfoCircleOutlined />
                How <span class="font-semibold">0xWallet</span> Works
              </a>
            </div>
          </div>
          <div class="p-6 pb-4 flex items-center justify-between">
            <div
              class="truncate inline-block text-gray-400"
              :style="{
                width: 'calc(100% - 50px)',
              }"
            >
              <a-tooltip title="0xID">
                <a href="javascript:;"> TODO-0xID..... </a>
              </a-tooltip>
            </div>
            <div class="flex items-center">
              <a
                href="javascript:'"
                class="font-16 mr-2 ant-color-blue-6"
                @click="onCopy0xIDAddress"
              >
                <CopyOutlined />
              </a>
              <a
                href="javascript:'"
                class="font-16 ant-color-blue-6"
                @click="onShow0xIDAddressQrcode"
              >
                <QrcodeOutlined />
              </a>
            </div>
          </div>
          <div
            :style="{
              height: '1px',
              background: '#eff2f9',
              margin: '0 24px',
            }"
          ></div>
          <div class="p-6 pt-4 flex items-center justify-between">
            <div>
              <div class="text-gray-400">账户资产折合(BSV)</div>
              <div>$202.27 USD</div>
              <div>1.085227 BSV</div>
            </div>
            <div class="flex items-center">
              <a-button class="mr-2" type="primary" @click="onRecharge"
                >充值</a-button
              >
              <a-button @click="onWithDraw">提现</a-button>
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
          <div class="font-semibold font-16">钱包</div>
          <a-button @click="onAddAsset">
            <PlusOutlined class="align-middle" />
            添加
          </a-button>
        </div>
        <div class="p-6 flex items-center justify-between">
          <div
            class="rounded p-4"
            :style="{
              width: 'calc((100% - 48px)/3)',
              'box-shadow': '0px 2px 8px rgba(0, 0, 0, 0.15)',
            }"
            v-for="asset in assetList"
            :key="asset.id"
          >
            <div class="mb-4">{{ asset.name }}</div>
            <div>{{ asset.card }}</div>
          </div>
        </div>
      </section>
    </div>
    <!-- 二维码弹窗 -->
    <a-modal
      destroyOnClose
      centered
      v-model:visible="modalQrCodeVisible"
      :footer="null"
      :width="240"
    >
      <XQrCode :url="modalQrCodeAddr" :width="180" />
    </a-modal>
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
import { XStatusDot, XQrCode } from "../../components";
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
  },
  setup() {
    const { t } = useI18n();
    const userStore = useUserStore();
    /** 编辑个人资料 */
    const onEditUserInfo = () => {
      console.log("onEditUserInfo");
      message.info("TODO");
    };
    const bsvUsdExchangeRate = ref("");
    apiGetBsvExchangeRate().then(
      (res) => (bsvUsdExchangeRate.value = res.data?.rate.substring(0, 7) ?? "")
    );
    const assetList = reactive([
      {
        id: 0,
        name: "姓名姓名0",
        card: "6222 **** **** 1245",
      },
      {
        id: 1,
        name: "姓名姓名1",
        card: "6222 **** **** 1245",
      },
      {
        id: 2,
        name: "姓名姓名2",
        card: "6222 **** **** 1245",
      },
    ]);
    const userVerifyForm = reactive({
      email: {
        label: "Email",
        val: userStore.email,
        isVerified: true,
      },
      country: {
        label: "国家",
        val: "",
        isVerified: false,
      },
      passport: {
        label: "Passport",
        val: "",
        isVerified: false,
      },
    });
    /** 复制nkn地址 */
    const onCopyNknAddress = () => {
      // message.info("TODO");
      const text = userStore.multiClient?.addr ?? "";
      useClipboard()
        .copy(text)
        .then(() => message.success(t("metanet.copySuccess")));
    };
    /** 显示nkn地址二维码 */
    const onShowNknAddressQrcode = () => {
      modalQrCodeAddr.value = userStore.multiClient?.addr ?? "";
      modalQrCodeVisible.value = true;
    };
    /** 复制 0xID 地址 */
    const onCopy0xIDAddress = () => {
      message.info("TODO");
    };
    /** 显示 0xID地址二维码 */
    const onShow0xIDAddressQrcode = () => {
      message.info("TODO");
    };
    /** 充值 */
    const onRecharge = () => {
      message.info("TODO");
    };
    /** 提现 */
    const onWithDraw = () => {
      message.info("TODO");
    };
    /** 添加资产 */
    const onAddAsset = () => {
      message.info("TODO");
    };
    const modalQrCodeAddr = ref("");
    const modalQrCodeVisible = ref(false);
    /** 二维码弹窗控制 */
    function useModalQrCode() {
      return {
        modalQrCodeVisible,
        modalQrCodeAddr,
      };
    }
    return {
      userStore,
      onEditUserInfo,
      bsvUsdExchangeRate,
      assetList,
      userVerifyForm,
      onCopyNknAddress,
      onShowNknAddressQrcode,
      onCopy0xIDAddress,
      onShow0xIDAddressQrcode,
      onRecharge,
      onWithDraw,
      onAddAsset,
      ...useModalQrCode(),
    };
  },
});
</script>

<style scoped></style>
