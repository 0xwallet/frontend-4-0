<template>
  <a-tooltip
    :title="hash"
    :destroyTooltipOnHide="true"
    :arrowPointAtCenter="true"
    overlayClassName="tdHashToolTip"
  >
    <div
      class="tdHash font-dmmono cursor-pointer flex items-center"
      @click="onCopyHash"
    >
      <div class="tdHashText relative cursor-pointer flex items-center">
        <div>
          {{ hash.slice(0, 5) }}
        </div>
        <div class="flex items-center">
          <i
            v-for="color in ['#2170FF', '#FF0078', '#FF9F00']"
            :key="color"
            class="tdHashDot relative align-middle ml-0.5 inline-block"
            :style="{
              'background-color': color,
              'font-size': 0,
            }"
          ></i>
        </div>
        <div class="ml-0.5">{{ hash.slice(-5) }}</div>
      </div>
      <CopyOutlined class="tdHashIcon ml-1 cursor-pointer" />
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

<style lang="less">
.tdHashToolTip {
  .ant-tooltip-inner {
    font-family: "DM Mono";
    text-align: center;
    border-radius: 8px;
    background-color: #0a0a0a;
    width: 420px;
  }
}
.tdHashText:hover {
  // color: #2170ff; // bitcoin 网站色
  color: #1890ff;
}
.tdHash:hover .tdHashIcon {
  // display: block;
  font-size: 16px;
  opacity: 0.5;
}
.tdHashIcon {
  opacity: 0;
  color: #1890ff;
  &:hover {
    opacity: 1 !important;
  }
}
.tdHashDot {
  width: 6px;
  height: 6px;
  border-radius: 10px;
}
// 圆点样式from https://blockchair.com/bitcoin
.tdHash:hover .tdHashDot:nth-of-type(1) {
  animation: cyan-to-yellow 0.46s cubic-bezier(0.04, 0.91, 0.94, 0.11) 0s 1
    forwards;
}
.tdHash:hover .tdHashDot:nth-of-type(2) {
  animation: red-to-cyan 0.46s cubic-bezier(0.04, 0.91, 0.94, 0.11) 0s 1
    forwards;
}
.tdHash:hover .tdHashDot:nth-of-type(3) {
  animation: yellow-to-red 0.46s cubic-bezier(0.04, 0.91, 0.94, 0.11) 0s 1
    forwards;
}

// 第一个点
@keyframes cyan-to-yellow {
  0% {
    color: var(--c-cyan-d3);
    top: 0;
  }

  25% {
    color: var(--c-red);
    top: -5px;
  }

  50% {
    color: var(--c-yellow-d3);
    top: 1px;
  }

  to {
    color: var(--c-yellow-d3);
    top: 0;
  }

  0% {
    background-color: var(--c-cyan-d3);
  }

  25% {
    background-color: var(--c-red);
  }

  50% {
    background-color: var(--c-yellow-d3);
  }

  to {
    background-color: var(--c-yellow-d3);
  }
}
// 第二个点
@keyframes red-to-cyan {
  0% {
    color: var(--c-red);
    top: 0;
  }

  25% {
    color: var(--c-red);
    top: 0;
  }

  50% {
    color: var(--c-yellow-d3);
    top: -5px;
  }

  75% {
    color: var(--c-cyan-d3);
    top: 3px;
  }

  to {
    color: var(--c-cyan-d3);
    top: 0;
  }

  0% {
    background-color: var(--c-red);
  }

  25% {
    background-color: var(--c-red);
  }

  50% {
    background-color: var(--c-yellow-d3);
  }

  75% {
    background-color: var(--c-cyan-d3);
  }

  to {
    background-color: var(--c-cyan-d3);
  }
}
// 第三个点
@keyframes yellow-to-red {
  0% {
    color: var(--c-yellow-d3);
    top: 0;
  }

  50% {
    color: var(--c-yellow-d3);
    top: 0;
  }

  75% {
    color: var(--c-cyan-d3);
    top: -4px;
  }

  to {
    color: var(--c-red);
    top: 0;
  }

  0% {
    background-color: var(--c-yellow-d3);
  }

  50% {
    background-color: var(--c-yellow-d3);
  }

  75% {
    background-color: var(--c-cyan-d3);
  }

  to {
    background-color: var(--c-red);
  }
}
</style>

<style>
:root {
  --c-red: #ff0078;
  --c-yellow-d3: #ff9f00;
  --c-cyan-d3: #2170ff;
}
</style>