import { ClassWallet, MultiClient } from "nkn";
import dayjs from "dayjs";
import { MAX_MTU, NKN_SUB_CLIENT_COUNT } from "@/constants";

const NKN_CONFIG = {
  worker: true,
  numSubClients: NKN_SUB_CLIENT_COUNT,
  // tls: true, // force https
  reconnectIntervalMin: 500, // 300ms 失败自动重连
  // msgHoldingSeconds: 3, // 等3秒, 等rpc 重莲?
  sessionConfig: { mtu: MAX_MTU, flushInterval: 10 }, // 最大传输单元 20kb
  // sessionConfig: { mtu: 1024, flushInterval: 10 }, // 最大传输单元 20kb
};

/** 返回 nkn MultiClient */
export function getMultiClient(wallet: ClassWallet) {
  return new MultiClient({
    seed: wallet.getSeed(),
    identifier: dayjs(),
    ...NKN_CONFIG,
  });
}
