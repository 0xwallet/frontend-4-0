<template>
  <!-- photoswipe -->
  <!-- Root element of PhotoSwipe. Must have class pswp. -->
  <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
    <!-- Background of PhotoSwipe. 
       It's a separate element as animating opacity is faster than rgba(). -->
    <div class="pswp__bg"></div>

    <!-- Slides wrapper with overflow:hidden. -->
    <div class="pswp__scroll-wrap">
      <!-- Container that holds slides. 
          PhotoSwipe keeps only 3 of them in the DOM to save memory.
          Don't modify these 3 pswp__item elements, data is added later on. -->
      <div class="pswp__container">
        <div class="pswp__item"></div>
        <div class="pswp__item"></div>
        <div class="pswp__item"></div>
      </div>

      <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
      <div class="pswp__ui pswp__ui--hidden">
        <div class="pswp__top-bar">
          <!--  Controls are self-explanatory. Order can be changed. -->

          <div class="pswp__counter"></div>

          <button
            class="pswp__button pswp__button--close"
            title="Close (Esc)"
          ></button>

          <button
            class="pswp__button pswp__button--share"
            title="Share"
          ></button>

          <button
            class="pswp__button pswp__button--fs"
            title="Toggle fullscreen"
          ></button>

          <button
            class="pswp__button pswp__button--zoom"
            title="Zoom in/out"
          ></button>

          <!-- Preloader demo https://codepen.io/dimsemenov/pen/yyBWoR -->
          <!-- element will get class pswp__preloader--active when preloader is running -->
          <div class="pswp__preloader">
            <div class="pswp__preloader__icn">
              <div class="pswp__preloader__cut">
                <div class="pswp__preloader__donut"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"
        >
          <div class="pswp__share-tooltip"></div>
        </div>

        <button
          class="pswp__button pswp__button--arrow--left"
          title="Previous (arrow left)"
        ></button>

        <button
          class="pswp__button pswp__button--arrow--right"
          title="Next (arrow right)"
        ></button>

        <div ref="captionRef" class="pswp__caption">
          <div
            id="captionBox"
            class="pswp__caption__center text-overflow-2"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  watch,
} from "vue";
import "photoswipe/dist/photoswipe.css";
import "photoswipe/dist/default-skin/default-skin.css";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import { onClickOutside } from "@vueuse/core";
import { useBaseStore } from "@/store";

export default defineComponent({
  setup(props) {
    const baseStore = useBaseStore();
    let gallery: null | PhotoSwipe<any> = null;
    const captionRef = ref(null);
    // const stopClickOutSide = onClickOutside(captionRef, (e) => {
    //   console.log("click-caption-outside");
    // });
    const openPhotoSwipe = () => {
      closePhotoSwipe();
      // console.log("call openPhotoSwipe");
      gallery = new PhotoSwipe(
        document.querySelectorAll(".pswp")[0] as HTMLElement,
        PhotoSwipeUI_Default,
        baseStore.photoSwipe.itemList,
        {
          closeOnScroll: false,
          index: 0, // start at first slide
        }
      );
      gallery.listen("imageLoadComplete", function (index, item) {
        // 如果是 0 的话, 设为自动宽高
        // console.log("item...", item);
        if (item.h === 0 || item.w === 0) {
          let img = new Image();
          img.onload = () => {
            item.w = img.width;
            item.h = img.height;
            gallery?.invalidateCurrItems();
            gallery?.updateSize(true);
          };
          img.src = item.src as string;
        }
      });
      gallery.listen("close", () => {
        baseStore.setPhotoSwipeIsShow(false);
      });
      gallery.init();
      document.getElementById("captionBox")?.addEventListener(
        "click",
        function (e) {
          console.log(e);
          e.preventDefault();
          e.stopPropagation(); // 不要传递到其他元素的点击事件
          this.classList.remove("text-overflow-2");
        },
        { capture: true }
      );
    };
    const closePhotoSwipe = () => {
      if (gallery) {
        gallery.close();
        gallery = null;
      }
      // stopClickOutSide && stopClickOutSide();
    };
    watch(
      () => baseStore.photoSwipe.isShow,
      (newVal) => {
        if (newVal === true) {
          openPhotoSwipe();
        } else {
          closePhotoSwipe();
        }
      },
      { immediate: true }
    );

    onUnmounted(() => {
      closePhotoSwipe();
    });
    return { captionRef };
  },
});
</script>

<style lang="less" scoped>
.pswp__caption__center {
  padding: 0;
  border: 10px solid transparent;
}
.pswp img {
  max-width: none;
  object-fit: contain !important;
}
</style>