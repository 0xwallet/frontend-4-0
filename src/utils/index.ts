import { classMultiClient, TSession } from "nkn";
import {
  FILE_TYPE_MAP,
  LEN_OF_HEADER_U8_LENGTH,
  PRODUCT_NAME,
  TAG_COLOR_LIST,
} from "@/constants";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";
dayjs.extend(duration);
/** 延迟函数,默认1000毫秒(1秒) */
export const useDelay = (t = 1000): Promise<void> => {
  return new Promise<void>((r) => setTimeout(r, t));
};
/** svg logo 白底图 */
export const useSvgWhiteLogo = (width = 22.1, height = 24.8): string => {
  return `<svg width="${width}" height="${height}"><path fill="#fff" d="M9.8 24.4l-8.6-4.9C.5 19.1 0 18.2 0 17.3V7.4c0-.9.5-1.7 1.3-2.2L9.9.3c.8-.4 1.7-.4 2.5 0L21 5.2c.8.4 1.3 1.3 1.3 2.2v9.9c0 .9-.5 1.7-1.3 2.2l-8.6 4.9c-.9.5-1.8.5-2.6 0z"/><circle fill="#423d3d" cx="11.06" cy="12.4" r="9"/><circle fill="#231f20" cx="11.06" cy="12.4" r="6"/><path stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" stroke-linejoin="round" d="M9.33 13.4l1.73-1 1.73 1m-1.73-1v-2"/><circle fill="#423d3d" cx="11.06" cy="12.4" r="2"/></svg>`;
};

/** 获取同类数组的最后一个元素 */
export const lastOfArray = <T>(arr: T[]) => arr[arr.length - 1];

/** 转换size 显示 */
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/** 计算文件的sha256 哈希值,跟后端算法一样 */
export const getFileSHA256 = async (file: File): Promise<string> => {
  const timeTag = `计算文件-${file.name}-hash时间`;
  console.time(timeTag);
  const data = await file.arrayBuffer();
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  console.timeEnd(timeTag);
  // console.log("hashHex", hashHex);
  return hashHex;
};

/** 缓存处理字符串的函数 */
export const cacheFn = <T>(fn: (source: string) => T) => {
  const cached: { [key: string]: T } = {};
  return (str: string) => (cached[str] ??= fn(str));
};

