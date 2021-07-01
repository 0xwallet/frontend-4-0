import SHA256 from "crypto-js/sha256";
import WordArray from "crypto-js/lib-typedarrays";
import { TFileItem } from "@/apollo/api";

export function hasOwn(
  obj: {
    [key: string]: any;
  },
  key: string
): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
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
export function getFileType(obj: TFileItem): string {
  if (obj.isDir) return "folder";
  const arr = obj.fullName[0].split(".");
  if (arr.length <= 1) return "file";
  return arr.pop()?.toLowerCase() || "file";
}
