import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import { useDelay } from ".";
/**
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html: string) {
  const template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}
type PItem = {
  src: string;
  w?: number;
  h?: number;
  title?: string;
};
export type PhotoSwipeItemList = PItem[];
/** 用 photoSwipe 预览图片 */
export const previewImg = (
  itemList: PhotoSwipeItemList,
  startIdx: number,
  options?: PhotoSwipeUI_Default.Options
) => {
  document.getElementById("photoSwipeWrap")?.remove();
  const el = htmlToElement(
    `<div id="photoSwipeWrap" class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
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
            style="padding:0px;border:10px solid transparent"
          ></div>
        </div>
      </div>
    </div>
  </div>`
  );
  if (!el) return;
  document.body.appendChild(el);
  const gallery = new PhotoSwipe(
    document.querySelectorAll(".pswp")[0] as HTMLElement,
    PhotoSwipeUI_Default,
    itemList,
    {
      closeOnScroll: false,
      index: startIdx, // 一开始显示第几张图
      ...(options ? options : {}),
    }
  );
  gallery.listen("imageLoadComplete", function (index, item) {
    // 如果是 0 的话, 设为自动宽高
    // console.log("item...", item);
    if (item.h === 0 || item.w === 0) {
      const img = new Image();
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
    // console.log("close");
    useDelay(500).then(() =>
      document.getElementById("photoSwipeWrap")?.remove()
    );
  });
  gallery.init();
};
