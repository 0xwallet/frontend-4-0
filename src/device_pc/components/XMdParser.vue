<template>
  <div class="markdown-body" v-html="clean"></div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import marked from "marked";
import DOMPurify from "dompurify";
import { TAG_COLOR_LIST } from "@/constants";

export default defineComponent({
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const clean = ref("");
    // marked.setOptions({});
    let colorIdx = 0;
    const getColor = () => TAG_COLOR_LIST[colorIdx++];
    marked.use({
      renderer: {
        // tag renderer
        text(text) {
          // console.log("arguments", arguments);
          // console.log("text", text, typeof text);
          return text.replace(
            /#(.+?)#/g,
            (m, p1) =>
              `<span class="markTag" style="background-color:${getColor()}">${p1}</span>`
          );
        },
      },
    });
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if ("target" in (node as any)) {
        node.setAttribute("target", "_blank");
      }
    });
    watch(
      () => props.content,
      (newVal) => {
        colorIdx = 0; // 重置colorIdx 从头渲染
        const parsedContent = marked(newVal);
        clean.value = DOMPurify.sanitize(parsedContent);
      },
      {
        immediate: true,
      }
    );
    // const parsedContent = marked(props.content);
    // clean.value = DOMPurify.sanitize(parsedContent);
    // console.log("clean", clean);
    return { clean };
  },
});
</script>

<style lang="less">
.markTag {
  cursor: default;
  font-size: 12px;
  border-radius: 2px;
  color: white;
  text-align: center;
  display: inline-block;
  height: 20px;
  line-height: 20px;
  padding: 0 7px;
  margin-right: 4px;
  &:hover {
    opacity: 0.85;
  }
}
</style>

<style lang="less" scoped>
.markdown-body {
  font-size: 14px;
}
</style>