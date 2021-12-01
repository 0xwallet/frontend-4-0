<template>
  <div class="w-full h-full">
    <header
      class="px-4 overflow-hidden"
      :style="{
        background: '#404A66',
      }"
    >
      <div class="h-11 relative">
        <div @click="onClickLogo" class="absolute-center-y top-0 bottom-0">
          <MSvgIcon icon="logoWhiteBorder" :size="22.1" />
        </div>
        <div
          class="text-white text-center h-full flex items-center justify-center"
        >
          账户
        </div>
      </div>
      <div
        class="pt-6 pb-10 flex items-center justify-between text-white relative"
      >
        <!-- pb-8 -->
        <!-- name/sign/bsv exchange -->
        <div>
          <div class="font-16 mb-0.5">
            {{ userStore.username }}
          </div>
          <div class="font-12 opacity-75 mb-1.5">签名签名签名</div>
          <div
            class="font-12 px-3 py-0.5"
            :style="{
              background: 'rgba(54, 118, 194, 0.25)',
              'border-radius': '5px',
            }"
          >
            <span class="opacity-90">
              1 BSV = {{ bsvUsdExchangeRate }} USD
            </span>
          </div>
        </div>
        <div
          :style="{
            width: '100px',
            height: '1px',
          }"
        ></div>
        <!-- avatar -->
        <div class="absolute right-0 flex items-center z-10">
          <div v-if="userStore.avatar"></div>
          <div
            v-else
            class="
              relative
              rounded-full
              flex
              items-center
              justify-center
              text-3xl text-white
            "
            :style="{
              width: '70px',
              height: '70px',
              background: 'linear-gradient(45deg, #00acc1, #00d5e2)',
              border: '1px solid #FEFEFE',
            }"
          >
            {{ userStore.username[0].toUpperCase() }}
          </div>
          <div class="ml-2 opacity-90">
            <van-icon name="arrow" size="18" />
          </div>
        </div>
        <!-- 渐变色背景圆 -->
        <div
          class="absolute rounded-full"
          :style="{
            width: '254px',
            height: '254px',
            background:
              'linear-gradient(180deg, #4A5573 0%, rgba(74, 85, 115, 0) 100%)',
            transform: 'rotate(85.19deg)',
            right: '-110px',
            top: '-30px',
          }"
        ></div>
        <!-- background:#f0f2f5 -->
        <div
          class="absolute left-0 right-0 bottom-0 h-4 bg-gray-100"
          :style="{
            margin: '0 -16px',
            'border-radius': '15px 15px 0 0',
          }"
        ></div>
      </div>
    </header>
    <main class="px-4">
      <section class="bg-white radius-10px mb-4">
        <div
          class="flex items-center h-14 px-4"
          :style="{
            'border-bottom': '1px solid #eff2f9',
          }"
        >
          <div class="font-semibold font-16 mr-4">nkn公钥</div>
          <a class="font-12" href="https://nkn.org" target="_blank">
            <van-icon name="info-o" size="14" />
            How <span class="font-semibold">NKN</span> Works
          </a>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div
            class="truncate inline-block text-gray-400"
            :style="{
              width: 'calc(100% - 75px)',
            }"
          >
            <a href="javascript:;">
              {{ userStore.multiClient ? userStore.multiClient.addr : "" }}
            </a>
          </div>
          <div class="flex items-center">
            <MSvgIcon
              class="mr-2"
              icon="warnTriangle"
              :size="16"
              :style="{
                color: '#faad14',
              }"
            />
            <a
              href="javascript:;"
              class="font-16 mr-2 ant-color-blue-6"
              @click="onCopyNknAddress"
            >
              <MSvgIcon class="ant-blue" icon="copy" :size="16" />
            </a>
            <a
              href="javascript:;"
              class="font-16 ant-color-blue-6"
              @click="onShowNknAddressQrcode"
            >
              <MSvgIcon class="ant-blue" icon="qr" :size="16" />
            </a>
          </div>
        </div>
      </section>
      <section class="bg-white radius-10px mb-4">
        <div
          class="flex items-center h-14 px-4"
          :style="{
            'border-bottom': '1px solid #eff2f9',
          }"
        >
          <div class="font-semibold font-16 mr-4">0xID</div>
          <a class="font-12" href="https://id.owaf.org" target="_blank">
            <van-icon name="info-o" size="14" />
            How <span class="font-semibold">0XWallet</span> Works
          </a>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div
            class="truncate inline-block text-gray-400"
            :style="{
              width: 'calc(100% - 50px)',
            }"
          >
            <a href="javascript:;">
              {{ userStore.wallet ? userStore.wallet.address : "" }}
            </a>
          </div>
          <div class="flex items-center">
            <a
              href="javascript:;"
              class="font-16 mr-2 ant-color-blue-6"
              @click="onCopy0xIDAddress"
            >
              <MSvgIcon class="ant-blue" icon="copy" :size="16" />
            </a>
            <a
              href="javascript:;"
              class="font-16 ant-color-blue-6"
              @click="onShow0xIDAddressQrcode"
            >
              <MSvgIcon class="ant-blue" icon="qr" :size="16" />
            </a>
          </div>
        </div>
        <div
          :style="{
            height: '1px',
            background: '#eff2f9',
            margin: '0 16px',
          }"
        ></div>
        <div class="p-4 flex items-center justify-between">
          <div>
            <div class="text-gray-400">账户资产折合(BSV)</div>
            <div>$202.27 USD</div>
            <div>1.085227 BSV</div>
          </div>
          <div class="flex items-center">
            <van-button
              type="primary"
              @click="onRecharge"
              :style="{
                width: '60px',
                height: '32px',
                'border-radius': '4px',
                'margin-right': '8px',
              }"
              >充值</van-button
            >
            <van-button
              @click="onWithDraw"
              :style="{
                width: '60px',
                height: '32px',
                'border-radius': '4px',
              }"
              >提现</van-button
            >
          </div>
        </div>
      </section>
      <!-- 资产 -->
      <section class="bg-white radius-10px">
        <div
          class="flex items-center justify-between h-14 px-4"
          :style="{
            'border-bottom': '1px solid #eff2f9',
          }"
        >
          <div class="font-semibold font-16">钱包</div>
          <van-button
            class="font-14"
            :style="{
              width: '88px',
              height: '32px',
              'border-radius': '4px',
            }"
            @click="onAddAsset"
          >
            <van-icon name="plus" />
            添加</van-button
          >
        </div>
        <div class="p-4">
          <div
            class="radius-10px p-4"
            :style="{
              'box-shadow': '0px 2px 8px rgba(0, 0, 0, 0.15)',
            }"
          >
            <div class="mb-4">姓名姓名</div>
            <div>6222 **** **** 1245</div>
          </div>
        </div>
      </section>
    </main>
    <!-- 二维码弹窗 -->
    <van-popup v-model:show="popupQrCodeVisible" round>
      <MQrCode :url="popupQrCodeAddr" :width="180" />
    </van-popup>
  </div>
