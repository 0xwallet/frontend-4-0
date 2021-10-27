import { MAX_FILEITEM_COUNT } from "@/constants";
import { DescObj } from "@/utils";
import { defineStore } from "pinia";

type FileWindowItem = {
  path: string;
  desc: DescObj;
};
type BaseState = {
  /** 是否显示移动端左侧菜单栏弹层 */
  isShowMobileLeftMenuPopup: boolean;
  isShowLoginModal: boolean;
  /** 文件窗口 */
  fileWindow: {
    [key: string]: FileWindowItem | null;
  };
};

export default defineStore({
  id: "base",
  state: (): BaseState => ({
    isShowMobileLeftMenuPopup: false,
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
    // 加载存储里的fileWindow数据
    loadStorageFileWindow() {
      const rawFileWindow = localStorage.getItem("fileWindow");
      if (!rawFileWindow) return;
      const fileWindow = JSON.parse(rawFileWindow);
      Object.assign(this.fileWindow, fileWindow);
    },
    /** 设置对应的id 为默认的或者是{path,tag}或者null */
    setWindowIdItem(id: number, v: "default" | FileWindowItem | null) {
      if (v === "default") {
        this.fileWindow[id] = {
          path: "~",
          desc: { tagArr: [], text: "" },
        };
      } else {
        this.fileWindow[id] = v;
      }
      localStorage.setItem("fileWindow", JSON.stringify(this.fileWindow));
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
    /** 切换移动端左侧菜单栏弹层 */
    changeMobileLeftPopupVisible(v: boolean) {
      this.isShowMobileLeftMenuPopup = v;
    },
  },
});
