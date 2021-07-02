<template>
  <!-- <a-tooltip :title="`[${type}]`"> -->
  <a-tooltip :title="hash">
    <!-- <span class="font-dmmono cursor-pointer" @click="onCopyHash"
      >{{ hash.slice(0, 2)
      }}<i
        v-for="item in colors"
        :key="item"
        :style="{ 'background-color': item }"
        >&nbsp;&nbsp;&nbsp;</i
      >{{ hash.slice(-2) }}<CopyOutlined class="ml-1 cursor-pointer"
    /></span> -->
    <div
      class="font-dmmono cursor-pointer flex items-center"
      @click="onCopyHash"
    >
      <div>
        {{ hash.slice(0, 5) }}
      </div>
      <div class="flex items-center">
        <i
          v-for="color in ['#f50', '#2db7f5', 'purple']"
          :key="color"
          class="align-middle ml-0.5 inline-block w-1.5 h-1.5 rounded-full"
          :style="{
            'background-color': color,
            'font-size': 0,
          }"
        ></i>
      </div>
      <div class="ml-0.5">{{ hash.slice(-5) }}</div>
      <CopyOutlined class="ml-1 cursor-pointer" />
    </div>
  </a-tooltip>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue";
import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
// import ColorHash from "color-hash";
// import { chunk } from "lodash-es";
// const colorHash = new ColorHash();

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
    // const colors = chunk([...props.hash], Math.floor(props.hash.length / 6))
    //   .slice(0, 6)
    //   .map((i) => colorHash.hex(i.join("")));
    // console.log("colors", colors);
    // return { colors, onCopyHash };
    return { onCopyHash };
  },
});
</script>