</template>

<script lang="ts">
import { apiGetBsvExchangeRate } from "@/apollo/api";
import { useBaseStore, useUserStore } from "@/store";
import { useClipboard } from "@vueuse/core";
import { Toast } from "vant";
import { defineComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { MSvgIcon, MQrCode } from "../../components";

export default defineComponent({
  components: {
    MSvgIcon,
    MQrCode,
    //
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const userStore = useUserStore();
    const baseStore = useBaseStore();
    const bsvUsdExchangeRate = ref("");
    apiGetBsvExchangeRate().then(
      (res) => (bsvUsdExchangeRate.value = res.data?.rate.substring(0, 7) ?? "")
    );
    // TODO delete
    // setTimeout(() => {
    //   baseStore.changeMobileLeftPopupVisible(true);
    // }, 2000);
    const onClickLogo = () => {
      Toast("TODO-clickLogo");
      baseStore.changeMobileLeftPopupVisible(true);
    };
    const onCopyNknAddress = () => {
      const text = userStore.multiClient?.addr ?? "";
      useClipboard()
        .copy(text)
        .then(() => Toast(t("metanet.copySuccess")));
    };
    const onShowNknAddressQrcode = () => {
      popupQrCodeAddr.value = userStore.multiClient?.addr ?? "";
      popupQrCodeVisible.value = true;
    };
    const onCopy0xIDAddress = () => {
      Toast("TODO-onCopy0xIDAddress");
    };
    const onShow0xIDAddressQrcode = () => {
      Toast("TODO-onShow0xIDAddressQrcode");
    };
    const onRecharge = () => {
      Toast("TODO-onRecharge");
    };
    const onWithDraw = () => {
      Toast("TODO-onWithDraw");
    };
    const onAddAsset = () => {
      Toast("TODO-onAddAsset");
    };
    const popupQrCodeVisible = ref(false);
    const popupQrCodeAddr = ref("");
    /** 二维码弹窗 */
    function usePopupQrCode() {
      return {
        popupQrCodeVisible,
        popupQrCodeAddr,
      };
    }
    return {
      onClickLogo,
      userStore,
      bsvUsdExchangeRate,
      onCopyNknAddress,
      onShowNknAddressQrcode,
      onCopy0xIDAddress,
      onShow0xIDAddressQrcode,
      onRecharge,
      onWithDraw,
      onAddAsset,
      ...usePopupQrCode(),
    };
  },
});
</script>

<style lang="less" scoped>
.radius-10px {
  border-radius: 10px;
}
</style>