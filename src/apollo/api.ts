import { Session } from "../@types/apolloType";
import { encode } from "@msgpack/msgpack";
import { useUserStore } from "@/store";
import { getClientSession } from "./nknConfig";
import { useApollo } from "./action";
import {
  me,
  nknOnline,
  resetPassword,
  sendLoginCode,
  sendVerifyCode,
  signIn,
  signUp,
  Basic,
  Share,
} from "./document";
import { TSession } from "nkn";
import { MAX_MTU, REMOTE_ADDR } from "@/constants";
import { getFileSHA256 } from "@/utils";
import { chunk } from "lodash-es";
import pLimit from "p-limit";
import { useDelay } from "@/hooks";
//
export type CommonRes<T> = Promise<
  [res: T | undefined, err: Error | undefined]
>;
type TApiFn<T, R> = (params?: T) => CommonRes<R>;

// TAG : 封装一些 api
type ParamsEmailLogin = {
  email: string;
  password: string;
};
type ResponseEmailLogin = {
  data: {
    signin: Session;
  };
};

/** 邮箱登录 */
export const apiEmailLogin: TApiFn<ParamsEmailLogin, ResponseEmailLogin> =
  async (params) => {
    let res, err;
    try {
      res = await useApollo<ResponseEmailLogin>({
        mode: "mutate",
        gql: signIn,
        variables: {
          ...params,
          code: "", // TODO 原来的代码拷贝过来的 不知道为啥要空字符串
        },
      });
    } catch (error) {
      err = error;
    }
    return [res, err];
  };

