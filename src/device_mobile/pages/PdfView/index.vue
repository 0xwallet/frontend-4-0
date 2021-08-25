<template>
  <div class="w-full h-full relative">
    <div id="pdfContainer" class="w-full h-full overflow-auto"></div>
    <div v-if="isLoadingPdf" class="absolute inset-0 text-center pt-28">
      <van-loading size="40" color="#0094ff" vertical>加载中...</van-loading>
    </div>
    <div v-if="isShowError" class="absolute inset-0 text-center pt-28">
      <van-empty image="error" description="加载pdf失败, token过期" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import pdfjsLib from "pdfjs-dist"; // vue.config.js external
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
// import pdfjsViewer from "pdfjs-dist/web/pdf_viewer.js";

export default defineComponent({
  setup() {
    const route = useRoute();
    const pdfUrl = route.query.url as string;
    // console.log("pdfUrl", pdfUrl);

    const isLoadingPdf = ref(true);
    const isShowError = ref(false);
    onMounted(() => {
      const url = encodeURI(pdfUrl);
      let thePdf: PDFDocumentProxy;
      const initPdfViewer = async () => {
        console.log("pdfjsLib", pdfjsLib);
        const PDFjs = (window as any).pdfjsLib as typeof pdfjsLib;
        PDFjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.9.359/build/pdf.worker.min.js";
        const viewer = document.getElementById("pdfContainer");
        PDFjs.getDocument(url)
          .promise.then((pdf) => {
            isLoadingPdf.value = false;
            thePdf = pdf;
            for (let page = 1; page <= pdf.numPages; page++) {
              const canvas = document.createElement("canvas");
              canvas.className = "pdf-page-canvas";
              viewer?.appendChild(canvas);
              renderPage(page, canvas);
            }
          })
          .catch((err) => {
            isLoadingPdf.value = false;
            isShowError.value = true;
            console.log("加载pdf出错,token过期", err);
          });
        function renderPage(pageNumber: number, canvas: any) {
          thePdf.getPage(pageNumber).then(function (page) {
            if (!viewer) return;
            var unscaledViewport = page.getViewport({ scale: 1 });
            var scale = viewer.clientWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            page.render({
              canvasContext: canvas.getContext("2d"),
              viewport: viewport,
            });
          });
        }
      };
      initPdfViewer();
    });
    return { pdfUrl, isLoadingPdf, isShowError };
  },
});
</script>

<style lang="less" scoped>
#pdfContainer {
  background: rgba(0, 0, 0, 0.1);
}
</style>