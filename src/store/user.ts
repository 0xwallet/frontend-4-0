import { useLocalStorage } from "@vueuse/core";
import { Wallet, ClassWallet, classMultiClient } from "nkn";
import { pick, assign } from "lodash-es";
import { defineStore } from "pinia";
import { getMultiClient } from "@/apollo/nknConfig";
import { toRaw } from "vue";
import { apiNknOnline, apiQueryMeAvatar, TApiRes } from "@/apollo/api";
import { Channel, Socket } from "phoenix";
const userLocalStorage = useLocalStorage<UserBaseState | Record<string, never>>(
  "user",
  {}
);
// console.log("user-store里的", userLocalStorage, toRaw(userLocalStorage.value));
type UserBaseState = {
  id: string;
  token: string;
  username: string;
  email: string;
};
type UserState = UserBaseState & {
  avatar: string;
  wallet: null | ClassWallet; // wallet
  multiClient: null | classMultiClient;
  socket: null | Socket;
  channel: null | Channel;
};
export default defineStore({
  id: "user",
  state: (): UserState => ({
    id: "",
    avatar: "",
    token: "",
    username: "",
    email: "",
    wallet: null, // wallet
    multiClient: null,
    socket: null,
    channel: null,
  }),
  getters: {
    isLoggedIn: (state) => state.token && state.wallet,
  },
  actions: {
    /** 请求并设置头像 */
    getAndSetUserAvatar() {
      apiQueryMeAvatar().then(({ data, err }) => {
        if (!err && data) {
          this.avatar = data.me.avatar || "";
        }
      });
    },
    signInAndSetTokenIdEmail(payLoad: UserBaseState) {
      if (!payLoad.token) throw Error("token为空");
      assign(this, payLoad);
      userLocalStorage.value = pick(this, ["id", "token", "username", "email"]);
    },
    /** 全流程请求式登录 token wallet client */
    async signInFullPath(payLoad: UserBaseState): TApiRes<UserBaseState> {
      this.signInAndSetTokenIdEmail(payLoad);
      this.setWallet();
      // const [resNknOnline, err2] = await apiNknOnline();
      const resultNknOnline = await apiNknOnline();
      // 非阻塞式请求头像信息
      this.getAndSetUserAvatar();
      if (resultNknOnline.err) return { err: resultNknOnline.err };
      this.setMultiClient();
      console.log(["apiNknOnline-success"], resultNknOnline.data);
      this.setSocket();
      // return [pick(this, ["id", "token", "username", "email"]), undefined];
      return { data: pick(this, ["id", "token", "username", "email"]) };
    },
    /** 从本地存储中登录 */
    async signInWithLocalStorage(): TApiRes<UserBaseState> {
      const storageUser = toRaw(userLocalStorage.value);
      // token 可能 undefined
      if (!storageUser.token) return { err: Error("存储里的user没有token") };
      this.signInAndSetTokenIdEmail(
        pick(storageUser, ["id", "token", "username", "email"])
      );
      this.setWallet();
      const resultNknOnline = await apiNknOnline();
      this.getAndSetUserAvatar();
      if (resultNknOnline.err) return { err: resultNknOnline.err };
      this.setMultiClient();
      this.setSocket();
      return { data: pick(this, ["id", "token", "username", "email"]) };
    },
    // TODO 假如登录过期了 要调用这个方法先清除
    /** 登出并清除信息 */
    signOutAndClear() {
      this.id = "";
      this.token = "";
      this.username = "";
      this.email = "";
      this.wallet = null;
      this.multiClient = null;
      this.channel = null;
      this.socket = null;
      userLocalStorage.value = {};
    },
    /** 设置钱包数据 */
    setWallet() {
      if (!this.wallet) {
        this.wallet = new Wallet({ password: this.email });
        console.log("[Ready wallet]", this);
      }
    },
    /** 初始化multiClient */
    setMultiClient() {
      if (!this.wallet) throw Error("wallet 未初始化");
      if (!this.multiClient) {
        this.multiClient = getMultiClient(this.wallet);
        console.log("[Ready multiClient]", this.multiClient);
      }
    },
    /** 重置multiClient */
    resetMultiClient() {
      if (!this.wallet) throw Error("wallet 未初始化");
      this.multiClient = null;
      this.multiClient = getMultiClient(this.wallet);
      console.log("[Ready multiClient]", this.multiClient);
    },
    /** 设置登录的socket 连接 */
    setSocket() {
      if (!this.token) throw Error("no token");
      if (this.socket) return;
      this.socket = new Socket("wss://owaf.io/socket", {
        params: () => ({ Authorization: "Bearer " + this.token }),
      });
      this.socket.connect();
      this.channel = this.socket.channel(`drive:user_${this.id}`, {});
      // 要通过监听这个去了解是否传达?
      this.channel.on("file_uploaded", (file) => {
        console.log("[file uploaded]", file);
      });
      // console.log("---this.channel", this.channel);
      this.channel
        .join()
        .receive("ok", (resp) => {
          console.log("[Ready] join socket channel", resp);
        })
        .receive("error", (err) => {
          console.log("websockt-channel-error---", err);
          console.error(err);
        });
    },
    /** 获取client */
    getMultiClient() {
      return new Promise<classMultiClient | null>((resolve) => {
        if (this.multiClient) resolve(this.multiClient);
        else {
          let counter = 0;
          const id = setInterval(() => {
            counter++;
            if (this.multiClient) {
              clearInterval(id);
              resolve(this.multiClient);
            } else if (counter > 100) {
              clearInterval(id);
              resolve(null);
            }
          }, 300);
        }
      });
    },
  },
});
