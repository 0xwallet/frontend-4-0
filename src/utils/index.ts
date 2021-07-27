import SHA256 from "crypto-js/sha256";
import WordArray from "crypto-js/lib-typedarrays";
import { classMultiClient, TSession } from "nkn";
import { LEN_OF_HEADER_U8_LENGTH } from "@/constants";

/** 获取同类数组的最后一个元素 */
export function lastOfArray<T>(arr: T[]) {
  return arr[arr.length - 1];
}

/** 转换size 显示 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/** 计算文件的sha256 哈希值,跟后端算法一样 */
export async function getFileSHA256(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const wordArray = WordArray.create(data as unknown as number[]);
  return SHA256(wordArray).toString();
}

/** 根据isDir/ 文件名后缀返回文件类型 */
export function getFileType(obj: { isDir: boolean; fileName: string }): string {
  if (obj.isDir) return "folder";
  const arr = obj.fileName.split(".");
  if (arr.length <= 1) return "file";
  return arr.pop()?.toLowerCase() || "file";
}

/** 根据后端返回的fullName(未处理过的) 计算出所在位置 */
export function getFileLocation(fileFullName: string[]): string {
  // 556.jpg
  // dist 556.jpg
  const arr = fileFullName;
  if (arr.length === 1) return "~";
  return "~" + arr.join("/") + "/";
}

/** 根据分享文件的uri,code 拼接成分享链接,code可能是无或空字符串 */
export function getShareInfoByUriAndCode({
  uri,
  code,
  username,
  head,
  tail,
}: {
  uri: string;
  code: string;
  username: string;
  head: boolean;
  tail: boolean;
}): string {
  const url = `${window.location.href}?shareUri=${uri}`;
  const headText = head ? "链接: " : "";
  const isCodeEmpty = code.length === 0 || code === "无";
  const codeText = isCodeEmpty ? "" : ` 访问码: ${code}`;
  const tailText = tail ? `\n--来自0xWallet ${username}的分享` : "";
  const text = `${headText}${url}${codeText}${tailText}`;
  return text;
}

/** 返回重复dial 的闭包函数 */
export function getRepeatlyClientDialFn(
  client: classMultiClient,
  addr: string
): () => Promise<TSession | null> {
  let dialTryTimes = 0;
  const maxDialTimes = 10;
  const repeatlyClientDial = async (): Promise<TSession | null> => {
    let res;
    try {
      res = await client.dial(addr, { dialTimeout: 3000 });
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
}

/** 读取session 中的头部信息 */
export async function readHeaderInSession(session: TSession) {
  // 1 读取header 的长度
  const uint8ArrayOfHeaderLength = await session.read(LEN_OF_HEADER_U8_LENGTH);
  const dv = new DataView(uint8ArrayOfHeaderLength.buffer);
  const headerLength = dv.getUint32(0, true);
  // 2 读取header
  const header = await session.read(headerLength);
  return header;
}

/** 在session 中写入头部信息:1写入表示信息长度的固定buf, 2写入信息buf */
export async function writeHeaderInSession(
  session: TSession,
  header: Uint8Array
) {
  const bufOfHeaderlength = new ArrayBuffer(LEN_OF_HEADER_U8_LENGTH);
  const dv = new DataView(bufOfHeaderlength);
  dv.setUint32(0, header.length, true);
  // 1 写入header 的长度
  await session.write(new Uint8Array(bufOfHeaderlength));
  // 2 写入header
  await session.write(header);
}

/** 合并两个uint8array */
export function mergeUint8Array(head: Uint8Array, tail: Uint8Array) {
  const merged = new Uint8Array(head.length + tail.length);
  merged.set(head);
  merged.set(tail, head.length);
  return merged;
}

/** 通过blob 下载文件 */
export function downloadFileByBlob(blob: Blob, fileName: string) {
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    const url = window.URL.createObjectURL(blob);
    downloadFileByUrl(url, fileName);
  }
}

/** 通过url 创建a标签下载文件 */
export function downloadFileByUrl(
  url: string,
  fileName: string,
  target = "_blank"
) {
  const link = document.createElement("a");
  link.style.visibility = "hidden";
  // fireFox 要求el 在body中
  document.body.appendChild(link);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.setAttribute("target", target);
  link.click();
  link.remove();
}
