import { DriveUserSetting, IUser, Session } from "../@types/apolloType";
import { decode, encode } from "@msgpack/msgpack";
import { useTransportStore, useUserStore } from "@/store";
import { useApollo } from "./action";
import {
  User,
  NetFile_Basic,
  NetFile_Share,
  NetFile_Publish,
  NetFile_Collection,
} from "./documents";
import { TMessageType, TSession } from "nkn";
import { UPLOAD_MSG, MAX_MTU, REMOTE_ADDR } from "@/constants";
import { getFileSHA256, writeHeaderInSession, useDelay } from "@/utils";
import pLimit from "p-limit";
import dayjs from "dayjs";
import { makeUploadItemUniqueId, UploadStatus } from "@/store/transport";
import { remove } from "lodash-es";

/** 通用的api 请求返回类型 */
export type TApiRes<T> = Promise<
  | {
      data: T;
      err?: undefined;
    }
  | {
      data?: undefined;
      err: Error;
    }
>;

type ParamsEmailLogin = {
  code?: string;
  email: string;
  password: string;
};

type ResponseEmailLogin = {
  signin: {
    token: string;
    user: IUser;
  };
};

/** 邮箱登录 */
export const apiEmailLogin = async (
  params: ParamsEmailLogin
): TApiRes<ResponseEmailLogin> => {
  try {
    const data = await useApollo<ResponseEmailLogin>({
      mode: "mutate",
      gql: User.signIn,
      variables: {
        ...params,
        code: "",
      },
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ResponseNknOnline = {
  nknOnline: string;
};
/** nkn 登录获取 */
export const apiNknOnline = async (): TApiRes<ResponseNknOnline> => {
  try {
    const { wallet } = useUserStore();
    const data = await useApollo<ResponseNknOnline>({
      mode: "mutate",
      gql: User.nknOnline,
      variables: { nknPublicKey: wallet?.getPublicKey() },
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsSendCaptcha = {
  email: string;
};
type ResponseSendCaptcha = {
  sendLoginCode: string;
};
/** 发送登录邮箱验证码 */
export const apiSendSignInEmailCaptcha = async (
  params: ParamsSendCaptcha
): TApiRes<ResponseSendCaptcha> => {
  try {
    const data = await useApollo<ResponseSendCaptcha>({
      mode: "mutate",
      gql: User.sendLoginCode,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsSendSignUpEmailCaptcha = {
  email?: string;
  type: string;
  nkn?: string;
};
type ResponseSendSignUpEmailCaptcha = {
  sendLoginCode: string;
};
/** 发送注册邮箱验证码 */
export const apiSendSignUpEmailCaptcha = async (
  params: ParamsSendSignUpEmailCaptcha = { type: "ACTIVE_EMAIL" }
): TApiRes<ResponseSendSignUpEmailCaptcha> => {
  try {
    const data = await useApollo<ResponseSendSignUpEmailCaptcha>({
      mode: "mutate",
      gql: User.sendVerifyCode,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsSignUp = {
  email: string;
  password: string;
  code: string;
  username: string;
  nknPublicKey: string;
};
type ResponseSignUp = {
  msg: string;
};
/** 用户注册 */
export const apiSignUp = async (
  params: ParamsSignUp
): TApiRes<ResponseSignUp> => {
  try {
    const data = await useApollo<ResponseSignUp>({
      mode: "mutate",
      gql: User.signUp,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsResetPwd = {
  email: string;
  newPassword: string;
  code: string;
  nknPublicKey: string;
};
type ResponseResetPwd = {
  msg: string;
};
/** 用户重置密码 */
export const apiResetPwd = async (
  params: ParamsResetPwd
): TApiRes<ResponseResetPwd> => {
  try {
    const data = await useApollo<ResponseResetPwd>({
      mode: "mutate",
      gql: User.resetPassword,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ResponseQureyMe = {
  // TODO
  avatar: null | string;
  email: string;
  id: string;
  messageNknAddress: string;
  username: string;
  wallets: {
    id: string;
    info: {
      publicKey: null | string;
    };
    tags: string[];
  }[];
  // ...
};
// TODO 头像
/** 查询用户信息 */
export const apiQueryMe = async (): TApiRes<ResponseQureyMe> => {
  try {
    const data = await useApollo<ResponseQureyMe>({
      mode: "query",
      gql: NetFile_Basic.queryMeSpace,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ResponseMeAvatar = {
  me: {
    avatar: null | string;
  };
};
/** 查询用户头像 */
export const apiQueryMeAvatar = async (): TApiRes<ResponseMeAvatar> => {
  // queryMeAvatar
  try {
    const data = await useApollo<ResponseMeAvatar>({
      mode: "query",
      gql: NetFile_Basic.queryMeAvatar,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ResponseQueryMeSpace = {
  me: {
    driveSetting: DriveUserSetting;
  };
};

/** 查询我的空间使用信息 */
export const apiQueryMeSpace = async (): TApiRes<ResponseQueryMeSpace> => {
  try {
    const data = await useApollo<ResponseQueryMeSpace>({
      mode: "query",
      gql: NetFile_Basic.queryMeSpace,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

export type ParamsQueryFileByDir = {
  dirId?: string;
  fullName?: string[];
};
export type TFileItem = {
  fullName: string[];
  hash: string;
  id: string;
  info: { description: null | string; size: string };
  insertedAt: string;
  isDir: boolean;
  isShared: boolean;
  space: string;
  updatedAt: string;
  fileType?: string;
  user: {
    id: string;
    driveSetting: {
      availableSpace: string;
      totalSpace: string;
      usedSpace: string;
    };
  };
};
export type TFileList = (TFileItem | null)[];

type ResponseQueryFileByDir = {
  driveListFiles: TFileList;
};
/** 网盘-查询我的文件 */
export const apiQueryFileByDir = async (
  params: ParamsQueryFileByDir
): TApiRes<ResponseQueryFileByDir> => {
  try {
    const data = await useApollo<ResponseQueryFileByDir>({
      mode: "query",
      gql: NetFile_Basic.driveListFiles,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};
type ParamsEditFileDescption = {
  description: string;
  userFileId: string;
};
type ResponseEditFileDescption = {
  driveEditDescription: {
    info: {
      description: string | null;
    };
  };
};
/** 网盘-修改文件(夹)描述 */
export const apiEditFileDescption = async (
  params: ParamsEditFileDescption
): TApiRes<ResponseEditFileDescption> => {
  try {
    const data = await useApollo<ResponseEditFileDescption>({
      mode: "mutate",
      gql: NetFile_Basic.driveEditDescription,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

export type ParamsUploadSingle = {
  // file: File;
  // File: Uint8Array;
  isCreateNewFile?: boolean;
  file?: File;
  fullName: string[];
  fileHash: string;
  // FileSize: number;
  userId: string;
  space: "PRIVATE" | "PUBLIC";
  description: string;
  action: "drive" | "update";
  toUpdateFileId?: string;
  setSecondUpload?: () => void;
  setProgressSpeedStatus?: (
    uniqueId: string,
    progress: number,
    speed: number,
    status: UploadStatus
  ) => void;
  // setProgress?: (percentNum: number, bytesPerSecond: number) => void;
};
type ResponseUploadSingle = {
  msg: string;
};
/** 多个任务请求session 时限制同时一个 */
const sessionLimit = pLimit(1);
/** 上传单个文件 */
export const apiUploadSingle = async (
  params: ParamsUploadSingle
): TApiRes<ResponseUploadSingle> => {
  if (!params || !params.file) return { err: Error(UPLOAD_MSG.err_noParams) };
  const transportStore = useTransportStore();
  const uniqueId = makeUploadItemUniqueId(params.fileHash, params.fullName);
  /** 当前上传的文件状态是否已经被用户暂停 */
  const isCurrentUploadStatusPause = () => {
    // 如果是新建文件 , 不检查任务中心队列
    if (params.isCreateNewFile === true) return false;
    if (!transportStore.uploadHashMap[uniqueId]) return true;
    return transportStore.uploadHashMap[uniqueId].status === "pause";
  };
  if (isCurrentUploadStatusPause()) {
    return { err: Error(UPLOAD_MSG.err_pauseByUser) };
  }

  if (params.setProgressSpeedStatus) {
    /** 如果是暂停的文件,进度设置为当前的进度,否则从0开始 */
    const getCurProgres = () => {
      return transportStore.uploadHashMap[uniqueId].progress > 0
        ? transportStore.uploadHashMap[uniqueId].progress
        : 0;
    };
    // 从初始的 排队 状态切换为上传状态
    params.setProgressSpeedStatus(uniqueId, getCurProgres(), 0, "uploading");
  }
  // 1. 先调秒传
  // const [resSecondUpload, errSecondUpload] = await apiSecondUpload({
  // 从那个位置开始传输
  let startOffset = 0;
  if (params.action === "drive") {
    // 如果是上传, 调秒传
    const resultSecondUpload = await apiSecondUpload({
      fullName: params.fullName,
      fileHash: params.fileHash,
      description: params.description,
    });
    if (resultSecondUpload.err) {
      return { err: resultSecondUpload.err };
    }
    const { driveUploadByHash } = resultSecondUpload.data;
    console.log("-秒传返回--", driveUploadByHash);
    if (driveUploadByHash.id) {
      // if (params.SetProgress) params.SetProgress(100); 秒传成功后父组件设置了
      if (params.setProgressSpeedStatus) {
        params.setProgressSpeedStatus(uniqueId, 100, 0, "uploading");
      }
      if (params.setSecondUpload) params.setSecondUpload();
      return { data: { msg: "秒传成功" } };
    }
  }

  // if (driveUploadByHash.offset) {
  //   console.log(
  //     "秒传失败,接口有返回offset",
  //     driveUploadByHash.offset,
  //     "将从这个开始上传"
  //   );
  //   startOffset = driveUploadByHash.offset;
  // }
  // 2. 秒传失败则调session
  // const { file } = params;

  const { multiClient } = useUserStore();
  if (!multiClient) return { err: Error(UPLOAD_MSG.err_noNknClient) };
  // console.log(
  //   "before-multiClient",
  //   multiClient.isClosed,
  //   multiClient.isReady
  // );
  console.time(`[性能 client.dial 时间]${params.file.name}`);
  // 多个任务的时候要限制dial 的时间?
  // const clientSession = await multiClient?.dial(REMOTE_ADDR);
  // 尝试重拨dial 的次数, 防止爆栈
  let dialTryTimes = 0;
  const maxDialTimes = 10;
  /** 如果是dial 超时就重新dial */
  const repeatlyClientDial = async (): Promise<TSession | null> => {
    let res;
    try {
      res = await multiClient.dial(REMOTE_ADDR, {
        dialTimeout: 10000, // 10s dial 过期
      });
      // 过期就重试
    } catch (error) {
      console.error(
        "clientDial:remoteAddr-error-dialTryTimes",
        REMOTE_ADDR,
        error,
        dialTryTimes
      );
      if (dialTryTimes < maxDialTimes) {
        dialTryTimes += 1;
        res = await repeatlyClientDial();
      } else {
        res = null;
      }
    }
    return res;
  };
  const clientSession = await sessionLimit(() => repeatlyClientDial());
  // console.log("after-client-shakehand");
  console.timeEnd(`[性能 client.dial 时间]${params.file.name}`);
  if (!clientSession) return { err: Error(UPLOAD_MSG.err_noClientSession) };
  console.log("session握手成功", clientSession);
  if (isCurrentUploadStatusPause()) {
    clientSession.close();
    return { err: Error(UPLOAD_MSG.err_pauseByUser) };
  }
  // console.log("写入头部信息");
  // 第一步，写入头部信息
  const encodedHeader: Uint8Array =
    params.action === "drive"
      ? encode({
          // File: "", // 需要传空字符串
          FileHash: params.fileHash,
          FullName: params.fullName,
          FileSize: params.file.size,
          UserId: params.userId,
          Space: params.space,
          Description: params.description,
          Action: params.action,
          // Offset: startOffset,
        })
      : encode({
          // 老的文件id
          UseFileId: params.toUpdateFileId,
          Space: params.space,
          UserId: params.userId,
          Action: params.action,
          FileSize: params.file.size,
          FileHash: params.fileHash,
        });
  if (params.action === "update") {
    console.log("更新文件的msgPack", {
      UseFileId: params.toUpdateFileId,
      Space: params.space,
      UserId: params.userId,
      Action: params.action,
      FileSize: params.file.size,
      FileHash: params.fileHash,
    });
  }
  // 拿 golang 来的offset
  ///
  // 假如offset 不一致 error 断开
  // console.log("encodedHeader", encodedHeader, encodedHeader.length);
  await writeHeaderInSession(clientSession, encodedHeader);
  const readOffsetFromMessage = () => {
    // console.time("[性能] 接收offset时间");
    return new Promise<number | null>((resolve) => {
      const timer = setTimeout(() => {
        // 相当于一个错误
        console.log("等待offset 信息超时");
        remove(
          multiClient.eventListeners.message,
          (v) => v === handleConfirmOffset
        );
        resolve(null);
      }, 60_000);
      const handleConfirmOffset = (msgObj: TMessageType) => {
        // hash 和 offset
        // console.log("msgObj", msgObj);
        const parsedMsg: { FileHash: string; Offset: number } = JSON.parse(
          msgObj.payload
        );
        console.log("收到offset消息推送", parsedMsg);
        startOffset = parsedMsg.Offset; // TODO check payload
        resolve(startOffset);
        // console.timeEnd("[性能] 接收offset时间");
        clearTimeout(timer);
        remove(
          multiClient.eventListeners.message,
          (v) => v === handleConfirmOffset
        );
      };
      multiClient.onMessage(handleConfirmOffset);
    });
  };
  const offsetRes = await readOffsetFromMessage();
  if (offsetRes === null) {
    console.log("等待offset超时,主动关闭这次session 并重试下一次");
    clientSession.close();
    await useDelay(2000);
    return await apiUploadSingle(params);
  }
  // await useDelay(100_000_000);
  if (isCurrentUploadStatusPause()) {
    clientSession.close();
    return { err: Error(UPLOAD_MSG.err_pauseByUser) };
  }
  // 第二步，发文件
  const fileBuffer = await params.file.arrayBuffer();
  // console.log("fileBuffer", fileBuffer);
  const maxSendLength = fileBuffer.byteLength;
  // 从前面标记的位置开始上传
  let startLen = startOffset;
  /** 已经发送的长度 */
  let hadSendLen = 0; // 已经发送的长度, 用来计算速度
  const startTime = dayjs();
  let diffSeconds = 0;
  let toSetBytesPerSecond = 0;
  const timerSpeed = window.setInterval(() => {
    if (!params.setProgressSpeedStatus) {
      clearInterval(timerSpeed);
      return;
    }
    // 设置速度过程中 session close
    if (clientSession.isClosed) {
      console.log("设置速度过程中 session close");
      clearInterval(timerSpeed);
      return;
    }
    // 设置速度过程中 用户手动暂停
    if (isCurrentUploadStatusPause()) {
      console.log("设置速度过程中 用户手动暂停");
      clearInterval(timerSpeed);
      return;
    }
    // 最大set 到90, 剩余的10 要等websocket 成功返回文件信息才设置!
    const toSetProgressVal = Math.floor((startLen / maxSendLength) * 100);
    if (toSetProgressVal < 98) {
      const curDiffSeconds = dayjs().diff(startTime, "second");
      if (curDiffSeconds > diffSeconds) {
        toSetBytesPerSecond = hadSendLen / dayjs().diff(startTime, "second");
        diffSeconds = curDiffSeconds;
      }
      params.setProgressSpeedStatus(
        uniqueId,
        toSetProgressVal,
        toSetBytesPerSecond,
        "uploading"
        // clientSession.isClosed || isCurrentUploadStatusPause()
        //   ? "pause"
        //   : "uploading"
      );
    } else {
      params.setProgressSpeedStatus(
        uniqueId,
        98,
        0,
        "waiting" // 等待ws 返回确认
      );
      clearInterval(timerSpeed);
    }
  }, 1000);

  try {
    while (startLen <= maxSendLength) {
      if (clientSession.isClosed) {
        // 1.如果是用户主动暂停
        if (isCurrentUploadStatusPause()) {
          return { err: Error(UPLOAD_MSG.err_pauseByUser) };
        } else {
          // 2.如果是未暂停但session closed,重试
          console.log("session被动close,自动重试");
          await useDelay(2000);
          return await apiUploadSingle(params);
          // return { err: Error(UPLOAD_MSG.err_sessionClosed) };
        }
      }
      if (isCurrentUploadStatusPause()) {
        clientSession.close();
        return { err: Error(UPLOAD_MSG.err_pauseByUser) };
      }
      const toWriteChunk = new Uint8Array(
        fileBuffer.slice(
          startLen,
          // 到结尾了吗 不然接续加max
          Math.min(startLen + MAX_MTU, maxSendLength)
        )
      );
      // console.log(
      //   "sessionIsClosed-正在传的chunk开始长度-总长度",
      //   clientSession.isClosed,
      //   startLen,
      //   // toWriteChunk
      //   maxSendLength
      // );
      await clientSession.write(toWriteChunk);
      // clientSession.close
      // .catch((e) => console.log("session-write-error", e));
      startLen += MAX_MTU;
      hadSendLen += MAX_MTU;
    }
    // console.log("escape while loop", startLen, maxSendLength);
    return { data: { msg: UPLOAD_MSG.success_sessionWrite } };
  } catch (err) {
    console.log("session被动close,自动重试", err); // session close
    await useDelay(2000);
    return apiUploadSingle(params);
    // return { err: err };
  }
};

type ParamsSecondUpload = {
  fullName: string[];
  fileHash: string;
  description: string;
};
type ResponseSecondUpload = {
  driveUploadByHash: {
    // id: "qDQt2b8Di1nZeDhN5cPWXE"
    id?: string;
    offset?: number;
  };
};
/** 秒传接口 */
export const apiSecondUpload = async (
  params: ParamsSecondUpload
): TApiRes<ResponseSecondUpload> => {
  try {
    const data = await useApollo<ResponseSecondUpload>({
      mode: "mutate",
      gql: NetFile_Basic.driveUploadByHash,
      variables: {
        hash: params.fileHash,
        fullName: params.fullName,
        description: params.description,
      },
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsBatchDelete = {
  ids: string[];
  space: "PRIVATE" | "PUBLIC";
};
type ResponseBatchDelete = {
  driveDeleteFiles: number; // 实际服务器删除的数量
};
/** 删除文件/文件夹 */
export const apiBatchDelete = async (
  params: ParamsBatchDelete
): TApiRes<ResponseBatchDelete> => {
  try {
    const data = await useApollo<ResponseBatchDelete>({
      mode: "mutate",
      gql: NetFile_Basic.driveDeleteFiles,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsSingleDelete = {
  id: string;
  space: "PRIVATE" | "PUBLIC";
};
type ResponseSingleDelete = {
  driveDeleteFile: number; // 实际服务器删除的数量
};
/** 删除单个文件/文件夹
 * 这个接口可以成功删除文件夹,批量的那个暂时不可以
 *  */
export const apiSingleDelete = async (
  params: ParamsSingleDelete
): TApiRes<ResponseSingleDelete> => {
  try {
    const data = await useApollo<ResponseSingleDelete>({
      mode: "mutate",
      gql: NetFile_Basic.driveDeleteFile,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ResponseGetPreviewToken = {
  drivePreviewToken: string;
};
/** 获取预览token */
export const apiGetPreviewToken =
  async (): TApiRes<ResponseGetPreviewToken> => {
    try {
      const data = await useApollo<ResponseGetPreviewToken>({
        mode: "mutate",
        gql: NetFile_Basic.drivePreviewToken,
      });
      return { data };
    } catch (err) {
      return { err };
    }
  };

type ParamsPriviewSharedFile = {
  uri: string;
};
type ResponsePriviewSharedFile = {
  drivePreviewShare: {
    needCode: boolean;
    expiredAt: string;
    insertedAt: string;
    updatedAt: string;
    userPreview: {
      avatar: string | null;
      bio: string;
      email: string;
      username: string;
    };
  };
};
/** 获取分享token */
export const apiPriviewSharedFile = async (
  params: ParamsPriviewSharedFile
): TApiRes<ResponsePriviewSharedFile> => {
  try {
    const data = await useApollo<ResponsePriviewSharedFile>({
      mode: "mutate",
      gql: NetFile_Share.drivePreviewShare,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsQuerySharedFile = {
  uri: string;
  code?: string;
};
type ResponseQuerySharedFile = {
  driveFindShare: QueryShareFileItem;
};
/** 获取分享token */
export const apiQuerySharedFile = async (
  params: ParamsQuerySharedFile
): TApiRes<ResponseQuerySharedFile> => {
  try {
    const data = await useApollo<ResponseQuerySharedFile>({
      mode: "mutate",
      gql: NetFile_Share.driveFindShare,
      variables: {
        uri: params.uri,
        code: params.code,
      },
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsMoveFileToDir = {
  fromId: string;
  toId: string;
  fromSpace: "PRIVATE" | "PUBLIC";
  toSpace: "PRIVATE" | "PUBLIC";
};
type ResponseMoveFileToDir = {
  driveMoveFile: number; // 移动的文件数
};
/** 移动文件 */
export const apiMoveFileToDir = async (
  params: ParamsMoveFileToDir
): TApiRes<ResponseMoveFileToDir> => {
  try {
    const data = await useApollo<ResponseMoveFileToDir>({
      mode: "mutate",
      gql: NetFile_Basic.driveMoveFile,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsCopyFileToDir = {
  fromId: string;
  toId: string;
};
type ResponseCopyFileToDir = {
  driveCopyFile: number; // 修改的文件数
};
/** 复制文件 */
export const apiCopyFileToDir = async (
  params: ParamsCopyFileToDir
): TApiRes<ResponseCopyFileToDir> => {
  try {
    const data = await useApollo<ResponseCopyFileToDir>({
      mode: "mutate",
      gql: NetFile_Basic.driveCopyFile,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsMakeDirByRoot = {
  fullName: string;
  description?: string;
};
type ResponseMakeDirByRoot = {
  driveMakeDir: {
    fullName: string[];
    isDir: boolean;
  };
};
/** 创建文件夹 */
export const apiMakeDirByRoot = async (
  params: ParamsMakeDirByRoot
): TApiRes<ResponseMakeDirByRoot> => {
  try {
    const data = await useApollo<ResponseMakeDirByRoot>({
      mode: "mutate",
      gql: NetFile_Basic.driveMakeDir,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsMakeDirByPath = {
  fullName: string;
  parentId: string;
  description?: string;
};
type ResponseMakeDirByPath = {
  driveMakeDirUnder: {
    fullName: string[];
    isDir: boolean;
  };
};
/** 在指定目录下创建文件夹 */
export const apiMakeDirByPath = async (
  params: ParamsMakeDirByPath
): TApiRes<ResponseMakeDirByPath> => {
  try {
    const data = await useApollo<ResponseMakeDirByPath>({
      mode: "mutate",
      gql: NetFile_Basic.driveMakeDirUnder,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsRename = {
  id: string;
  newName: string;
  space: "PRIVATE" | "PUBLIC";
};
type ResponseRename = {
  driveRenameFile: {
    id: string;
  };
};
/** 重命名文件/夹 */
export const apiRename = async (
  params: ParamsRename
): TApiRes<ResponseRename> => {
  try {
    const data = await useApollo<ResponseRename>({
      mode: "mutate",
      gql: NetFile_Basic.driveRenameFile,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsShareCreate = {
  code: string;
  userFileId: string;
  expiredAfterDays: number;
};
type ResponseShareCreate = {
  driveCreateShare: {
    code: string;
    token: string;
    uri: string;
    // code: "38px"
    // token: "lYB28i-jPO9QF30464PWng"
    // uri: "vkvgtGrbKeCZNtLokzgxpg"
  };
};
/** 分享文件 */
export const apiShareCreate = async (
  params: ParamsShareCreate
): TApiRes<ResponseShareCreate> => {
  try {
    const data = await useApollo<ResponseShareCreate>({
      mode: "mutate",
      gql: NetFile_Share.driveCreateShare,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

export type QueryShareFileItem = {
  code: string | null;
  collectedCount: number;
  expiredAt: string;
  id: string;
  insertedAt: string;
  isCollected: boolean;
  token: string;
  updatedAt: string;
  uri: string;
  userFile: TFileItem | null;
};

type ResponseQueryShareFile = {
  driveListShares: QueryShareFileItem[];
};
/** 获取分享文件列表 */
export const apiQueryShareFileList =
  async (): TApiRes<ResponseQueryShareFile> => {
    try {
      const data = await useApollo<ResponseQueryShareFile>({
        mode: "query",
        gql: NetFile_Share.driveListShares,
      });
      return { data };
    } catch (err) {
      return { err };
    }
  };

type ParamsDeleteShare = {
  id: string;
};
type ResponseDeleteShare = {
  driveDeleteShare: {
    id: string;
  };
};
/** 删除分享 */
export const apiDeleteShare = async (
  params: ParamsDeleteShare
): TApiRes<ResponseDeleteShare> => {
  try {
    const data = await useApollo<ResponseDeleteShare>({
      mode: "mutate",
      gql: NetFile_Share.driveDeleteShare,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsEditShare = {
  id: string;
  code: string;
  expiredAfterDays?: number;
};
type ResponseEditShare = {
  driveEditShare: {
    id: string;
  };
};
/** 编辑分享 */
export const apiEditShare = async (
  params: ParamsEditShare
): TApiRes<ResponseEditShare> => {
  try {
    const data = await useApollo<ResponseEditShare>({
      mode: "mutate",
      gql: NetFile_Share.driveEditShare,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type TPublishHistoryItem = {
  id: string;
  txid: string;
  version: number;
  userFile: TFileItem;
};

export type QueryPublishItem = {
  collectedCount: number;
  id: string;
  isCollected: boolean;
  current: TPublishHistoryItem;
  history: TPublishHistoryItem[];
};

type ResponseQueryPublishList = {
  driveListPublishs: QueryPublishItem[];
};
/** 查询发布列表 */
export const apiQueryPublishList =
  async (): TApiRes<ResponseQueryPublishList> => {
    try {
      const data = await useApollo<ResponseQueryPublishList>({
        mode: "query",
        gql: NetFile_Publish.driveListPublishs,
      });
      return { data };
    } catch (err) {
      return { err };
    }
  };

type ParamsPublishCreate = {
  userFileId: string;
};
type ResponsePublishCreate = {
  driveCreatePublish: {
    id: string;
  };
};
/** 发布新文件 */
export const apiPublishCreate = async (
  params: ParamsPublishCreate
): TApiRes<ResponsePublishCreate> => {
  try {
    const data = await useApollo<ResponsePublishCreate>({
      mode: "mutate",
      gql: NetFile_Publish.driveCreatePublish,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsPublishUpdate = {
  userFileId: string;
  id: string;
};
type ResponsePublishUpdate = {
  driveUpdatePublish: {
    id: string;
  };
};
/** 更新已发布id(文件) */
export const apiPublishUpdate = async (
  params: ParamsPublishUpdate
): TApiRes<ResponsePublishUpdate> => {
  try {
    const data = await useApollo<ResponsePublishUpdate>({
      mode: "mutate",
      gql: NetFile_Publish.driveUpdatePublish,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsPublishDelete = {
  id: string;
};
type ResponsePublishDelete = {
  driveDeletePublish: {
    id: string;
  };
};
/** 删除已发布id(文件) */
export const apiPublishDelete = async (
  params: ParamsPublishDelete
): TApiRes<ResponsePublishDelete> => {
  try {
    const data = await useApollo<ResponsePublishDelete>({
      mode: "mutate",
      gql: NetFile_Publish.driveDeletePublish,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsQueryCollectList = {
  type?: "NetFile_Share" | "NetFile_Publish";
};
export type QueryCollectItem = {
  id: string;
  info: {
    description: string | null;
  };
  string: string;
  updatedAt: string;
  item: QueryShareFileItem | QueryPublishItem;
};
type ResponseQueryCollectList = {
  driveListCollections: QueryCollectItem[];
};
/** 查询收藏列表 */
export const apiQueryCollectList = async (
  params: ParamsQueryCollectList
): TApiRes<ResponseQueryCollectList> => {
  try {
    const data = await useApollo<ResponseQueryCollectList>({
      mode: "query",
      gql: NetFile_Collection.driveListCollections,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsCollectCreateByShare = {
  id: string;
  desc?: string;
  code?: string;
};
type ResponseCollectCreateByShare = {
  driveCreateShareCollection: {
    id: string;
  };
};
/** 创建收藏by NetFile_Share */
export const apiCollectCreateByShare = async (
  params: ParamsCollectCreateByShare
): TApiRes<ResponseCollectCreateByShare> => {
  try {
    const data = await useApollo<ResponseCollectCreateByShare>({
      mode: "mutate",
      gql: NetFile_Collection.driveCreateShareCollection, // TODO 什么类型的创建
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsCollectCreateByPublish = {
  id: string;
  desc?: string;
};
type ResponseCollectCreateByPublish = {
  driveCreatePublishCollection: {
    id: string;
  };
};
/** 创建收藏by NetFile_Publish */
export const apiCollectCreateByPublish = async (
  params: ParamsCollectCreateByPublish
): TApiRes<ResponseCollectCreateByPublish> => {
  try {
    const data = await useApollo<ResponseCollectCreateByPublish>({
      mode: "mutate",
      gql: NetFile_Collection.driveCreatePublishCollection,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};

type ParamsCollectDelete = {
  id: string;
};
type ResponseCollectDelete = {
  driveDeleteCollection: {
    id: string;
  };
};
/** 删除已收藏 */
export const apiCollectDelete = async (
  params: ParamsCollectDelete
): TApiRes<ResponseCollectDelete> => {
  try {
    const data = await useApollo<ResponseCollectDelete>({
      mode: "mutate",
      gql: NetFile_Collection.driveDeleteCollection,
      variables: params,
    });
    return { data };
  } catch (err) {
    return { err };
  }
};