export type DescObj = {
  tagArr: string[];
  text: string;
};
/** 格式化描述信息,区分tag和普通文字 */
export const formatDescription = (sourceDesc: string | null): DescObj => {
  if (!sourceDesc) return { tagArr: [], text: "" };
  // maybe length = 0
  const tagArr = [...sourceDesc.matchAll(/#(.*?)#/g)].map((i) => i[1].trim());
  const text = sourceDesc.replace(/#(.*?)#/g, "");
  return { tagArr, text };
};
/** 缓存处理描述的函数 */
export const cacheFormatDescription = cacheFn(formatDescription);
/** 根据isDir/ 文件名后缀返回文件类型 */
export const getFileType = (obj: {
  isDir: boolean;
  fileName: string;
}): string => {
  if (obj.isDir) return "folder";
  const arr = obj.fileName.split(".");
  if (arr.length <= 1) return "file";
  return arr.pop()?.toLowerCase() || "file";
};

// TODO 英语
/** 获取文件通用的显示类型 */
export const getCommonFileType = (e: string) => {
  if (!e || e === "file") return "文件";
  if (/folder$/g.test(e)) return "文件夹";
  if (/\docx?$/g.test(e)) return "WORD文档";
  if (/xlsx?$/g.test(e)) return "EXCEL表格";
  if (/pdf$/g.test(e)) return "PDF文件";
  if (/ppt$/g.test(e)) return "PPT幻灯片";
  if (/psd$/g.test(e)) return "PSD文档";
  if (FILE_TYPE_MAP.image.includes(e)) return "图像";
  if (FILE_TYPE_MAP.text.includes(e)) return "文本";
  if (FILE_TYPE_MAP.archive.includes(e)) return "压缩文件";
  if (FILE_TYPE_MAP.audio.includes(e)) return "音频";
  if (FILE_TYPE_MAP.video.includes(e)) return "视频";
  else return "文件";
};

/** 根据后端返回的fullName(未处理过的) 计算出所在位置 */
export const getFileLocation = (fileFullName: string[]): string => {
  // 556.jpg
  // dist 556.jpg
  const arr = fileFullName;
  if (arr.length === 1) return "~";
  return "~/" + arr.join("/");
};

/** 根据分享文件的uri,code 拼接成分享链接,code可能是无或空字符串 */
export const getShareInfoByUriAndCode = ({
  uri,
  code,
  username,
  withHead,
  withCode,
  withTail,
}: {
  uri: string;
  code: string;
  username: string;
  withHead: boolean;
  withCode: boolean;
  withTail: boolean;
}): string => {
  const url = makeShareUrlByUri(uri);
  const headText = withHead ? "链接: " : "";
  const isCodeEmpty = code.length === 0 || code === "无";
  const codeText = isCodeEmpty ? "" : ` 访问码: ${code}`;
  const tailText = withTail ? `\n--来自${PRODUCT_NAME} ${username}的分享` : "";
  const text = `${headText}${url}${withCode ? codeText : ""}${tailText}`;
  return text;
};

/** 根据uri返回分享链接 */
export const makeShareUrlByUri = (uri: string) => {
  const sharedFilePath = "/#/metanet/sharedFile";
  return `${window.location.origin}${sharedFilePath}?uri=${uri}`;
};

/** 返回重复dial 的闭包函数 */
export const getRepeatlyClientDialFn = (
  client: classMultiClient,
  addr: string
): (() => Promise<TSession | null>) => {
  let dialTryTimes = 0;
  /** 最多重试次数 */
  const maxDialTimes = 100_000;
  const repeatlyClientDial = async (): Promise<TSession | null> => {
    let res;
    try {
      // 10s 过期
      res = await client.dial(addr, { dialTimeout: 10000 });
      // 过期就重试
    } catch (error) {
      console.error("clientDial-error-dialTryTimes", error, dialTryTimes);
      if (dialTryTimes < maxDialTimes) {
        dialTryTimes += 1;
        res = await repeatlyClientDial();
      } else {
        res = null;
      }
    }
    return res;
  };
  return repeatlyClientDial;
};

/** 读取session 中的头部信息 */
export const readHeaderInSession = async (session: TSession) => {
  // 1 读取header 的长度
  const uint8ArrayOfHeaderLength = await session.read(LEN_OF_HEADER_U8_LENGTH);
  const dv = new DataView(uint8ArrayOfHeaderLength.buffer);
  const headerLength = dv.getUint32(0, true);
  // 2 读取header
  const header = await session.read(headerLength);
  return header;
};

/** 在session 中写入头部信息:1写入表示信息长度的固定buf, 2写入信息buf */
export const writeHeaderInSession = async (
  session: TSession,
  header: Uint8Array
) => {
  const bufOfHeaderlength = new ArrayBuffer(LEN_OF_HEADER_U8_LENGTH);
  const dv = new DataView(bufOfHeaderlength);
  dv.setUint32(0, header.length, true);
  // 1 写入header 的长度
  await session.write(new Uint8Array(bufOfHeaderlength));
  // 2 写入header
  await session.write(header);
};

/** 合并两个uint8array */
export const mergeUint8Array = (head: Uint8Array, tail: Uint8Array) => {
  const merged = new Uint8Array(head.length + tail.length);
  merged.set(head);
  merged.set(tail, head.length);
  return merged;
};

/** 通过blob 下载文件 */
export const downloadFileByBlob = (blob: Blob, fileName: string) => {
  if ((window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, fileName);
  } else {
    const url = window.URL.createObjectURL(blob);
    downloadFileByUrl(url, fileName);
  }
};

/** 通过url 创建a标签下载文件 */
export const downloadFileByUrl = (
  url: string,
  fileName: string,
  target = "_blank"
) => {
  const link = document.createElement("a");
  link.style.visibility = "hidden";
  // fireFox 要求el 在body中
  document.body.appendChild(link);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.setAttribute("target", target);
  link.click();
  link.remove();
};

/** 创建n位数的随机数字字符串 */
export const getRandomNumStr = (n = 6): string => {
  const one = () => (Math.random() * 10) | 0;
  return Array(n)
    .fill(null)
    .map(() => one())
    .join("");
};

// https://stackoverflow.com/questions/9719570/generate-random-password-string-with-requirements-in-javascript/9719815
/** 创建随机的字母数字 */
export const getRandomNumAndStr = (n: 6): string => {
  return Math.random().toString(36).slice(-n);
};

/** 从文件应用路由中提取窗口id */
export const exactWindowId = (fileRoutePath: string) => {
  const match = /id=(\d*)&?/g.exec(fileRoutePath);
  if (!match) throw Error(`提取路由中的窗口id 失败${fileRoutePath}`);
  const id = match?.[1];
  return +id;
};

const uniqueIdCache: { [key: string]: string } = {};
/** 从路由fullPath中获取唯一的标识(带缓存) */
export const exactUniqueTabId = (fullPath: string) => {
  // 缓存编译结果
  if (uniqueIdCache[fullPath]) return uniqueIdCache[fullPath];
  // metanet/file?id=2&path=~
  // 1. 文件应用就用 windowId
  // 2. 分享后链接用 MetanetSharedFile
  // 3. 其他应用就用对应的 path
  if (fullPath.includes("peerTransfer")) {
    uniqueIdCache[fullPath] = "peerTransfer";
  } else if (fullPath.includes("metanet/file")) {
    uniqueIdCache[fullPath] = exactWindowId(fullPath).toString();
  } else if (fullPath.includes("metanet/sharedFile")) {
    uniqueIdCache[fullPath] = "MetanetSharedFile";
  } else {
    uniqueIdCache[fullPath] = fullPath;
  }
  return uniqueIdCache[fullPath];
};

// /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
/** 判断userAgent是否是移动端 */
export const isMobile = () =>
  !!navigator.userAgent.match(
    /(phone|pod|iPhone|iPod|ios|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );

/** 增加标签到head */
export const addHead = (tag: string, obj: { [key: string]: string }) => {
  // <!-- Chrome, Firefox OS and Opera -->
  // <meta name="theme-color" content="#4285f4">
  const meta = document.createElement(tag);
  // meta.setAttribute(key, val);
  Object.entries(obj).forEach(([key, val]) => {
    meta.setAttribute(key, val);
  });
  document.getElementsByTagName("head")[0].appendChild(meta);
};

type CheckWrapper = { isOk: boolean };
/** 超时检测, totalTime总超时时间, interVal检测间隔, 外部可控, 超时reject */
export const promiseChecker = (
  totalTime = 3000,
  interVal = 1000
): [Promise<void>, CheckWrapper] => {
  const wrapper = { isOk: false };
  const start = performance.now();
  const p = new Promise<void>((resolve, reject) => {
    const id = setInterval(() => {
      if (wrapper.isOk) {
        clearInterval(id);
        resolve();
      } else {
        if (performance.now() - start >= totalTime) {
          clearInterval(id);
          reject();
        } else {
          // 时间未到,继续run
        }
      }
    }, interVal);
  });
  return [p, wrapper];
};

let zIndex = 100000;
/** 全局Toast */
export const XToast = (msg = "default", size = 14, durationSecond = 2) => {
  let div: HTMLDivElement | null;
  div = document.createElement("div");
  div.style.position = "fixed";
  div.style.left = "50%";
  div.style.top = "50%";
  div.style.transform = "translate(-50%,-50%)";
  div.style.backgroundColor = "rgba(0,0,0,.8)";
  div.style.borderRadius = "4px";
  div.style.fontSize = `${size}px`;
  div.style.textAlign = "center";
  div.style.color = "#fff";
  div.style.padding = "10px 14px";
  div.style.zIndex = `${zIndex++}`;
  div.style.opacity = ".9";
  div.style.backfaceVisibility = "hidden";
  div.innerText = msg;
  document.body.appendChild(div);
  setTimeout(() => {
    div?.remove();
    div = null;
  }, durationSecond * 1000);
};

/** 倒计时,duration总时长,unitType总时长单位,interVal间隔,step间隔步长,format输出格式,interValFn间隔运行的函数 */
export const countDown = (
  duration: number,
  unitType: duration.DurationUnitType,
  interVal: number,
  step: number,
  format: string,
  onStep: (s: string) => void,
  onStop: () => void
) => {
  let total = duration;
  let timer: null | number;
  const outputCurRes = () =>
    onStep(dayjs.duration(total, unitType).format(format));
  outputCurRes();
  const stop = () => {
    onStop();
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  timer = window.setInterval(() => {
    total -= step;
    outputCurRes();
    if (total <= 0) {
      stop();
    }
  }, interVal);
  return stop;
};
/** 每秒倒计时 */
export const countDownSeconds = (
  totalSeconds: number,
  format: string,
  onStep: (s: string) => void,
  onStop: () => void
) => {
  return countDown(totalSeconds, "s", 1000, 1, format, onStep, onStop);
};
/** 处理原描述中的标签 */
export const transformRawDescription = (rawStr: string) => {
  let colorIdx = 0;
  const getColor = () => TAG_COLOR_LIST[colorIdx++];
  return rawStr.replace(
    /#(.+?)#/g,
    (m, p1) =>
      `<span class="markTag" style="background-color:${getColor()}">${p1}</span>`
  );
};

/** 获取预览图片 url */
export const makePreviewImgUrl = (
  token: string,
  userId: string,
  space: string,
  fileId: string,
  fileName: string,
  updateAt: string
) => {
  return `https://drive-s.owaf.io/preview/${userId}/${space.toLowerCase()}/${fileId}/${fileName}?token=${token}&t=${dayjs(
    updateAt
  ).format("YYYYMMDDHHmmss")}`;
};

/** 获取百分比数据 */
export const calcPercent = (val: number, total: number) => {
  return Math.floor((val / total) * 100);
};
