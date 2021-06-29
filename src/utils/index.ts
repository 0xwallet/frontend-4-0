import SHA256 from "crypto-js/sha256";
import WordArray from "crypto-js/lib-typedarrays";

export function hasOwn(
  obj: {
    [key: string]: any;
  },
  key: string
): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function getFileSHA256(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const wordArray = WordArray.create(data as unknown as number[]);
  return SHA256(wordArray).toString();
}
