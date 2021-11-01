import { apiUploadSingle, ParamsUploadSingle } from "@/apollo/api";
import { UPLOAD_MSG } from "@/constants";
import { useDelay, getFileType, lastOfArray } from "@/utils";
import { uniqueId, unset, values } from "lodash-es";
import pLimit from "p-limit";
import { defineStore } from "pinia";
import { useUserStore } from ".";

/** 创建任务列表里唯一的id, hash + fullName */
export const makeUploadItemUniqueId = (
  fileHash: string,
  fullName: string[]
) => {
  return fileHash + fullName.join("/");
};

/** 上传状态:
 * 等待中 | |等待 NKN 节点| 上传中 | 暂停 | 等待ws返回 | 成功 | 失败
 */
export type UploadStatus =
  | "queueing"
  | "uploading"
  | "pause"
  | "waiting"
  | "success"
  | "successUpdate" // 成功更新文件
  | "successPeerTransferSend"
  | "successPeerTransferReceive"
  | "failed";

export type UploadItem = {
  file?: File; //文件本身
  uniqueId: string; // 标记该文件唯一的id fileHash + fullName.join('./') 组成
  fileHash: string; // 文件的id
  fullName: string[]; // 文件名称
  fileType: string;
  fileSize: number;
  progress: number;
  status: UploadStatus;
  action: "drive" | "update";
  toUpdateFileId?: string;
  roundId: number; // 回合id 用于计算总进度
  description: string;
  isSecondUpload?: boolean; // 是否急速上传
  speed: number; // 显示的时候要转换成 bytes / s
};

type TransportState = {
  /** 最大(并发)同时上传数量 */
  uploadController: pLimit.Limit;
  uploadHashMap: {
    [key: string]: UploadItem;
  };
  uploadCurRoundId: number;
};

const SUCCESS_STORAGE_KEY = "uploadSuccessList";
export const SUCCESS_STATUS_ARR = [
  "success",
  "successUpdate",
  "successPeerTransferSend",
  "successPeerTransferReceive",
];
let timerStorage: null | number = null;

