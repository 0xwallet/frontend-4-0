// apollo 相关逻辑
import { Modal } from "ant-design-vue";
import { provide, Ref } from "vue";
import { useUserStore } from "../store";

import {
  ApolloClient,
  ApolloQueryResult,
  DocumentNode,
  FetchResult,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { ApolloClients } from "@vue/apollo-composable";
import { ApolloLink, HttpLink } from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";

// import { getMainDefinition } from '@apollo/client/utilities';
// // @ts-ignore
import router from "@/router";
import { TSession } from "nkn";
import { LEN_OF_HEADER_U8_LENGTH } from "@/constants";

// 与 API 的 HTTP 连接
type TClient = ApolloClient<NormalizedCacheObject>;
let Client: TClient;

export function initApollo(): TClient | null {
  if (Client) return Client;
  const httpLink = new HttpLink({
    uri: "https://owaf.io/api",
  });

  // split based on operation type
  // REMOVE authLink FOR HTTPONLY_TOKEN
  const middlewareLink = new ApolloLink((operation, forward) => {
    if (forward === undefined) {
      return null;
    }
    // const token = localStorage.getItem("token");
    const token = useUserStore().token;
    operation.setContext({
      headers: {
        Authorization: token ? "Bearer " + token : "",
      },
    });
    return forward(operation);
  });
  const error = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.log("graphQLErrors", graphQLErrors);
      if (
        // 调试中发现 500 报错的返回是有detail 的
        typeof (graphQLErrors as unknown as { detail: string }).detail ===
        "string"
      ) {
        Modal.error({
          content: (graphQLErrors as unknown as { detail: string }).detail,
        });
      } else {
        graphQLErrors.map(({ message, locations, path }) => {
          switch (message) {
            case "Please sign in first!":
              // TODO 有没有授权已过期的情况?
              router.push({ name: "Login" });
              break;
            case "file hash not found":
              break;
            default:
              Modal.error({ content: message });
              console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
              );
          }
        });
      }
    }

    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  // 缓存实现
  const cache = new InMemoryCache();

  // 创建 apollo 客户端

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([middlewareLink, error, httpLink]),
    cache,
    connectToDevTools: true,
  });
  provide(ApolloClients, {
    default: apolloClient,
  });
  Client = apolloClient;

  return apolloClient;
}

/** 返回接口的 data 值 */
export function useApollo<T>(params: {
  mode: "query" | "mutate";
  gql: DocumentNode;
  variables?: {
    [key: string]: any;
  };
}) {
  // return new Promise<ApolloQueryResult<T> | FetchResult<T>>(
  return new Promise<T>((resolve, reject) => {
    const { mode, gql, variables } = params;
    if (!Client) initApollo();
    if (mode === "query") {
      Client.query({
        query: gql,
        variables,
        fetchPolicy: "network-only",
      }).then(({ data }) => {
        const d = data as unknown as T;
        resolve(d);
      }, reject);
    } else {
      Client.mutate({ mutation: gql, variables }).then(({ data }) => {
        const d = data as unknown as T;
        resolve(d);
      }, reject);
    }
  });
}
