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

          <div class="pswp__counter hidden"></div>

          <button
            class="pswp__button pswp__button--close"
            title="Close (Esc)"
            :style="{
              background: 'transparent',
              position: 'absolute',
              left: '0',
              color: 'white',
            }"
          >
            <van-icon name="arrow-left" />
          </button>

          <button
            class="pswp__button pswp__button--fs"
            title="Toggle fullscreen"
          ></button>

          <button
            class="pswp__button pswp__button--share"
            title="Share"
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

        <div ref="captionRef" id="captionBox" class="pswp__caption">
          <div class="pswp__caption__center hidden"></div>
          <div
            class="mdContainer"
            :style="{
              'max-width': '420px',
              margin: '0 auto',
            }"
            :class="{
              expandMdContainer: isExpandMdContainer,
            }"
            @click="onExpandMdContainer"
          >
            <MMdParser v-if="mdContent" :content="mdContent" theme="dark" />
          </div>
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
import { MMdParser } from ".";

export default defineComponent({
  components: {
    MMdParser,
  },
  setup(props) {
    const baseStore = useBaseStore();
    const mdContent = ref("");
    let gallery: null | PhotoSwipe<any> = null;
    const captionRef = ref(null);
    // const stopClickOutSide = onClickOutside(captionRef, (e) => {
    //   console.log("click-caption-outside");
    // });
    const setMdContentFromItemList = (idx: number) =>
      (mdContent.value = baseStore.photoSwipe.itemList[idx].title ?? "");
    const openPhotoSwipe = () => {
      closePhotoSwipe();
      // console.log("call openPhotoSwipe");
      const totalLen = baseStore.photoSwipe.itemList.length;
      // 注册第一次打开的 描述markdown
      setMdContentFromItemList(baseStore.photoSwipe.options.index ?? 0);
      gallery = new PhotoSwipe(
        document.querySelectorAll(".pswp")[0] as HTMLElement,
        PhotoSwipeUI_Default,
        baseStore.photoSwipe.itemList.map((item, idx) => ({
          ...item,
          // 加上 1/11 的索引
          title: `${idx + 1}/${totalLen}  ${item.title}`,
        })),
        {
          closeOnScroll: false,
          closeOnVerticalDrag: false,
          index: 0, // start at first slide
          ...baseStore.photoSwipe.options,
        }
      );
      // 解决移动端全屏的bug,copy from photoswipe.com 源码 --start

      let realViewportWidth,
        useLargeImages = false,
        firstResize = true,
        imageSrcWillChange: boolean;
      gallery.listen("beforeResize", function () {
        if (!gallery) return;
        let dpiRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
        dpiRatio = Math.min(dpiRatio, 2.5);
        realViewportWidth = gallery.viewportSize.x * dpiRatio;

        if (
          realViewportWidth >= 1200 ||
          (!(gallery as any).likelyTouchDevice && realViewportWidth > 800) ||
          screen.width > 1200
        ) {
          if (!useLargeImages) {
            useLargeImages = true;
            imageSrcWillChange = true;
          }
        } else {
          if (useLargeImages) {
            useLargeImages = false;
            imageSrcWillChange = true;
          }
        }

        if (imageSrcWillChange && !firstResize) {
          // console.log("call-gallery.invalidateCurrItems");
          gallery.invalidateCurrItems();
        }

        if (firstResize) {
          firstResize = false;
        }

        imageSrcWillChange = false;
      });
      // 解决移动端全屏的bug,copy from photoswipe.com 源码 --end

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
      gallery.listen("beforeChange", () => {
        setMdContentFromItemList(gallery?.getCurrentIndex() ?? 0);
      });
      gallery.listen("close", () => {
        baseStore.setPhotoSwipeVisible(false);
      });
      gallery.init();
    };
    const closePhotoSwipe = () => {
      if (gallery) {
        gallery.close();
        gallery = null;
      }
      // stopClickOutSide && stopClickOutSide();
    };
    const isExpandMdContainer = ref(false);
    const onExpandMdContainer = () => {
      isExpandMdContainer.value = !isExpandMdContainer.value;
      document
        .getElementById("captionBox")
        ?.classList.add("importantOpacity-100");
    };
    watch(
      () => baseStore.photoSwipe.isShow,
      (newVal) => {
        if (newVal === true) {
          openPhotoSwipe();
        } else {
          closePhotoSwipe();
          isExpandMdContainer.value = false;
        }
      },
      { immediate: true }
    );

    onUnmounted(() => {
      closePhotoSwipe();
    });
    return { captionRef, mdContent, isExpandMdContainer, onExpandMdContainer };
  },
});
</script>

<style lang="less" scoped>
// .pswp__caption__center {
// }
.pswp img {
  max-width: none;
  object-fit: contain !important;
}
:deep(.markdown-body) {
  background-color: #000;
}
.importantOpacity-100 {
  opacity: 1 !important;
}
.mdContainer {
  position: relative;
  max-height: 4em;
  padding: 0px 12px;
  overflow: hidden;
  overflow-y: scroll;
  scrollbar-color: #000 #393939; // for firefox
}
.mdContainer::-webkit-scrollbar {
  width: 8px;
}

.mdContainer::-webkit-scrollbar-track {
  background-color: #000;
}

.mdContainer::-webkit-scrollbar-thumb {
  background-color: #393939;
  border-radius: 100px;
}
.expandMdContainer {
  max-height: 12em;
}
</style>