<template>
  <!-- :style="{
      height: 'calc(100% - 2rem)',
    }" -->
  <a-row
    flex
    class="h-full"
    :style="{
      'min-height': '830px',
    }"
  >
    <!-- :style="{
        width: '400px',
      }" -->
    <!-- <a-col :lg="7" :md="10" class="px-10 pt-12 relative"> -->
    <a-col id="leftSide" class="px-10 pt-12">
      <div>
        <div class="mb-10">
          <div
            class="inline-block w-20 h-20 flex items-center justify-center"
            :style="{
              filter: 'drop-shadow(0px 0px 8px #231F20)',
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
            'font-size': currentLocale === 'zh_CN' ? '24px' : '20px',
          }"
          class="mb-2"
        >
          {{ $t("pageLogin.welcomeUsage") }}
          <span class="font-bold">{{ $t("pageLogin.productVer") }}</span>
          <!-- 为 <span class="font-bold">Web 3.0</span> 而生的
          <span class="font-bold">比特币钱包</span>
          解决方案 -->
        </div>
        <div
          class="text-gray-400 mb-6"
          :style="{
            'line-height': '2',
          }"
        >
          {{ $t("pageLogin.signInDesc") }}
        </div>
        <div class="mb-2 font-12 font-bold">
          {{ $t("pageLogin.emailLabel") }}
        </div>
        <div class="mb-3">
          <a-input
            @keyup.enter="onSubmit"
            v-model:value="form.email"
            class="mb-4 rounded"
            size="large"
          ></a-input>
        </div>
        <div class="mb-2 font-12 font-bold">
          {{ $t("pageLogin.passwordLabel") }}
        </div>
        <div class="mb-3">
          <a-input-password
            @keyup.enter="onSubmit"
            v-model:value="form.password"
            class="mb-4 rounded"
            size="large"
          ></a-input-password>
        </div>
        <a-checkbox v-model:checked="isRememberMe" class="mb-8">{{
          $t("pageLogin.rememberMe")
        }}</a-checkbox>
        <div class="flex mb-10 items-center">
          <router-link to="/resetpassword" class="w-20 ant-color-blue-6">{{
            $t("pageLogin.forgetPassword")
          }}</router-link>
          <div
            class="flex-1 flex px-10 items-center justify-between text-gray-400"
            :style="{
              'font-size': '24px',
            }"
          >
            <i class="bg-gray-300 block w-1 h-1 rounded-full"></i>
            <a href="javascript:;">
              <a-tooltip title="WebAuthn">
                <SafetyOutlined />
              </a-tooltip>
            </a>
            <i
              class="h-5 bg-gray-300 text-center"
              :style="{ width: '2px', 'border-radius': '4px' }"
            ></i>
            <a href="javascript:;">
              <a-tooltip title="nMobile">
                <!-- <DeploymentUnitOutlined /> -->
                <img
                  src="~@/assets/images/nkn_gray.png"
                  class="w-6 h-6"
                  alt=""
                />
              </a-tooltip>
            </a>
            <i
              class="h-5 bg-gray-300 text-center"
              :style="{ width: '2px', 'border-radius': '4px' }"
            ></i>
            <a href="javascript:;">
              <a-tooltip title="other">
                <WalletOutlined />
              </a-tooltip>
            </a>
            <i class="bg-gray-300 block w-1 h-1 rounded-full"></i>
          </div>
          <div class="w-20">
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
              >{{ $t("pageLogin.loginButton") }}</a-button
            >
          </div>
        </div>
        <div class="text-center text-gray-500 mb-16 relative">
          {{ $t("pageLogin.notAccountyet") }}
          <router-link to="/register" class="ant-color-blue-6">{{
            $t("pageLogin.signUpNow")
          }}</router-link>
          <span
            class="pb-1 relative"
            :style="{
              bottom: '2px',
            }"
            >👉</span
          >
          <div
            class="absolute"
            :style="{
              top: '1px',
              right: '2px',
            }"
          >
            <XLocaleSwither class="cursor-pointer font-20 text-gray-500" />
          </div>
        </div>
      </div>
      <div>
        <div class="mb-2 text-center font-12 text-gray-400">
          Copyright © 2021 {{ $t("pageLogin.productName") }}
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
    <!-- :lg="17" -->
    <!-- :md="14" -->
    <a-col
      id="rightSide"
      class="imgContainer relative background-walk-y font-semibold text-white"
    >
      <div
        class="absolute font-20"
        :style="{
          right: '36px',
          top: '28px',
        }"
      >
        <div
          id="hashBox"
          class="
            px-2
            cursor-pointer
            rounded-full
            flex
            items-center
            justify-center
          "
          :style="{
            border: '3px solid #fff',
            color: '#fff',
          }"
          @click="onClickHash"
        >
          <div id="hashTag" class="overflow-hidden">#</div>
          <div id="hashContent" class="overflow-hidden">{{ hashContent }}</div>
        </div>
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
  <footer
    id="footer"
    class="
      fixed
      z-10
      bottom-0
      left-0
      right-0
      h-8
      bg-black
      text-white text-center
      flex
      items-center
      justify-center
    "
  >
    <div class="flex items-center">
      <div class="cursor-pointer" @click="onOpen('facebook')" title="facebook">
        <FacebookFilled class="font-20 mr-4" />
      </div>
      <div class="cursor-pointer" @click="onOpen('twitter')" title="twitter">
        <TwitterSquareFilled class="font-20 mr-4" />
      </div>
      <div class="cursor-pointer" @click="onOpen('discord')" title="discord">
        <img class="w-5 h-5" src="~@/assets/svg/icon_discord.svg" alt="" />
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { useSvgWhiteLogo } from "@/utils";
import { defineComponent, reactive, ref, toRaw } from "vue";
import {
  SafetyOutlined,
  WalletOutlined,
  DeploymentUnitOutlined,
  FacebookFilled,
  TwitterSquareFilled,
  TranslationOutlined,
} from "@ant-design/icons-vue";
import { message, notification } from "ant-design-vue";
import { apiEmailLogin } from "@/apollo/api";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import { useRouter } from "vue-router";
import { useClipboard } from "@vueuse/core";
import { XLocaleSwither } from "../../components";

