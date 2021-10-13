<template>
  <div
    class="h-full"
    :style="{
      padding: '0',
      background: '#f0f2f5',
      'border-radius': '0',
    }"
  >
    <section class="bg-white rounded-md">
      <div class="relative h-14 flex items-center justify-between px-6">
        <div class="font-semibold font-16">个人信息</div>
        <a-button class="rounded" @click="onEditUserInfo">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { FormOutlined } from "@ant-design/icons-vue";
import { useUserStore } from "@/store";
import { message } from "ant-design-vue";
import { apiGetBsvExchangeRate } from "@/apollo/api";
import { XStatusDot } from "../../components";

export default defineComponent({
  components: {
    FormOutlined,
    //
    XStatusDot,
  },
  setup() {
    const userStore = useUserStore();
    /** 编辑个人资料 */
    const onEditUserInfo = () => {
      console.log("onEditUserInfo");
      message.info("TODO");
    };
    const bsvUsdExchangeRate = ref("");
    apiGetBsvExchangeRate().then(
      (res) => (bsvUsdExchangeRate.value = res.data?.rate ?? "")
    );
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
    return { userStore, onEditUserInfo, bsvUsdExchangeRate, userVerifyForm };
  },
});
</script>

<style scoped></style>
