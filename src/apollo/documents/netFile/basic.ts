import gql from "graphql-tag";

/** 文件列表 */
export const driveListFiles = gql`
  query ($dirId: String, $fullName: [String], $token: String) {
    driveListFiles(dirId: $dirId, dirFullName: $fullName, token: $token) {
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
        driveSetting {
          availableSpace
          totalSpace
          usedSpace
        }
      }
      info {
        size
        description
      }
    }
  }
`;

export const driveSearch = gql`
  query ($keywords: String!, $space: DriveSpace) {
    driveSearch(keywords: $keywords, space: $space) {
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
        driveSetting {
          availableSpace
          totalSpace
          usedSpace
        }
      }
      info {
        size
        description
      }
    }
  }
`;

export const driveDirSize = gql`
  query ($dirId: String!) {
    driveDirSize(dirId: $dirId)
  }
`;
/** 新建目录 */
export const driveMakeDir = gql`
  mutation ($fullName: [String]!, $description: String) {
    driveMakeDir(fullName: $fullName, description: $description) {
      isDir
      fullName
    }
  }
`;

/** 指定目录下新建目录 */
export const driveMakeDirUnder = gql`
  mutation ($fullName: String!, $parentId: String!, $description: String) {
    driveMakeDirUnder(
      name: $fullName
      parentId: $parentId
      description: $description
    ) {
      isDir
      fullName
    }
  }
`;

/** 移动文件到指定ID */
export const driveMoveFile = gql`
  mutation (
    $fromId: String!
    $fromSpace: DriveSpace!
    $toId: String!
    $toSpace: DriveSpace!
  ) {
    driveMoveFile(
      fromId: $fromId
      fromSpace: $fromSpace
      toId: $toId
      toSpace: $toSpace
    )
  }
`;

/** 删除文件 */
export const driveDeleteFile = gql`
  mutation ($id: String!, $space: DriveSpace!) {
    driveDeleteFile(id: $id, space: $space)
  }
`;

/** 批量删除文件 */
export const driveDeleteFiles = gql`
  mutation ($ids: [String]!, $space: DriveSpace!) {
    driveDeleteFiles(ids: $ids, space: $space)
  }
`;

/** 根据hash秒传 */
export const driveUploadByHash = gql`
  mutation ($fullName: [String]!, $hash: String!, $description: String) {
    driveUploadByHash(
      fullName: $fullName
      hash: $hash
      description: $description
    ) {
      id
    }
  }
`;
/** 获取预览token */
export const drivePreviewToken = gql`
  mutation {
    drivePreviewToken
  }
`;

/** 编辑文件desc */
export const driveEditDescription = gql`
  mutation ($description: String!, $userFileId: String!) {
    driveEditDescription(description: $description, userFileId: $userFileId) {
      info {
        description
      }
    }
  }
`;
/** 重命名 */
export const driveRenameFile = gql`
  mutation ($id: String!, $newName: String!, $space: DriveSpace!) {
    driveRenameFile(id: $id, newName: $newName, space: $space) {
      id
    }
  }
`;
/** 复制文件 */
export const driveCopyFile = gql`
  mutation ($fromId: String!, $toId: String!) {
    driveCopyFile(fromId: $fromId, toId: $toId)
  }
`;

/** 复制文件 */
export const driveFileUploaded = gql`
  subscription ($userId: ID!) {
    driveFileUploaded(userId: $userId) {
      id
    }
  }
`;
/** 可用空间 */
export const queryMeSpace = gql`
  query {
    me {
      driveSetting {
        availableSpace
        totalSpace
        usedSpace
      }
    }
  }
`;
/** 个人头像 */
export const queryMeAvatar = gql`
  query {
    me {
      avatar
    }
  }
`;

// export export const Basic = {
//   FileList: driveListFiles,
//   Search: driveSearch,
//   MakeDir: driveMakeDir,
//   MakeDirUnder: driveMakeDirUnder,
//   Move: driveMoveFile,
//   Delete: driveDeleteFile,
//   DeleteFiles: driveDeleteFiles,
//   Hash: driveUploadByHash,
//   Token: drivePreviewToken,
//   Desc: driveEditDescription,
//   Rename: driveRenameFile,
//   Copy: driveCopyFile,
//   DirSize: driveDirSize,
//   Uploaded: driveFileUploaded,
//   QueryMeSpace: queryMeSpace,
// };

// export default {
//   driveListFiles,
//   driveSearch,
//   driveMakeDir,
//   driveMakeDirUnder,
//   driveMoveFile,
//   driveDeleteFile,
//   driveDeleteFiles,
//   driveUploadByHash,
//   drivePreviewToken,
//   driveEditDescription,
//   driveRenameFile,
//   driveCopyFile,
//   driveDirSize,
//   driveFileUploaded,
//   queryMeSpace,
// };