export default defineComponent({
  components: {
    SafetyOutlined,
    WalletOutlined,
    DeploymentUnitOutlined,
    FacebookFilled,
    TwitterSquareFilled,
    TranslationOutlined,
    XLocaleSwither,
  },
  setup() {
    const { t, locale: currentLocale } = useI18n();
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
          message.warning(t("pageLogin.plsEnterEmailAndPwd"));
          return;
        }
        isLoadingSubmit.value = true;
        const resultEmailLogin = await apiEmailLogin({ email, password });
        isLoadingSubmit.value = false;
        if (resultEmailLogin.err) {
          // Modal.error(err); // initApollo onError 会报错
          message.warning(t("pageLogin.loginFailed"));
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
    /** 头部hash */
    function useTopHash() {
      const hashContent = ref<string>(
        "77fbeed45a8f630e68c984cdc408ca88e67b8683fbebd5288bd9f8d03632acc2"
      );
      const onClickHash = () => {
        useClipboard({ read: false })
          .copy(hashContent.value)
          .then(() => {
            message.success(t("metanet.copySuccess"));
          });
      };
      return {
        hashContent,
        onClickHash,
      };
    }
    /** 底部媒体 */
    function useFooter() {
      const onOpen = (type: "facebook" | "twitter" | "discord") => {
        const url =
          type === "facebook"
            ? "https://www.facebook.com/"
            : type === "twitter"
            ? "https://www.twitter.com/"
            : "https://www.discord.com/";
        window.open(url, "_blank");
      };
      return {
        onOpen,
      };
    }
    return {
      currentLocale,
      ...useLogoSvgAndName(),
      ...useQuotes(),
      ...useLoginForm(),
      ...useTopHash(),
      ...useFooter(),
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
#leftSide {
  // width: 440px;
  width: 440px; // 英语标题不换行, 这里加多100
}
#rightSide {
  flex: 1;
}
// antdv 用的是跟 bootstrap 一样的断点
// medium devices
// https://getbootstrap.com/docs/4.0/layout/overview/#responsive-breakpoints
@media screen and(max-width: 768px) {
  #leftSide {
    width: 100%;
  }
  #rightSide {
    width: 0;
  }
}
#footer {
  opacity: 0;
  transition: opacity 0.3s;
  &:hover {
    opacity: 0.9;
  }
}
#hashBox {
  opacity: 0.5;
  transition: opacity 0.3s;
  &:hover {
    opacity: 0.9;
    #hashTag {
      max-width: 0px;
    }
    #hashContent {
      max-width: 900px;
    }
  }
  #hashTag {
    max-width: 50px;
    transition: max-width 0.3s;
  }
  #hashContent {
    max-width: 0px;
    transition: max-width 0.3s;
  }
}
</style>