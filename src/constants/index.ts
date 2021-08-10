export const PRODUCT_NAME = "0xWallet";
export const DEFAULT_LANG = "zh_CN";
export const QR_CODE_URL = "https://vvbin.cn/next/login";
export const REMOTE_ADDR =
  "file-jpgkdpid.5281e9f852705a509b748414148a9909a2e30ec860b3bf6ac0633c39d88613bf";
// export const MAX_UPLOAD_SIZE = 1024 * 1024 * 20; // 20 mb
// 2021-07-12 测试大文件上传,这里先写1G
export const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024; // 1 Gb
export const FILE_TYPE_MAP = {
  image: ["jpg", "jpeg", "gif", "png", "webp"],
  text: ["js", "md", "txt", "log"],
  archive: ["jar", "rar", "zip", "7z", "apk"],
  audio: ["mp3", "m4a", "flac"],
  video: ["mp4", "3gp", "avi", "wmv"],
};
/** 最大传输单元20kb */
export const MAX_MTU = 1024 * 20;
/** nkn multiclient 数量 */
export const NKN_SUB_CLIENT_COUNT = 4;
/** 表示 [header长度] 的uint8Array 的长度 */
export const LEN_OF_HEADER_U8_LENGTH = 4;
/** 最多打开的窗口数量 */
export const MAX_FILEITEM_COUNT = 100;
