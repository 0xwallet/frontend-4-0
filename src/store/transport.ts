import { apiUploadSingle, ParamsUploadSingle } from "@/apollo/api";
import { useDelay } from "@/hooks";
import { getFileType } from "@/utils";
import { unset, values } from "lodash-es";
import pLimit from "p-limit";
import { defineStore } from "pinia";
import { useUserStore } from ".";

/** 上传状态:
 * 等待中 | 上传中 | 暂停 | 等待ws返回 | 成功 | 失败
 */
export type UploadStatus =
  | "queueing"
  | "uploading"
  | "pause"
  | "waiting"
  | "success"
  | "failed";

export type UploadItem = {
  file?: File; //文件本身
  fileHash: string; // 文件的id
  fullName: string[]; // 文件名称
  fileType: string;
  fileSize: number;
  progress: number;
  status: UploadStatus;
  description: string;
  isSecondUpload?: boolean; // 是否急速上传
  speed: number; // 显示的时候要转换成 bytes / s
  closeSessionFn?: () => Promise<void>; // close 用来上传的session
};

type TransportState = {
  /** 最大(并发)同时上传数量 */
  uploadController: pLimit.Limit;
  uploadHashMap: {
    [key: string]: UploadItem;
  };
};

export default defineStore({
  id: "transport",
  state: (): TransportState => ({
    uploadController: pLimit(2),
    uploadHashMap: {},
  }),
  getters: {
    /** 所有的列表 */
    uploadList: (state) => {
      return values(state.uploadHashMap);
    },
    /** 正在上传的文件列表 */
    uploadingList: (state) => {
      const uploadStatusKeys = [
        "queueing",
        "uploading",
        "pause",
        "waiting",
        "failed",
      ];
      return values(state.uploadHashMap).filter((i) =>
        uploadStatusKeys.includes(i.status)
      );
    },
    /** 上传成功的文件列表 */
    uploadSuccessList: (state) => {
      return values(state.uploadHashMap).filter((i) => i.status === "success");
    },
  },
  actions: {
    /** 恢复上传 */
    resumeItem(hash: string) {
      const item = this.uploadHashMap[hash];
      if (!item.file) return;
      this.setUploadItemProgressSpeedStatus(
        hash,
        item.progress,
        item.speed,
        "queueing"
      );
      this.uploadFile({
        file: item.file,
        fullName: item.fullName,
        fileType: item.fileType,
        fileHash: item.fileHash,
        description: item.description,
      });
    },
    /** 暂停上传: close uploadSession,set status pause */
    pauseItem(hash: string) {
      const item = this.uploadHashMap[hash];
      if (item.closeSessionFn) {
        item.closeSessionFn();
      }
      this.setUploadItemProgressSpeedStatus(
        hash,
        item.progress,
        item.speed,
        "pause"
      );
    },
    /** 删除item */
    clearItem(hash: string) {
      if (this.uploadHashMap[hash]) {
        unset(this.uploadHashMap, hash);
      }
    },
    /** 取消上传 */
    cancelItem(hash: string) {
      this.pauseItem(hash);
      this.clearItem(hash);
    },
    /** 注册close session 的函数,不会重复添加 */
    registCloseSessionFn(hash: string, fn: () => Promise<void>) {
      if (!this.uploadHashMap[hash].closeSessionFn) {
        this.uploadHashMap[hash].closeSessionFn = fn;
      }
    },
    asyncWaitWsUploadResponse(fileHash: string) {
      return new Promise<
        { data: string; err: undefined } | { data: undefined; err: string }
      >((resolve) => {
        let timer = 0;
        const { channel } = useUserStore();
        if (!channel) throw Error("no channel");
        // console.log("channel", channel);
        const removeListener = channel.on(
          "file_uploaded",
          (fileUploadInfo: {
            full_name: string[];
            hash: string;
            id: string;
            space: number;
          }) => {
            if (fileUploadInfo.hash === fileHash) {
              useDelay(300).then(() => {
                resolve({ data: "websocket 返回确认hash", err: undefined });
                clearTimeout(timer);
                channel.off("file_uploaded", removeListener);
              });
            }
          }
        );
        // 设置超时
        timer = window.setTimeout(() => {
          channel.off("file_uploaded", removeListener);
          resolve({
            data: undefined,
            err: "websocket 60s内未返回文件确认hash",
          });
          clearTimeout(timer);
        }, 60000);
      });
    },
    setUploadItemByAssign(hash: string, payLoad: Partial<UploadItem>) {
      const target = this.uploadHashMap[hash];
      Object.assign(target, payLoad);
    },
    closeUploadFileSession(hash: string) {
      const item = this.uploadHashMap[hash];
      if (!item.closeSessionFn) {
        throw Error(`${hash}-no closeSessionFn`);
      }
      item.closeSessionFn();
    },
    /** 设置单项进度和速度和状态 */
    setUploadItemProgressSpeedStatus(
      hash: string,
      progress: number,
      speed: number,
      status: UploadStatus
    ) {
      this.setUploadItemByAssign(hash, { progress, speed, status });
    },
    /** 在store 中上传单个文件 */
    async uploadFile({
      file,
      fullName,
      fileType,
      fileHash,
      description,
    }: {
      file: File;
      fullName: string[]; // 包含路径的name
      fileType: string;
      fileHash: string;
      description: string;
    }) {
      // console.log(
      //   "uploadFile-params",
      //   file,
      //   fullName,
      //   fileType,
      //   fileHash,
      //   description
      // );
      // 如果任务列表里没有, 就初始化(加上)
      if (!this.uploadHashMap[fileHash]) {
        this.uploadHashMap[fileHash] = {
          file,
          description,
          fileHash: fileHash,
          fullName: fullName,
          fileType: fileType,
          fileSize: file.size,
          progress: 0,
          status: "queueing",
          speed: 0,
        };
      }
      // this.setUploadItemProgressSpeedStatus(fileHash, 0, 0, "queueing");
      const resultUploadSingle = await this.uploadController(() =>
        apiUploadSingle({
          file: file,
          fullName: fullName,
          fileHash: fileHash,
          userId: useUserStore().id,
          space: "PRIVATE",
          description: description,
          action: "drive",
          setSecondUpload: this.setUploadItemByAssign.bind(this, fileHash, {
            isSecondUpload: true,
          }),
          registStoreCloseSessionFn: this.registCloseSessionFn.bind(this),
          // 中间状态(0-99) 传递给api 函数调用
          setProgressSpeedStatus:
            this.setUploadItemProgressSpeedStatus.bind(this),
        })
      );
      // console.log("resultUploadSingle", resultUploadSingle);
      if (resultUploadSingle.err) {
        const errMsg = resultUploadSingle.err.message;
        this.setUploadItemProgressSpeedStatus(
          fileHash,
          this.uploadHashMap[fileHash].progress,
          0,
          errMsg === "任务暂停" ? "pause" : "failed"
        );
        return { err: resultUploadSingle.err };
      }
      // 非秒传成功 的要等websocket 返回确认信息
      if (resultUploadSingle.data.msg !== "秒传成功") {
        const resultWaitWs = await this.asyncWaitWsUploadResponse(fileHash);
        if (resultWaitWs.err) {
          // ws 超时未返回
          this.setUploadItemProgressSpeedStatus(fileHash, 98, 0, "failed");
          return { err: resultWaitWs.err };
        }
      }
      this.setUploadItemProgressSpeedStatus(fileHash, 100, 0, "success");
      this.uploadHashMap[fileHash].file = undefined; // 清空file 释放内存
      // console.log("store", this);
      return { data: "上传文件成功" };
    },
  },
});
