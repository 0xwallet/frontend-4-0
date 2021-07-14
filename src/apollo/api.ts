import { DriveUserSetting, Session } from "../@types/apolloType";
import { encode } from "@msgpack/msgpack";
import { useUserStore } from "@/store";
import { useApollo } from "./action";
import {
  User,
  NetFile_Basic,
  NetFile_Share,
  NetFile_Publish,
  NetFile_Collection,
} from "./documents";
import { TSession } from "nkn";
import { MAX_MTU, REMOTE_ADDR } from "@/constants";
import { getFileSHA256 } from "@/utils";
import pLimit from "p-limit";
import dayjs from "dayjs";

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
  signin: Session;
};

/** 邮箱登录 */
export const apiEmailLogin = async (
  params: ParamsEmailLogin
): TApiRes<ResponseEmailLogin> => {
  try {
    const data = await useApollo<ResponseEmailLogin>({
      mode: "mutate",
      gql: User.signIn,
      variables: params,
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

type ParamsQueryFileByDir = {
  dirId: string;
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

type ParamsUploadSingle = {
  // file: File;
  // File: Uint8Array;
  SourceFile?: File;
  File?: Uint8Array;
  FullName: string[];
  FileSize: number;
  UserId: string;
  Space: "PRIVATE" | "PUBLIC";
  Description: string;
  Action: "drive";
  SetProgress?: (percentNum: number, bytesPerSecond: number) => void;
};
type ResponseUploadSingle = {
  msg: string;
};
const limit = pLimit(1);
/** 上传单个文件 */
export const apiUploadSingle = async (
  params: ParamsUploadSingle
): TApiRes<ResponseUploadSingle> => {
  if (!params || !params.SourceFile) return { err: Error("noparams") };
  // 1. 先调秒传
  // const [resSecondUpload, errSecondUpload] = await apiSecondUpload({
  const resultSecondUpload = await apiSecondUpload({
    SourceFile: params.SourceFile,
    FullName: params.FullName,
    Description: params.Description,
  });
  console.log("---先调秒传---", resultSecondUpload.data);
  if (resultSecondUpload.data?.driveUploadByHash) {
    // if (params.SetProgress) params.SetProgress(100); 秒传成功后父组件设置了
    return { data: { msg: "秒传成功" } };
  }
  // 2. 秒传失败则调session
  // const { file } = params;

  // const clientSession = await getClientSession();
  const { multiClient } = useUserStore();
  if (!multiClient) return { err: Error("multiClient未初始化") };
  // console.log(
  //   "before-multiClient",
  //   multiClient.isClosed,
  //   multiClient.isReady
  // );
  console.time(`[性能 client.dial 时间]${params.SourceFile.name}`);
  // 多个任务的时候要限制dial 的时间?
  // const clientSession = await multiClient?.dial(REMOTE_ADDR);
  // 尝试重拨dial 的次数, 防止爆栈
  let dialTryTimes = 0;
  const maxDialTimes = 10;
  /** 如果是dial 超时就重新dial */
  const neverTimeOutClientDial = async (): Promise<TSession | null> => {
    let res;
    try {
      res = await multiClient.dial(REMOTE_ADDR, {
        dialTimeout: 3000, // 3s dial 过期
      });
      // 过期就重试
    } catch (error) {
      console.error("clientDial-error-dialTryTimes", error, dialTryTimes);
      if (dialTryTimes < maxDialTimes) {
        dialTryTimes += 1;
        res = await neverTimeOutClientDial();
      } else {
        res = null;
      }
    }
    return res;
  };
  const clientSession = await limit(() => neverTimeOutClientDial());
  // console.log("after-client-shakehand");
  console.timeEnd(`[性能 client.dial 时间]${params.SourceFile.name}`);
  if (!clientSession) return { err: Error("no clientSession") };
  // console.log("准备开始发长度");
  // 第一步，发长度，长度表示接下来的 msgpack 的长度
  const encoded: Uint8Array = encode({
    // File: "", // 需要传空字符串
    FullName: params.FullName,
    FileSize: params.FileSize,
    UserId: params.UserId,
    Space: params.Space,
    Description: params.Description,
    Action: params.Action,
  });
  const buffer = new ArrayBuffer(4);
  const dv = new DataView(buffer);
  dv.setUint32(0, encoded.length, true);
  await clientSession.write(new Uint8Array(buffer));
  // 第二步，发 msgpack
  await clientSession.write(encoded);
  // 第三步，发文件
  const fileBuffer = await params.SourceFile.arrayBuffer();
  // console.log("fileBuffer", fileBuffer);
  const maxSendLength = fileBuffer.byteLength;
  let startLen = 0;
  let res, err;
  const startTime = dayjs();
  let diffSeconds = 0;
  let toSetBytesPerSecond = 0;
  try {
    while (startLen <= maxSendLength) {
      const toWriteChunk = new Uint8Array(
        fileBuffer.slice(
          startLen,
          // 到结尾了吗 不然接续加max
          Math.min(startLen + MAX_MTU, maxSendLength)
        )
      );
      // console.log(
      //   "session-toWriteChunk",
      //   clientSession.isClosed,
      //   startLen,
      //   toWriteChunk
      // );
      await clientSession.write(toWriteChunk);
      // .catch((e) => console.log("session-write-error", e));
      startLen += MAX_MTU;
      if (params.SetProgress) {
        // 最大set 到90, 剩余的10 要等websocket 成功返回文件信息才设置!
        const toSetProgressVal = Math.floor((startLen / maxSendLength) * 100);
        const calcToSetBytesPerSecond = () => {
          const curDiffSeconds = dayjs().diff(startTime, "second");
          if (curDiffSeconds > diffSeconds) {
            toSetBytesPerSecond = startLen / dayjs().diff(startTime, "second");
            diffSeconds = curDiffSeconds;
          }
          return toSetBytesPerSecond;
        };
        params.SetProgress(
          toSetProgressVal < 90 ? toSetProgressVal : 90,
          toSetProgressVal < 90 ? calcToSetBytesPerSecond() : 0
        );
      }
    }
    // console.log("escape while loop", startLen, maxSendLength);
    return { data: { msg: "session成功写入" } };
  } catch (err) {
    console.error(err);
    return { err };
  }
};

type ParamsSecondUpload = {
  SourceFile: File;
  FullName: string[];
  Description: string;
};
type ResponseSecondUpload = {
  driveUploadByHash: {
    // id: "qDQt2b8Di1nZeDhN5cPWXE"
    id: string;
  };
};
/** 秒传接口 */
export const apiSecondUpload = async (
  params: ParamsSecondUpload
): TApiRes<ResponseSecondUpload> => {
  try {
    // create hash
    const hash = await getFileSHA256(params.SourceFile);

    const data = await useApollo<ResponseSecondUpload>({
      mode: "mutate",
      gql: NetFile_Basic.driveUploadByHash,
      variables: {
        hash,
        fullName: params.FullName,
        description: params.Description,
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

type ParamsGetShareToken = {
  uri: string;
  code: string;
};
type ResponseGetShareToken = {
  driveFindShare: {
    token: string;
  };
};
/** 获取分享token */
export const apiGetShareToken = async (
  params: ParamsGetShareToken
): TApiRes<ResponseGetShareToken> => {
  try {
    const data = await useApollo<ResponseGetShareToken>({
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
  code?: string;
  userFileId: string;
  day: number;
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
export const apiQueryShareFile = async (): TApiRes<ResponseQueryShareFile> => {
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
