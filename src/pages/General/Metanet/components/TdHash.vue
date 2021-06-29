<template>
  <a-tooltip :title="`[${type}]`">
    <span class="cursor-pointer" @click="onCopyHash"
      >{{ hash.slice(0, 2)
      }}<i
        v-for="item in colors"
        :key="item"
        :style="{ 'background-color': item }"
        >&nbsp;&nbsp;&nbsp;</i
      >{{ hash.slice(-2) }}<CopyOutlined class="ml-1 cursor-pointer"
    /></span>
  </a-tooltip>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue";
import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import ColorHash from "color-hash";
import { chunk } from "lodash-es";
const colorHash = new ColorHash();

export default defineComponent({
  components: {
    CopyOutlined,
  },
  props: {
    hash: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "SHA256", // txid TxID
    },
  },
  setup(props) {
    const { t } = useI18n();
    const { copy } = useClipboard({ read: false });
    const onCopyHash = () => {
      const text =
        props.type === "SHA256"
          ? props.hash
          : `${window.location.origin}/#/p?txid=${props.hash}`;
      copy(text).then(() => message.success(t("metanet.copySuccess")));
    };
    const colors = chunk([...props.hash], Math.floor(props.hash.length / 6))
      .slice(0, 6)
      .map((i) => colorHash.hex(i.join("")));
    // console.log("colors", colors);
    return { colors, onCopyHash };
  },
});
</script>

<style scoped>
</style>