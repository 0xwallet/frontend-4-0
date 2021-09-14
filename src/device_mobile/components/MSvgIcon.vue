<template>
  <span class="anticon" role="img" v-html="svgStr"></span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const SVG_MAP: { [key: string]: (size: number) => string } = {
  share: (size) => `
<svg t="1631606612058" fill="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2848" width="${size}" height="${size}"><path d="M821.1456 276.8384c-235.9296 25.1392-449.1776 226.7136-490.5472 452.352a38.4 38.4 0 1 1-75.5712-13.824c45.568-248.576 269.312-468.48 526.6944-510.6688l-117.8112-69.1712a38.4 38.4 0 0 1 38.912-66.2528l223.3344 131.1744a38.4 38.4 0 0 1 10.1376 57.6l-170.752 206.6432a38.4 38.4 0 1 1-59.1872-48.9472l114.7904-138.9056z" p-id="2849"></path><path d="M832 620.0832a38.4 38.4 0 0 1 76.8 0v158.208c0 85.9648-61.5936 157.8496-140.8 157.8496H204.8c-79.2064 0-140.8-71.8848-140.8-157.9008V300.3904c0-86.016 61.5936-157.8496 140.8-157.8496h220.2112a38.4 38.4 0 1 1 0 76.8H204.8c-33.8944 0-64 35.072-64 81.0496V778.24c0 45.9776 30.1056 81.1008 64 81.1008h563.2c33.8944 0 64-35.1232 64-81.1008v-158.1568z" p-id="2850"></path></svg>
  `,
  zip: (size) => `
<svg t="1631604981178" fill="currentColor" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13403" width="${size}" height="${size}"><path d="M940 233L743 37.7V37H249.9c-22.1 0-40 17.9-40 40v373H112c-22.1 0-40 17.9-40 40v234.7c0 22.1 17.9 40 40 40h629.1c22.1 0 40-17.9 40-40V490c0-22.1-17.9-40-40-40H269V97c0-0.6 0.4-1 1-1h414v196.7h195V921c0 0.6-0.4 1-1 1H270c-0.6 0-1-0.4-1-1v-77.3-1.2c0-16.3-13.2-29.5-29.5-29.5S210 826.2 210 842.5v0.5h-0.1v98c0 22.1 17.9 40 40 40h650c22.1 0 40-17.9 40-40V292.7h0.1v-59h-0.7l0.7-0.7zM498 504h95c37 0 67 30 67 67s-30 67-67 67h-51v74h-44V504z m-98 0h44v208h-44V504z m-40 0v38h-0.8L251.8 675H360v38H197v-38h0.8l106.4-133H200v-38h160z m383-270.3v-112l113 112H743zM616 572c0-17.1-13.9-31-31-31h-43v62h43c17.1 0 31-13.9 31-31z" p-id="13404"></path></svg>
  `,
};
// 用法, 从iconfont复制svg代码(加 fill="currentColor" 才能继承颜色, 改width/height)
export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const svgStr = SVG_MAP[props.icon](props.size);
    return { svgStr };
  },
});
</script>

<style scoped>
</style>