export default defineStore({
  id: "transport",
  state: (): TransportState => ({
    uploadController: pLimit(2),
    uploadHashMap: {},
    uploadCurRoundId: 0, // 当前显示的总进度回合id
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
      return values(state.uploadHashMap).filter((i) => {
        return SUCCESS_STATUS_ARR.includes(i.status);
      });
    },
  },
  actions: {
    /** 合并多次触发存储的操作 */
    timeOutSetStorageFinishedList() {
      if (timerStorage === null) {
        timerStorage = window.setTimeout(() => {
          // console.log("setItem", this.uploadSuccessList);
          localStorage.setItem(
            SUCCESS_STORAGE_KEY,
            JSON.stringify(this.uploadSuccessList)
          );
          timerStorage = null;
        }, 500);
      }
    },
    // 从localStorage 里装载已经完成的list
    loadStorageFinishedList() {
      const storageList = localStorage.getItem(SUCCESS_STORAGE_KEY);
      const list: UploadItem[] = storageList ? JSON.parse(storageList) : [];
      list.forEach((item) => {
        // 凡是从本地缓存里读取的, roundId要设为-1
        this.uploadHashMap[item.uniqueId] = { ...item, roundId: -1 };
      });
    },
    /** 创建空投成功 函数 */
    makePeerTransferSuccessItem(
      type: "send" | "receive",
      fileName: string,
      fileSize: number
    ) {
      const peerTransferUniqueId = `${+Date.now()}`;
      this.uploadHashMap[peerTransferUniqueId] = {
        uniqueId: peerTransferUniqueId,
        fileHash: peerTransferUniqueId,
        fullName: [fileName],
        fileType: getFileType({ isDir: false, fileName }),
        fileSize,
        progress: 100,
        status:
          type === "send"
            ? "successPeerTransferSend"
            : "successPeerTransferReceive",
        roundId: -1,
        description: "",
        speed: 1,
        action: "drive",
      };
      // console.log("call-makePeerTransferSuccessItem", this.uploadHashMap);
      this.timeOutSetStorageFinishedList();
    },
    plusCurRoundId() {
      this.uploadCurRoundId += 1;
    },
    /** 恢复上传 */
    resumeItem(uniqueId: string) {
      const item = this.uploadHashMap[uniqueId];
      if (!item.file) return;
      this.setUploadItemProgressSpeedStatus(
        uniqueId,
        item.progress,
        item.speed,
        "queueing"
      );
      this.uploadFile({
        file: item.file,
        fullName: item.fullName,
        fileType: item.fileType,
        fileHash: item.fileHash,
        roundId: item.roundId,
        description: item.description,
        action: item.action,
        // action: "drive", // TODO 如果是update?
      });
    },
    /** 暂停上传: close uploadSession,set status pause */
    pauseItem(uniqueId: string) {
      // 1. 先设置的状态为暂停
      const item = this.uploadHashMap[uniqueId];
      this.setUploadItemProgressSpeedStatus(
        uniqueId,
        item.progress,
        item.speed,
        "pause"
      );
    },
    /** 删除item */
    clearItem(uniqueId: string) {
      //如果删除的是成功项, 跟localStorage 同步
      const isToClearItemSuccess = SUCCESS_STATUS_ARR.includes(
        this.uploadHashMap[uniqueId].status
      );
      if (isToClearItemSuccess) this.timeOutSetStorageFinishedList();
      if (this.uploadHashMap[uniqueId]) {
        unset(this.uploadHashMap, uniqueId);
      }
    },
    /** 取消上传 */
    cancelItem(uniqueId: string) {
      this.pauseItem(uniqueId);
      useDelay(100).then(() => {
        this.clearItem(uniqueId);
      });
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
            err: `2分钟内内未返回ws确认hash`,
          });
          clearTimeout(timer);
        }, 60000 * 2);
      });
    },
    setUploadItemByAssign(uniqueId: string, payLoad: Partial<UploadItem>) {
      const target = this.uploadHashMap[uniqueId];
      Object.assign(target, payLoad);
    },
    /** 设置单项进度和速度和状态 */
    setUploadItemProgressSpeedStatus(
      uniqueId: string,
      progress: number,
      speed: number,
      status: UploadStatus
    ) {
      this.setUploadItemByAssign(uniqueId, { progress, speed, status });
      if (SUCCESS_STATUS_ARR.includes(status))
        this.timeOutSetStorageFinishedList();
    },
    /** 在store 中上传单个文件 */
    async uploadFile({
      file,
      fullName,
      fileType,
      fileHash,
      roundId,
      description,
      action,
      toUpdateFileId,
    }: {
      file: File;
      fullName: string[]; // 包含路径的name
      fileType: string;
      fileHash: string;
      roundId: number;
      description: string;
      action: "drive" | "update";
      toUpdateFileId?: string;
    }) {
      // console.log(
      //   "uploadFile-params",
      //   file,
      //   fullName,
      //   fileType,
      //   fileHash,
      //   description
      // );
      const uniqueId = makeUploadItemUniqueId(fileHash, fullName);
      // 如果任务列表里没有, 就初始化(加上)
      if (!this.uploadHashMap[uniqueId]) {
        this.uploadHashMap[uniqueId] = {
          file,
          description,
          roundId,
          uniqueId,
          fileHash: fileHash,
          fullName: fullName,
          fileType: fileType,
          fileSize: file.size,
          progress: 0,
          status: "queueing",
          speed: 0,
          action,
        };
        if (toUpdateFileId) {
          this.uploadHashMap[uniqueId].toUpdateFileId = toUpdateFileId;
        }
      }
      const userStore = useUserStore();
      // 如果nkn 节点未就绪, 暂停该文件
      if (userStore.isLoadingMultiClient) {
        this.pauseItem(uniqueId);
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
          action,
          setSecondUpload: this.setUploadItemByAssign.bind(this, uniqueId, {
            isSecondUpload: true,
          }),
          // 中间状态(0-99) 传递给api 函数调用
          setProgressSpeedStatus:
            this.setUploadItemProgressSpeedStatus.bind(this),
          ...(toUpdateFileId
            ? {
                toUpdateFileId,
              }
            : {}),
        })
      );
      // console.log("resultUploadSingle", resultUploadSingle);
      // 处理返回的错误信息
      if (resultUploadSingle.err) {
        const errMsg = resultUploadSingle.err.message;
        console.log("errMsg---", errMsg);
        if (this.uploadHashMap[uniqueId]) {
          this.setUploadItemProgressSpeedStatus(
            uniqueId,
            this.uploadHashMap[uniqueId].progress,
            0,
            errMsg === UPLOAD_MSG.err_pauseByUser ? "pause" : "failed"
          );
        }
        return { err: resultUploadSingle.err };
      }
      // 非秒传成功 的要等websocket 返回确认信息
      if (resultUploadSingle.data.msg !== "秒传成功") {
        console.log(
          `${lastOfArray(
            this.uploadHashMap[uniqueId].fullName
          )}文件写入完毕,等待ws返回确认信息`
        );
        const resultWaitWs = await this.asyncWaitWsUploadResponse(fileHash);
        if (resultWaitWs.err) {
          // ws 超时未返回
          this.setUploadItemProgressSpeedStatus(uniqueId, 98, 0, "failed");
          return { err: resultWaitWs.err };
        }
      }
      this.setUploadItemProgressSpeedStatus(
        uniqueId,
        100,
        0,
        // 如果是上传设置为上传成功 否则 更新成功
        action === "drive" ? "success" : "successUpdate"
      );
      this.uploadHashMap[uniqueId].file = undefined; // 清空file 释放内存
      // console.log("store", this);
      return {
        data: `${lastOfArray(this.uploadHashMap[uniqueId].fullName)} - ${
          action === "drive" ? "上传" : "更新"
        }成功`,
      };
    },
  },
});
