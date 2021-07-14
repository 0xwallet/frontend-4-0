import gql from "graphql-tag";
//发布文件列表
export const driveListCollections = gql`
  query ($type: DriveCollectionType) {
    driveListCollections(type: $type) {
      id
      info {
        description
      }
      insertedAt
      updatedAt
      item {
        ... on DriveShare {
          id
          code
          uri
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
          expiredAt
        }

        ... on DrivePublish {
          id
          current {
            id
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
            txid
            version
          }
        }
      }
    }
  }
`;

export const driveCreatePublishCollection = gql`
  mutation ($id: ID!, $desc: String) {
    driveCreatePublishCollection(publishId: $id, description: $desc) {
      id
    }
  }
`;

export const driveCreateShareCollection = gql`
  mutation ($id: ID!, $desc: String, $code: String) {
    driveCreateShareCollection(shareId: $id, description: $desc, code: $code) {
      id
    }
  }
`;

export const driveDeleteCollection = gql`
  mutation ($id: ID!) {
    driveDeleteCollection(id: $id) {
      id
    }
  }
`;
