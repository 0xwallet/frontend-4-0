import { MAX_FILEITEM_COUNT } from "@/constants";
import { defineStore } from "pinia";

type FileWindowItem = {
  path: string;
  tag: string[];
};
type BaseState = {
  isShowLoginModal: boolean;
  /** 文件窗口 */
  fileWindow: {
    [key: string]: FileWindowItem | null;
  };
};

export default defineStore({
  id: "base",
  state: (): BaseState => ({
    isShowLoginModal: false,
    fileWindow: {},
  }),
  getters: {
    activeFileWindowCount: (state) => {
      const fileWindow = state.fileWindow;
      return Object.keys(fileWindow).filter((key) => fileWindow[key] !== null)
        .length;
    },
  },
  actions: {
    changeIsShowLoginModal(v: boolean) {
      this.isShowLoginModal = v;
    },
    /** 设置对应的id 为默认的或者是{path,tag}或者null */
    setWindowIdItem(id: number, v: "default" | FileWindowItem | null) {
      if (v === "default") {
        this.fileWindow[id] = {
          path: "~",
          tag: [""],
        };
      } else {
        this.fileWindow[id] = v;
      }
    },
    /** 获取尚未激活的窗口id,激活并返回这个id */
    getNewOpenWindowId() {
      // console.log("fileWindow", this.fileWindow);
      // 从[1,MAX_FILEITEM_COUNT] 里选出一个还没有激活的
      let i = 1;
      while (this.fileWindow[i] && i <= MAX_FILEITEM_COUNT) {
        i += 1;
      }
      if (i > MAX_FILEITEM_COUNT)
        console.error(`window-id>${MAX_FILEITEM_COUNT}`, i);
      // console.log("怎么算的", i);
      this.setWindowIdItem(i, "default");
      return i;
    },
  },
});
