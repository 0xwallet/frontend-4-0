<template>
  <div class="markdown-body" v-html="clean"></div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import marked from "marked";
import DOMPurify from "dompurify";
import { transformRawDescription } from "@/utils";

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
    marked.use({
      renderer: {
        // tag renderer
        text(text) {
          // console.log("arguments", arguments);
          // console.log("text", text, typeof text);
          return transformRawDescription(text);
        },
      },
    });
    // DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    //   if ("target" in (node as any)) {
    //     node.setAttribute("target", "_blank");
    //   }
    // });
    watch(
      () => props.content,
      (newVal) => {
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