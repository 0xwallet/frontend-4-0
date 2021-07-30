import { defineStore } from "pinia";

type BaseState = {
  isShowLoginModal: boolean;
};

export default defineStore({
  id: "base",
  state: (): BaseState => ({
    isShowLoginModal: false,
  }),
  actions: {
    changeIsShowLoginModal(v: boolean) {
      this.isShowLoginModal = v;
    },
  },
});
