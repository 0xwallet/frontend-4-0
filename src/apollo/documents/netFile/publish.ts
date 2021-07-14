import gql from "graphql-tag";

//发布文件列表
export const driveListPublishs = gql`
  query {
    driveListPublishs {
      collectedCount
      isCollected
      current {
        id
        txid
        userFile {
          fullName
          hash
          id
          isDir
          isShared
          insertedAt
          updatedAt
          space
          user {
            id
          }
          info {
            size
            description
          }
        }
        version
      }
      history {
        id
        txid
        version
        userFile {
          fullName
          hash
          id
          isDir
          isShared
          insertedAt
          updatedAt
          space
          user {
            id
          }
          info {
            size
            description
          }
        }
      }
      id
    }
  }
`;

// 发布文件
export const driveCreatePublish = gql`
  mutation ($userFileId: String!) {
    driveCreatePublish(userFileId: $userFileId) {
      id
    }
  }
`;

// 删除发布
export const driveDeletePublish = gql`
  mutation ($id: ID!) {
    driveDeletePublish(id: $id) {
      id
    }
  }
`;
// 发布文件改变版本
export const driveChangePublishVersion = gql`
  mutation ($id: ID!, $publishHistoryId: ID!) {
    driveChangePublishVersion(id: $id, publishHistoryId: $publishHistoryId) {
      id
    }
  }
`;

// 更新文件
export const driveUpdatePublish = gql`
  mutation ($userFileId: String!, $id: ID!) {
    driveUpdatePublish(userFileId: $userFileId, id: $id) {
      id
    }
  }
`;
//发布文件txid
export const driveFindPublish = gql`
  query ($txid: String!) {
    driveFindPublish(txid: $txid) {
      id
      current {
        id
        txid
        userFile {
          fullName
          hash
          id
          isDir
          isShared
          insertedAt
          updatedAt
          space
          user {
            id
          }
          info {
            size
            description
          }
        }
        version
      }
    }
  }
`;
