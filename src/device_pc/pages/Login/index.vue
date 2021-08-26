<template>
  <a-row flex class="h-full">
    <!-- :style="{
        width: '400px',
      }" -->
    <a-col :lg="7" :md="10" class="px-10 pt-12 relative">
      <div>
        <div class="mb-10">
          <div
            class="
              inline-block
              rounded-full
              w-20
              h-20
              flex
              items-center
              justify-center
            "
            :style="{
              'box-shadow': '0 2px 6px #e6ecf1',
            }"
          >
            <div
              v-html="svgStr"
              :style="{
                transform: 'scale(3)',
              }"
            ></div>
          </div>
        </div>
        <div
          :style="{
            'font-size': '24px',
          }"
          class="mb-2"
        >
          为 <span class="font-bold">Web 3.0</span> 而生的
          <span class="font-bold">比特币钱包</span>
          解决方案
        </div>
        <div
          class="text-gray-400 mb-6"
          :style="{
            'line-height': '2',
          }"
        >
          0xWallet 钱包使您安全地发行和使用各类通证及数字资产🏦 💳
          并且在任意设备上与朋友, 同事及客户智慧协作🎉💰
        </div>
        <div class="mb-2 font-12 font-bold">邮箱</div>
        <div class="mb-3">
          <a-input
            @keyup.enter="onSubmit"
            v-model:value="form.email"
            class="mb-4 rounded"
            size="large"
          ></a-input>
        </div>
        <div class="mb-2 font-12 font-bold">密码</div>
        <div class="mb-3">
          <a-input-password
            @keyup.enter="onSubmit"
            v-model:value="form.password"
            class="mb-4 rounded"
            size="large"
          ></a-input-password>
        </div>
        <a-checkbox v-model:checked="isRememberMe" class="mb-8"
          >记住我</a-checkbox
        >
        <div class="flex mb-6 items-center justify-between">
          <router-link to="/resetpassword" class="ant-color-blue-6"
            >忘记密码?</router-link
          >
          <a-button
            type="primary"
            size="large"
            class="font-12 font-bold px-6"
            :style="{
              'border-radius': '4px',
              'box-shadow': '0 2px 6px #1890FF',
            }"
            :loading="isLoadingSubmit"
            @click="onSubmit"
            >登录</a-button
          >
        </div>
        <div
          class="mb-6 flex items-center justify-center text-gray-400"
          :style="{
            'font-size': '28px',
          }"
        >
          <a href="javascript:;" class="mr-6">
            <a-tooltip title="WebAuthn">
              <QrcodeOutlined />
            </a-tooltip>
          </a>
          <a href="javascript:;" class="mr-6">
            <a-tooltip title="nMobile">
              <DeploymentUnitOutlined />
            </a-tooltip>
          </a>
          <a href="javascript:;">
            <a-tooltip title="other">
              <PoundCircleOutlined />
            </a-tooltip>
          </a>
        </div>
        <div class="text-center text-gray-500 mb-16">
          还没有账号?
          <router-link to="/register" class="ant-color-blue-6"
            >马上注册</router-link
          >
          <span
            class="pb-1 relative"
            :style="{
              bottom: '2px',
            }"
            >👉</span
          >
        </div>
      </div>
      <div
        class="absolute"
        :style="{
          bottom: '32px',
          left: '0px',
          right: '0px',
        }"
      >
        <div class="mb-2 text-center font-12 text-gray-400">
          Copyright © 2021 比特网盘
        </div>
        <div class="text-center font-12 text-gray-400">
          Powered by
          <a
            href="https://www.owaf.org"
            target="_blank"
            class="ant-color-blue-6"
            >OWAF</a
          >
        </div>
      </div>
    </a-col>
    <a-col
      :lg="17"
      :md="14"
      class="imgContainer relative background-walk-y font-semibold text-white"
    >
      <div
        class="absolute font-20"
        :style="{
          right: '40px',
          top: '20px',
        }"
      >
        # Message
      </div>
      <div
        class="absolute"
        :style="{
          left: '40px',
          bottom: '32px',
        }"
      >
        <div
          class="mb-6"
          :style="{
            'font-size': '30px',
            'padding-right': '40px',
          }"
          :title="quotes.author"
        >
          {{ quotes.content }}
          <!-- <span class="font-normal font-12">- {{ quotes.author }}</span> -->
        </div>
        <div class="font-normal">
          Photo from&nbsp;
          <a href="javascript:;"> AkaRandom</a>
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script lang="ts">
import { useSvgWhiteLogo } from "@/utils";
import { defineComponent, reactive, ref, toRaw } from "vue";
import {
  QrcodeOutlined,
  PoundCircleOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons-vue";
import { message, notification } from "ant-design-vue";
import { apiEmailLogin } from "@/apollo/api";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    QrcodeOutlined,
    PoundCircleOutlined,
    DeploymentUnitOutlined,
  },
  setup() {
    const { t } = useI18n();
    const userStore = useUserStore();
    const router = useRouter();
    /** logo和名称tips */
    function useLogoSvgAndName() {
      return {
        svgStr: useSvgWhiteLogo(),
      };
    }
    /** 名言api */
    function useQuotes() {
      const quotes = reactive({ content: "", author: "" });
      // https://api.quotable.io/random
      fetch("https://api.quotable.io/random")
        .then((res) => res.json())
        .then((data) => {
          quotes.content = data.content;
          quotes.author = data.author;
        });
      // console.log(`${data.content} —${data.author}`)
      return { quotes };
    }
    /** 登录form */
    function useLoginForm() {
      const form = reactive({
        email: "",
        password: "",
      });
      const isRememberMe = ref(false);
      const isLoadingSubmit = ref(false);
      const onSubmit = async () => {
        const { email, password } = toRaw(form);
        if (!email.length || !password.length) {
          message.warning("请输入邮箱和密码");
          return;
        }
        isLoadingSubmit.value = true;
        const resultEmailLogin = await apiEmailLogin({ email, password });
        isLoadingSubmit.value = false;
        if (resultEmailLogin.err) {
          // Modal.error(err); // initApollo onError 会报错
          return;
        }
        console.log("apiEmailLogin", resultEmailLogin.data);
        const { token } = resultEmailLogin.data.signin;
        const { id, username } = resultEmailLogin.data.signin.user;
        notification.success({
          message: t("pageLogin.loginSuccessTitle"),
          description: `${t("pageLogin.loginSuccessDesc")}: ${username}`,
        });
        const resultSignInFullPath = await userStore.signInFullPath({
          id,
          token,
          username,
          email,
        });
        if (resultSignInFullPath.err) return;
        router.replace("/");
      };
      return {
        form,
        isRememberMe,
        isLoadingSubmit,
        onSubmit,
      };
    }
    return {
      ...useLogoSvgAndName(),
      ...useQuotes(),
      ...useLoginForm(),
    };
  },
});
</script>

<style lang="less" scoped>
.imgContainer {
  // background-color: darkgoldenrod;
  // background-image: url("~@/assets/images/login_bg.jpg");
  background-image: url("~@/assets/images/login_bg.jpg");
  background-size: cover;
}
.background-walk-y {
  background-repeat: no-repeat;
  background-position: 0 0%;
  animation-name: backgroundWalkY;
  animation-duration: 70s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
  // background-size: 100%;
}
@keyframes backgroundWalkY {
  0% {
    background-position: 0 0%;
  }
  100% {
    background-position: 0 100%;
  }
}
.ant-checkbox-inner {
  border-radius: 4px;
}
</style>