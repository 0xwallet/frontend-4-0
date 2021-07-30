import gql from "graphql-tag";

//分享文件列表
export const driveListShares = gql`
  query {
    driveListShares {
      code
      id
      token
      uri
      expiredAt
      collectedCount
      isCollected
      insertedAt
      updatedAt
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
  }
`;

//获取分享文件信息
export const driveFindShare = gql`
  query ($uri: String!, $code: String) {
    driveFindShare(uri: $uri, code: $code) {
      code
      id
      token
      uri
      insertedAt
      expiredAt
      collectedCount
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
      # user {
      #   id
      # }
    }
  }
`;

// 预览分享文件
export const drivePreviewShare = gql`
  query ($uri: String!) {
    drivePreviewShare(uri: $uri) {
      needCode
      expiredAt
      insertedAt
      updatedAt
      userPreview {
        avatar
        bio
        email
        username
      }
    }
  }
`;

// 分享文件
export const driveCreateShare = gql`
  mutation ($code: String, $userFileId: String!, $expiredAfterDays: Int) {
    driveCreateShare(
      userFileId: $userFileId
      code: $code
      expiredAfterDays: $expiredAfterDays
    ) {
      uri
      token
      code
    }
  }
`;

// 删除分享文件
export const driveDeleteShare = gql`
  mutation ($id: ID!) {
    driveDeleteShare(id: $id) {
      id
    }
  }
`;

// 编辑分享文件
export const driveEditShare = gql`
  mutation ($id: ID!, $code: String, $expiredAfterDays: Int) {
    driveEditShare(id: $id, expiredAfterDays: $expiredAfterDays, code: $code) {
      id
    }
  }
`;
