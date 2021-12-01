import { ClassWallet, MultiClient } from "nkn";
import dayjs from "dayjs";
import { MAX_MTU, NKN_SUB_CLIENT_COUNT } from "@/constants";

const NKN_CONFIG = {
  worker: true,
  numSubClients: NKN_SUB_CLIENT_COUNT,
  tls: true, // force https // TODO 12-1日这个出错 https 获取ws节点的时候会报 internal error db service unavailable.
  reconnectIntervalMin: 10_000, // 10s 失败自动重连
  // msgHoldingSeconds: 3, // 等3秒, 等rpc 重莲?
  sessionConfig: { mtu: MAX_MTU, flushInterval: 10 }, // 最大传输单元 20kb
  // sessionConfig: { mtu: 1024, flushInterval: 10 }, // 最大传输单元 20kb
};

/** 返回 nkn MultiClient */
export const getMultiClient = (wallet: ClassWallet) => {
  return new MultiClient({
    seed: wallet.getSeed(),
    identifier: dayjs(),
    ...NKN_CONFIG,
  });
};

/** 返回匿名用户的 MultiClient */
export const getAnonymousMultiClient = () => {
  return new MultiClient({
    identifier: dayjs(),
    ...NKN_CONFIG,
  });
};