type ResponseNknOnline = {
  data: {
    nknOnline: string;
  };
};
/** nkn 登录获取 */
export const apiNknOnline: TApiFn<undefined, ResponseNknOnline> = async () => {
  let res, err;
  try {
    const { wallet } = useUserStore();
    res = await useApollo<ResponseNknOnline>({
      mode: "mutate",
      gql: nknOnline,
      variables: { nknPublicKey: wallet?.getPublicKey() },
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsSendCaptcha = {
  email: string;
};
type ResponseSendCaptcha = {
  data: {
    sendLoginCode: string;
  };
};
/** 发送登录邮箱验证码 */
export const apiSendSignInEmailCaptcha: TApiFn<
  ParamsSendCaptcha,
  ResponseSendCaptcha
> = async (params) => {
  let res, err;
  try {
    res = await useApollo<ResponseSendCaptcha>({
      mode: "mutate",
      gql: sendLoginCode,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsSendSignUpEmailCaptcha = {
  email?: string;
  type: string;
  nkn?: string;
};
type ResponseSendSignUpEmailCaptcha = {
  data: {
    sendLoginCode: string;
  };
};
/** 发送注册邮箱验证码 */
export const apiSendSignUpEmailCaptcha: TApiFn<
  ParamsSendSignUpEmailCaptcha,
  ResponseSendSignUpEmailCaptcha
> = async (params = { type: "ACTIVE_EMAIL" }) => {
  let res, err;
  try {
    res = await useApollo<ResponseSendSignUpEmailCaptcha>({
      mode: "mutate",
      gql: sendVerifyCode,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsSignUp = {
  email: string;
  password: string;
  code: string;
  username: string;
  nknPublicKey: string;
};
type ResponseSignUp = {
  data: {
    msg: string;
  };
};
/** 用户注册 */
export const apiSignUp: TApiFn<ParamsSignUp, ResponseSignUp> = async (
  params
) => {
  let res, err;
  try {
    res = await useApollo<ResponseSignUp>({
      mode: "mutate",
      gql: signUp,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsResetPwd = {
  email: string;
  newPassword: string;
  code: string;
  nknPublicKey: string;
};
type ResponseResetPwd = {
  data: {
    msg: string;
  };
};
/** 用户重置密码 */
export const apiResetPwd: TApiFn<ParamsResetPwd, ResponseResetPwd> = async (
  params
) => {
  let res, err;
  try {
    res = await useApollo<ResponseResetPwd>({
      mode: "mutate",
      gql: resetPassword,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
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
export const apiQueryMe: TApiFn<undefined, ResponseQureyMe> = async () => {
  let res, err;
  try {
    res = await useApollo<ResponseQureyMe>({
      mode: "query",
      gql: me,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsQueryFileByDir = {
  dirId: string;
};
export type TFileItem = {
  fullName: string[];
  hash: null | string;
  id: string;
  info: { description: null | string; size: null };
  insertedAt: null | string;
  isDir: boolean;
  isShared: boolean;
  space: string;
  updatedAt: null | string;
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
  data: {
    driveListFiles: TFileList;
  };
  loading: boolean;
  networkStatus: number;
};
/** 网盘-查询我的文件 */
export const apiQueryFileByDir: TApiFn<
  ParamsQueryFileByDir,
  ResponseQueryFileByDir
> = async (params) => {
  let res, err;
  try {
    res = await useApollo<ResponseQueryFileByDir>({
      mode: "query",
      gql: Basic.FileList,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
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
  SetProgress?: (v: number) => void;
};
type ResponseUploadSingle = {
  data: string;
};
const limit = pLimit(1);
/** 上传单个文件 */
export const apiUploadSingle: TApiFn<ParamsUploadSingle, ResponseUploadSingle> =
  async (params) => {
    if (!params || !params.SourceFile) return [undefined, Error("noparams")];
    // 1. 先调秒传
    const [resSecondUpload, errSecondUpload] = await apiSecondUpload({
      SourceFile: params.SourceFile,
      FullName: params.FullName,
    });
    console.log("---先调秒传---", resSecondUpload);
    if (resSecondUpload) {
      // if (params.SetProgress) params.SetProgress(100); 秒传成功后父组件设置了
      return [
        // { data: `id is ${resSecondUpload.data.driveUploadByHash.id}` },
        { data: `秒传成功-${resSecondUpload.data.driveUploadByHash.id}` },
        undefined,
      ];
    }
    // 2. 秒传失败则调session
    // const { file } = params;

    // const clientSession = await getClientSession();
    const { multiClient } = useUserStore();
    if (!multiClient) return [undefined, Error("multiClient未初始化")];
    // console.log(
    //   "before-multiClient",
    //   multiClient.isClosed,
    //   multiClient.isReady
    // );
    console.time(`[性能 client.dial 时间]${params.SourceFile.name}`);
    // 多个任务的时候要限制dial 的时间?
    // const clientSession = await multiClient?.dial(REMOTE_ADDR);
    /** 如果是dial 超时就重新dial */
    const neverTimeOutClientDial = async (): Promise<TSession> => {
      let res;
      try {
        res = await multiClient.dial(REMOTE_ADDR, {
          dialTimeout: 3000, // 3s dial 过期
        });
        // 过期就重试
      } catch (error) {
        console.error("clientDial-error", error);
        // return neverTimeOutClientDial();
        // return neverTimeOutClientDial();
        res = await neverTimeOutClientDial();
      }
      return res;
    };
    const clientSession = await limit(() => neverTimeOutClientDial());
    // console.log("after-client-shakehand");
    console.timeEnd(`[性能 client.dial 时间]${params.SourceFile.name}`);
    if (!clientSession) return [undefined, Error("no clientSession")];
    // console.log("准备开始发长度");
    // 第一步，发长度，长度表示接下来的 msgpack 的长度
    const encoded: Uint8Array = encode({
      File: "", // 需要传空字符串
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
    try {
      while (startLen <= maxSendLength) {
        const toWriteChunk = new Uint8Array(
          fileBuffer.slice(
            startLen,
            // 到结尾了吗 不然接续加max
            Math.min(startLen + MAX_MTU, maxSendLength)
          )
        );
        // console.log("toWriteChunk", toWriteChunk);
        await clientSession.write(toWriteChunk);
        // .catch((e) => console.log("session-write-error", e));
        startLen += MAX_MTU;
        if (params.SetProgress) {
          // 最大set 到90, 剩余的10 要等websocket 成功返回文件信息才设置!
          const toSetProgressVal = Math.floor((startLen / maxSendLength) * 100);
          params.SetProgress(toSetProgressVal < 90 ? toSetProgressVal : 90);
        }
      }
      res = { data: "session成功写入" };
    } catch (error) {
      console.error(error);
      err = error;
    }
    return [res, err];
  };

type ParamsSecondUpload = {
  SourceFile: File;
  FullName: string[];
};
type ResponseSecondUpload = {
  data: {
    driveUploadByHash: {
      // id: "qDQt2b8Di1nZeDhN5cPWXE"
      id: string;
    };
  };
};
/** 秒传接口 */
export const apiSecondUpload: TApiFn<ParamsSecondUpload, ResponseSecondUpload> =
  async (params) => {
    if (!params) return [undefined, Error("noparams")];
    let res, err;
    try {
      // create hash
      const hash = await getFileSHA256(params.SourceFile);

      res = await useApollo<ResponseSecondUpload>({
        mode: "mutate",
        gql: Basic.Hash,
        variables: {
          hash,
          fullName: params.FullName,
        },
      });
    } catch (error) {
      err = error;
    }
    return [res, err];
  };

type ParamsBatchDelete = {
  ids: string[];
  space: "PRIVATE" | "PUBLIC";
};
type ResponseBatchDelete = {
  data: {
    driveDeleteFiles: number; // 实际服务器删除的数量
  };
};
/** 删除文件/文件夹 */
export const apiBatchDelete: TApiFn<ParamsBatchDelete, ResponseBatchDelete> =
  async (params) => {
    if (!params) return [undefined, Error("noparams")];
    let res, err;
    try {
      res = await useApollo<ResponseBatchDelete>({
        mode: "mutate",
        gql: Basic.DeleteFiles,
        variables: params,
      });
    } catch (error) {
      err = error;
    }
    return [res, err];
  };

type ParamsSingleDelete = {
  id: string;
  space: "PRIVATE" | "PUBLIC";
};
type ResponseSingleDelete = {
  data: {
    driveDeleteFile: number; // 实际服务器删除的数量
  };
};
/** 删除单个文件/文件夹
 * 这个接口可以成功删除文件夹,批量的那个暂时不可以
 *  */
export const apiSingleDelete: TApiFn<ParamsSingleDelete, ResponseSingleDelete> =
  async (params) => {
    if (!params) return [undefined, Error("noparams")];
    let res, err;
    try {
      res = await useApollo<ResponseSingleDelete>({
        mode: "mutate",
        gql: Basic.Delete,
        variables: params,
      });
    } catch (error) {
      err = error;
    }
    return [res, err];
  };

type ResponseGetPreviewToken = {
  data: {
    drivePreviewToken: string;
  };
};
/** 获取预览token */
export const apiGetPreviewToken: TApiFn<undefined, ResponseGetPreviewToken> =
  async () => {
    let res, err;
    try {
      res = await useApollo<ResponseGetPreviewToken>({
        mode: "mutate",
        gql: Basic.Token,
      });
    } catch (error) {
      err = error;
    }
    return [res, err];
  };

type ParamsGetShareToken = {
  uri: string;
  code: string;
};
type ResponseGetShareToken = {
  data: {
    driveFindShare: {
      token: string;
    };
  };
};
/** 获取分享token */
export const apiGetShareToken: TApiFn<
  ParamsGetShareToken,
  ResponseGetShareToken
> = async (params) => {
  if (!params) return [undefined, Error("noparams")];
  let res, err;
  try {
    res = await useApollo<ResponseGetShareToken>({
      mode: "mutate",
      gql: Share.Find,
      variables: {
        uri: params.uri,
        code: params.code,
      },
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsMoveFileToDir = {
  fromId: string;
  toId: string;
  fromSpace: "PRIVATE" | "PUBLIC";
  toSpace: "PRIVATE" | "PUBLIC";
};
type ResponseMoveFileToDir = {
  data: {
    driveMoveFile: number; // 移动的文件数
  };
};
/** 移动文件 */
export const apiMoveFileToDir: TApiFn<
  ParamsMoveFileToDir,
  ResponseMoveFileToDir
> = async (params) => {
  if (!params) return [undefined, Error("noparams")];
  let res, err;
  try {
    res = await useApollo<ResponseMoveFileToDir>({
      mode: "mutate",
      gql: Basic.Move,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsCopyFileToDir = {
  fromId: string;
  toId: string;
};
type ResponseCopyFileToDir = {
  data: {
    driveCopyFile: number; // 修改的文件数
  };
};
/** 复制文件 */
export const apiCopyFileToDir: TApiFn<
  ParamsCopyFileToDir,
  ResponseCopyFileToDir
> = async (params) => {
  if (!params) return [undefined, Error("noparams")];
  let res, err;
  try {
    res = await useApollo<ResponseCopyFileToDir>({
      mode: "mutate",
      gql: Basic.Copy,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsMakeDirByRoot = {
  fullName: string;
  description?: string;
};
type ResponseMakeDirByRoot = {
  data: {
    driveMakeDir: {
      fullName: string[];
      isDir: boolean;
    };
  };
};
/** 创建文件夹 */
export const apiMakeDirByRoot: TApiFn<
  ParamsMakeDirByRoot,
  ResponseMakeDirByRoot
> = async (params) => {
  if (!params) return [undefined, Error("noparams")];
  let res, err;
  try {
    res = await useApollo<ResponseMakeDirByRoot>({
      mode: "mutate",
      gql: Basic.MakeDir,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsMakeDirByPath = {
  fullName: string;
  parentId: string;
  description?: string;
};
type ResponseMakeDirByPath = {
  data: {
    driveMakeDirUnder: {
      fullName: string[];
      isDir: boolean;
    };
  };
};
/** 在指定目录下创建文件夹 */
export const apiMakeDirByPath: TApiFn<
  ParamsMakeDirByPath,
  ResponseMakeDirByPath
> = async (params) => {
  if (!params) return [undefined, Error("noparams")];
  let res, err;
  try {
    res = await useApollo<ResponseMakeDirByPath>({
      mode: "mutate",
      gql: Basic.MakeDirUnder,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsRename = {
  id: string;
  newName: string;
  space: "PRIVATE" | "PUBLIC";
};
type ResponseRename = {
  data: {
    driveRenameFile: {
      id: string;
    };
  };
};
/** 重命名文件/夹 */
export const apiRename: TApiFn<ParamsRename, ResponseRename> = async (
  params
) => {
  if (!params) return [undefined, Error("noparams")];
  let res, err;
  try {
    res = await useApollo<ResponseRename>({
      mode: "mutate",
      gql: Basic.Rename,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};
