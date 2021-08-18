<template>
  <h2
    class="font-bold text-2xl xl:text-3xl enter-x text-center xl:text-left mb-6"
  >
    {{ $t("pageLogin.qrSignInFormTitle") }}
  </h2>
  <!--  -->
  <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
    <a-form-item>
      <XQrCode :url="QR_CODE_URL" :width="280" />
    </a-form-item>
    <a-divider
      ><span class="text-xs text-gray-500">{{
        $t("pageLogin.scanSign")
      }}</span></a-divider
    >
    <a-form-item :wrapper-col="{ span: 24 }">
      <a-button block @click.prevent="$emit('setKey', 'email')" size="large">{{
        $t("pageLogin.backSignIn")
      }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { QR_CODE_URL } from "@/constants";
import { defineComponent } from "vue";
import { XQrCode } from "../../../components";
export default defineComponent({
  emits: ["setKey"],
  components: {
    XQrCode,
  },
  setup() {
    return {
      QR_CODE_URL,
    };
  },
});
</script>

<style scoped></style>
