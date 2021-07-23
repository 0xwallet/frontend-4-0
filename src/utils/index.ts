import SHA256 from "crypto-js/sha256";
import WordArray from "crypto-js/lib-typedarrays";

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
}: {
  uri: string;
  code: string;
  username?: string;
}): string {
  const isCodeEmpty = code.length === 0 || code === "无";
  const url = `${window.location.href}?shareUri=${uri}`;
  const codeText = isCodeEmpty ? "" : `访问码: ${code}`;
  const userInfo = username ? `\n--来自0xWallet ${username}的分享` : "";
  const text = `链接: ${url} ${codeText} ${userInfo}`;
  return text;
}
