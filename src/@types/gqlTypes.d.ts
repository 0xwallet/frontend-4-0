export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `Json` scalar type represents arbitrary json string data, represented as UTF-8
   * character sequences. The Json type is most often used to represent a free-form
   * human-readable json string.
   */
  Json: any;
  /**
   * The `Naive DateTime` scalar type represents a naive date and time without
   * timezone. The DateTime appears in a JSON response as an ISO8601 formatted
   * string.
   */
  NaiveDateTime: any;
  /**
   * `Snowflake` type represents a 64 bit number, appears in JSON responses as a
   * UTF-8 String due to Javascript's lack of support for numbers > 53-bits.
   * Its parsed again to an integer after received.
   */
  Snowflake: any;
};

export type BsvBalance = {
  __typename?: 'BsvBalance';
  satoshis?: Maybe<Scalars['Int']>;
  satoshisAsString?: Maybe<Scalars['String']>;
};

export type Channel = {
  __typename?: 'Channel';
  id: Scalars['ID'];
  name: Scalars['String'];
  organization?: Maybe<Organization>;
  /** 1 public, 2 private */
  type?: Maybe<Visible>;
  users?: Maybe<Array<Maybe<User>>>;
};

export type CreditCard = {
  __typename?: 'CreditCard';
  month?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  securityCode?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
};

/** credit card info input */
export type CreditCardInput = {
  month?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  securityCode?: Maybe<Scalars['String']>;
  year?: Maybe<Scalars['String']>;
};

/** ISO 4217 */
export enum Currency {
  Cny = 'CNY',
  Usd = 'USD'
}

export type DriveCollection = {
  __typename?: 'DriveCollection';
  id?: Maybe<Scalars['ID']>;
  info?: Maybe<DriveCollectionInfo>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  item?: Maybe<DriveCollectionItem>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
};

export type DriveCollectionInfo = {
  __typename?: 'DriveCollectionInfo';
  description?: Maybe<Scalars['String']>;
};

/** which type can be collection by drive_collections */
export type DriveCollectionItem = DrivePublish | DriveShare;

export enum DriveCollectionType {
  Share = 'SHARE',
  Publish = 'PUBLISH',
  All = 'ALL'
}

export type DrivePublish = {
  __typename?: 'DrivePublish';
  collectedCount?: Maybe<Scalars['Int']>;
  /** current version of history */
  current?: Maybe<DrivePublishHistory>;
  history?: Maybe<Array<Maybe<DrivePublishHistory>>>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  isCollected?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
  user?: Maybe<User>;
};

export type DrivePublishHistory = {
  __typename?: 'DrivePublishHistory';
  id?: Maybe<Scalars['ID']>;
  /** belongs to which publish */
  publish?: Maybe<DrivePublish>;
  txid?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  userFile?: Maybe<DriveUserFile>;
  version?: Maybe<Scalars['Int']>;
};

export type DriveShare = {
  __typename?: 'DriveShare';
  code?: Maybe<Scalars['String']>;
  collectedCount?: Maybe<Scalars['Int']>;
  expiredAt?: Maybe<Scalars['NaiveDateTime']>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  isCollected?: Maybe<Scalars['Boolean']>;
  token?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
  uri?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  userFile?: Maybe<DriveUserFile>;
};

export type DriveSharePreview = {
  __typename?: 'DriveSharePreview';
  expiredAt?: Maybe<Scalars['NaiveDateTime']>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  needCode?: Maybe<Scalars['Boolean']>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
  userPreview?: Maybe<UserPreview>;
};

export enum DriveSpace {
  Metanet = 'METANET',
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type DriveUserFile = {
  __typename?: 'DriveUserFile';
  fullName?: Maybe<Array<Maybe<Scalars['String']>>>;
  hash?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  info?: Maybe<DriveUserFileInfo>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  isDir?: Maybe<Scalars['Boolean']>;
  isShared?: Maybe<Scalars['Boolean']>;
  space?: Maybe<DriveSpace>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
  user?: Maybe<User>;
};

export type DriveUserFileInfo = {
  __typename?: 'DriveUserFileInfo';
  description?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['String']>;
};

export type DriveUserSetting = {
  __typename?: 'DriveUserSetting';
  availableSpace?: Maybe<Scalars['String']>;
  totalSpace?: Maybe<Scalars['String']>;
  usedSpace?: Maybe<Scalars['String']>;
};

export type Email = {
  __typename?: 'Email';
  address?: Maybe<Scalars['String']>;
  status?: Maybe<EmailStatus>;
  tag?: Maybe<EmailTag>;
  user?: Maybe<User>;
};

export enum EmailStatus {
  Inactivated = 'INACTIVATED',
  Activated = 'ACTIVATED'
}

export enum EmailTag {
  DefaultEmail = 'DEFAULT_EMAIL'
}

/** user or channel */
export type ImContact = Channel | User;

/** user or channel */
export enum ImContactType {
  User = 'USER',
  Channel = 'CHANNEL'
}

export type ImMessage = {
  __typename?: 'ImMessage';
  body?: Maybe<Scalars['Json']>;
  fromContact?: Maybe<ImContact>;
  id?: Maybe<Scalars['Snowflake']>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  session?: Maybe<ImUserSession>;
  toContact?: Maybe<ImContact>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
};

export type ImSessionReadPosition = {
  __typename?: 'ImSessionReadPosition';
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  messageId?: Maybe<Scalars['Snowflake']>;
  sessionId?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
  user?: Maybe<User>;
};

export type ImUserSession = {
  __typename?: 'ImUserSession';
  contact?: Maybe<ImContact>;
  id?: Maybe<Scalars['ID']>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  lastMessage?: Maybe<ImMessage>;
  otherSideReadPosition?: Maybe<Scalars['Snowflake']>;
  selfReadPosition?: Maybe<Scalars['Snowflake']>;
  sessionId?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
};

export enum InvitationAction {
  Agree = 'AGREE',
  Delete = 'DELETE',
  Reject = 'REJECT'
}

export enum InvitationStatus {
  Waiting = 'WAITING',
  Agreed = 'AGREED',
  Rejected = 'REJECTED',
  Deleted = 'DELETED'
}


/** kanban column */
export type KanbanColumn = {
  __typename?: 'KanbanColumn';
  id: Scalars['ID'];
  items?: Maybe<Array<Maybe<KanbanItem>>>;
  name: Scalars['String'];
  organization?: Maybe<Organization>;
  position: Scalars['Int'];
};

/** kanban item */
export type KanbanItem = {
  __typename?: 'KanbanItem';
  column?: Maybe<KanbanColumn>;
  id: Scalars['ID'];
  info?: Maybe<KanbanItemInfo>;
  insertedAt: Scalars['NaiveDateTime'];
  organization?: Maybe<Organization>;
  position: Scalars['Int'];
  updatedAt: Scalars['NaiveDateTime'];
};

/** task or share */
export type KanbanItemInfo = Share | Task;


export type Organization = {
  __typename?: 'Organization';
  channels?: Maybe<Array<Maybe<Channel>>>;
  id: Scalars['ID'];
  info?: Maybe<OrganizationInfo>;
  kanbanColumns?: Maybe<Array<Maybe<KanbanColumn>>>;
  name: Scalars['String'];
  users?: Maybe<Array<Maybe<User>>>;
};


export type OrganizationChannelsArgs = {
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};

/** Organization info */
export type OrganizationInfo = {
  __typename?: 'OrganizationInfo';
  country?: Maybe<Scalars['String']>;
};

/** Organization info */
export type OrganizationInfoInput = {
  country?: Maybe<Scalars['String']>;
};

export type OrganizationInvitation = {
  __typename?: 'OrganizationInvitation';
  id: Scalars['ID'];
  message: Scalars['String'];
  organization?: Maybe<Organization>;
  status: InvitationStatus;
  user?: Maybe<User>;
};

export type OrganizationPages = {
  __typename?: 'OrganizationPages';
  pageCount?: Maybe<Scalars['Int']>;
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
  results?: Maybe<Array<Maybe<Organization>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PaymentIncome = {
  __typename?: 'PaymentIncome';
  address?: Maybe<Scalars['String']>;
  n?: Maybe<Scalars['String']>;
  txid?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type PersonalInfo = {
  __typename?: 'PersonalInfo';
  country?: Maybe<Scalars['String']>;
  creditCard?: Maybe<CreditCard>;
  passport?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
};

/** Personal info input */
export type PersonalInfoInput = {
  country?: Maybe<Scalars['String']>;
  creditCard?: Maybe<CreditCardInput>;
  passport?: Maybe<Scalars['String']>;
};

export enum Role {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Owner = 'OWNER'
}

export type RootMutationType = {
  __typename?: 'RootMutationType';
  /** Activate email */
  activateEmail?: Maybe<Email>;
  /** create nkn secure device */
  bindNknSecurityDevice?: Maybe<Wallet>;
  /** Create a channel in organization. */
  createChannel?: Maybe<Channel>;
  /** Add user to channel. */
  createChannelMember?: Maybe<User>;
  /** Create Kanban column */
  createKanbanColumn?: Maybe<KanbanColumn>;
  /** Create task at Kanban column */
  createKanbanTask?: Maybe<KanbanItem>;
  /** Create a organization for current user. */
  createOrganization?: Maybe<Organization>;
  /** Delete a channel. */
  deleteChannel?: Maybe<Channel>;
  /** Delete Kanban column */
  deleteKanbanColumn?: Maybe<KanbanColumn>;
  /** Delete a organization. */
  deleteOrganization?: Maybe<Organization>;
  /** Delete a wallet */
  deleteWallet?: Maybe<Wallet>;
  /** change current version of publish. */
  driveChangePublishVersion?: Maybe<DrivePublish>;
  /** copy file(s) by id, return the actual number of copied files. */
  driveCopyFile?: Maybe<Scalars['Int']>;
  /** publish user file */
  driveCreatePublish?: Maybe<DrivePublish>;
  /** put publish to my collections */
  driveCreatePublishCollection?: Maybe<DriveCollection>;
  /** share user file */
  driveCreateShare?: Maybe<DriveShare>;
  /** put share to my collections */
  driveCreateShareCollection?: Maybe<DriveCollection>;
  /** delete collection */
  driveDeleteCollection?: Maybe<DriveCollection>;
  /** delete file by id, return the actual number of deleted files. */
  driveDeleteFile?: Maybe<Scalars['Int']>;
  /** delete file by ids, return the actual number of deleted files. */
  driveDeleteFiles?: Maybe<Scalars['Int']>;
  /** delete publish file. */
  driveDeletePublish?: Maybe<DrivePublish>;
  /** delete shared file. */
  driveDeleteShare?: Maybe<DriveShare>;
  /** edit collection's description */
  driveEditCollectionDescription?: Maybe<DriveCollection>;
  /** edit user file description */
  driveEditDescription?: Maybe<DriveUserFile>;
  /** edit share info */
  driveEditShare?: Maybe<DriveShare>;
  /** make dir by full name */
  driveMakeDir?: Maybe<DriveUserFile>;
  /** make dir by parent dir id */
  driveMakeDirUnder?: Maybe<DriveUserFile>;
  /** move file(s) by id, return the actual number of moved files. */
  driveMoveFile?: Maybe<Scalars['Int']>;
  /** Generate preview token. */
  drivePreviewToken?: Maybe<Scalars['String']>;
  /** rename file by id */
  driveRenameFile?: Maybe<DriveUserFile>;
  /** update publish */
  driveUpdatePublish?: Maybe<DrivePublish>;
  /** upload file by exist hash */
  driveUploadByHash?: Maybe<DriveUserFile>;
  /** Edit current user */
  editCurrentUser?: Maybe<User>;
  /** Edit current user settings */
  editCurrentUserSetting?: Maybe<Setting>;
  /** Edit a organization */
  editOrganization?: Maybe<Organization>;
  /** deal with organization's invitation */
  editOrganizationInvitation?: Maybe<OrganizationInvitation>;
  /** delete user session */
  imDeleteUserSession?: Maybe<ImUserSession>;
  /** Set message as read status */
  imHaveRead?: Maybe<ImSessionReadPosition>;
  /** Send message */
  imSendMessage?: Maybe<ImMessage>;
  /** Inviting a user to join an organization */
  inviteUserToOrganization?: Maybe<User>;
  /** Move a kanban column */
  moveKanbanColumn?: Maybe<KanbanColumn>;
  /** Move a kanban item */
  moveKanbanItem?: Maybe<KanbanItem>;
  /** delete old nkn public key */
  nknLogout?: Maybe<Wallet>;
  /** regist nkn public key and record active time */
  nknOnline?: Maybe<Wallet>;
  /** Reset user's password */
  resetPassword?: Maybe<Session>;
  /** Add current user to channel. */
  selfJoinChannel?: Maybe<User>;
  /** Send login code to user's nkn security device, return nkn address */
  sendLoginCode?: Maybe<Scalars['String']>;
  /** Send verify code to email or nkn security device */
  sendVerifyCode?: Maybe<Scalars['String']>;
  /** Set user as channel admin. */
  setChannelAdmin?: Maybe<User>;
  /** Set user as organization admin. */
  setOrganizationAdmin?: Maybe<User>;
  /** Sign in a user */
  signin?: Maybe<Session>;
  /** Create a user account */
  signup?: Maybe<Session>;
  /** Unset user as channel admin. */
  unsetChannelAdmin?: Maybe<User>;
  /** Unset user as organization admin. */
  unsetOrganizationAdmin?: Maybe<User>;
};


export type RootMutationTypeActivateEmailArgs = {
  code?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
};


export type RootMutationTypeBindNknSecurityDeviceArgs = {
  code: Scalars['String'];
  nknPublicKey: Scalars['String'];
  password: Scalars['String'];
};


export type RootMutationTypeCreateChannelArgs = {
  name: Scalars['String'];
  organizationId: Scalars['ID'];
  type: Visible;
};


export type RootMutationTypeCreateChannelMemberArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeCreateKanbanColumnArgs = {
  name: Scalars['String'];
  organizationId: Scalars['ID'];
};


export type RootMutationTypeCreateKanbanTaskArgs = {
  body: Scalars['String'];
  columnId: Scalars['ID'];
  organizationId: Scalars['ID'];
  title: Scalars['String'];
};


export type RootMutationTypeCreateOrganizationArgs = {
  info?: Maybe<OrganizationInfoInput>;
  name: Scalars['String'];
};


export type RootMutationTypeDeleteChannelArgs = {
  channelId: Scalars['ID'];
};


export type RootMutationTypeDeleteKanbanColumnArgs = {
  columnId: Scalars['ID'];
};


export type RootMutationTypeDeleteOrganizationArgs = {
  organizationId: Scalars['ID'];
};


export type RootMutationTypeDeleteWalletArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDriveChangePublishVersionArgs = {
  id: Scalars['ID'];
  publishHistoryId: Scalars['ID'];
};


export type RootMutationTypeDriveCopyFileArgs = {
  fromId: Scalars['String'];
  toId: Scalars['String'];
};


export type RootMutationTypeDriveCreatePublishArgs = {
  userFileId: Scalars['String'];
};


export type RootMutationTypeDriveCreatePublishCollectionArgs = {
  description?: Maybe<Scalars['String']>;
  publishId: Scalars['ID'];
};


export type RootMutationTypeDriveCreateShareArgs = {
  code?: Maybe<Scalars['String']>;
  expiredAfterDays?: Maybe<Scalars['Int']>;
  userFileId: Scalars['String'];
};


export type RootMutationTypeDriveCreateShareCollectionArgs = {
  code?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  shareId: Scalars['ID'];
};


export type RootMutationTypeDriveDeleteCollectionArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDriveDeleteFileArgs = {
  id: Scalars['String'];
  space: DriveSpace;
};


export type RootMutationTypeDriveDeleteFilesArgs = {
  ids: Array<Maybe<Scalars['String']>>;
  space: DriveSpace;
};


export type RootMutationTypeDriveDeletePublishArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDriveDeleteShareArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeDriveEditCollectionDescriptionArgs = {
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
};


export type RootMutationTypeDriveEditDescriptionArgs = {
  description: Scalars['String'];
  space?: Maybe<DriveSpace>;
  userFileId: Scalars['String'];
};


export type RootMutationTypeDriveEditShareArgs = {
  code?: Maybe<Scalars['String']>;
  expiredAfterDays?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
};


export type RootMutationTypeDriveMakeDirArgs = {
  description?: Maybe<Scalars['String']>;
  fullName: Array<Maybe<Scalars['String']>>;
  space?: Maybe<DriveSpace>;
};


export type RootMutationTypeDriveMakeDirUnderArgs = {
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parentId: Scalars['String'];
  space?: Maybe<DriveSpace>;
};


export type RootMutationTypeDriveMoveFileArgs = {
  fromId: Scalars['String'];
  fromSpace: DriveSpace;
  toId: Scalars['String'];
  toSpace: DriveSpace;
};


export type RootMutationTypeDriveRenameFileArgs = {
  id: Scalars['String'];
  newName: Scalars['String'];
  space: DriveSpace;
};


export type RootMutationTypeDriveUpdatePublishArgs = {
  id: Scalars['ID'];
  userFileId: Scalars['String'];
};


export type RootMutationTypeDriveUploadByHashArgs = {
  description?: Maybe<Scalars['String']>;
  fullName: Array<Maybe<Scalars['String']>>;
  hash: Scalars['String'];
  space?: Maybe<DriveSpace>;
};


export type RootMutationTypeEditCurrentUserArgs = {
  avatar?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  code?: Maybe<Scalars['String']>;
  personalInfo?: Maybe<PersonalInfoInput>;
  username?: Maybe<Scalars['String']>;
};


export type RootMutationTypeEditCurrentUserSettingArgs = {
  currency?: Maybe<Currency>;
};


export type RootMutationTypeEditOrganizationArgs = {
  id: Scalars['ID'];
  info?: Maybe<OrganizationInfoInput>;
  name?: Maybe<Scalars['String']>;
};


export type RootMutationTypeEditOrganizationInvitationArgs = {
  action: InvitationAction;
  invitationId: Scalars['ID'];
};


export type RootMutationTypeImDeleteUserSessionArgs = {
  id: Scalars['ID'];
};


export type RootMutationTypeImHaveReadArgs = {
  contactId: Scalars['ID'];
  contactType?: Maybe<ImContactType>;
  messageId?: Maybe<Scalars['Snowflake']>;
};


export type RootMutationTypeImSendMessageArgs = {
  body?: Maybe<Scalars['Json']>;
  contactId: Scalars['ID'];
  contactType?: Maybe<ImContactType>;
};


export type RootMutationTypeInviteUserToOrganizationArgs = {
  message?: Maybe<Scalars['String']>;
  organizationId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeMoveKanbanColumnArgs = {
  afterColumnId: Scalars['Int'];
  columnId: Scalars['ID'];
};


export type RootMutationTypeMoveKanbanItemArgs = {
  afterItemId: Scalars['Int'];
  itemId: Scalars['ID'];
  toColumnId?: Maybe<Scalars['ID']>;
};


export type RootMutationTypeNknLogoutArgs = {
  nknPublicKey: Scalars['String'];
};


export type RootMutationTypeNknOnlineArgs = {
  nknPublicKey: Scalars['String'];
};


export type RootMutationTypeResetPasswordArgs = {
  code?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  newPassword: Scalars['String'];
  oldPassword?: Maybe<Scalars['String']>;
};


export type RootMutationTypeSelfJoinChannelArgs = {
  channelId: Scalars['ID'];
};


export type RootMutationTypeSendLoginCodeArgs = {
  email: Scalars['String'];
};


export type RootMutationTypeSendVerifyCodeArgs = {
  email?: Maybe<Scalars['String']>;
  nkn?: Maybe<Scalars['String']>;
  type?: Maybe<VerifyCodeType>;
};


export type RootMutationTypeSetChannelAdminArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeSetOrganizationAdminArgs = {
  organizationId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeSigninArgs = {
  code?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  password?: Maybe<Scalars['String']>;
};


export type RootMutationTypeSignupArgs = {
  avatar?: Maybe<Scalars['String']>;
  code: Scalars['String'];
  email: Scalars['String'];
  nknPublicKey?: Maybe<Scalars['String']>;
  password: Scalars['String'];
  username: Scalars['String'];
};


export type RootMutationTypeUnsetChannelAdminArgs = {
  channelId: Scalars['ID'];
  userId: Scalars['ID'];
};


export type RootMutationTypeUnsetOrganizationAdminArgs = {
  organizationId: Scalars['ID'];
  userId: Scalars['ID'];
};

export type RootQueryType = {
  __typename?: 'RootQueryType';
  /** Get some bsv address's balance */
  bsvBalance?: Maybe<BsvBalance>;
  /** Get channel by id, if channel is public or current user in this channel */
  channel?: Maybe<Channel>;
  driveDirSize?: Maybe<Scalars['String']>;
  /** find publish */
  driveFindPublish?: Maybe<DrivePublish>;
  /** find share */
  driveFindShare?: Maybe<DriveShare>;
  /** list current user's collections. */
  driveListCollections?: Maybe<Array<Maybe<DriveCollection>>>;
  driveListFiles?: Maybe<Array<Maybe<DriveUserFile>>>;
  /** list current user's publish files. */
  driveListPublishs?: Maybe<Array<Maybe<DrivePublish>>>;
  /** list current user's shared files. */
  driveListShares?: Maybe<Array<Maybe<DriveShare>>>;
  /** preview share info */
  drivePreviewShare?: Maybe<DriveSharePreview>;
  /** search user file by filename or description */
  driveSearch?: Maybe<Array<Maybe<DriveUserFile>>>;
  /** Get offline messages */
  imOfflineMessages?: Maybe<Array<Maybe<ImMessage>>>;
  /** Get session list */
  imUserSessions?: Maybe<Array<Maybe<ImUserSession>>>;
  /** List all kanban columns in organization */
  kanbanColumns?: Maybe<Array<Maybe<KanbanColumn>>>;
  /** Get current user's login nkn wallet */
  loginNknWallet?: Maybe<Wallet>;
  /** Get the currently signed-in user */
  me?: Maybe<User>;
  /** Get current user's message nkn wallet */
  messageNknWallet?: Maybe<Wallet>;
  /** Get organization by id, if current user in this organization */
  organization?: Maybe<Organization>;
  /** List organizations */
  organizations?: Maybe<Array<Maybe<OrganizationPages>>>;
  /** query bsv incomes. */
  paymentIncomes?: Maybe<Array<Maybe<PaymentIncome>>>;
};


export type RootQueryTypeBsvBalanceArgs = {
  address: Scalars['String'];
};


export type RootQueryTypeChannelArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeDriveDirSizeArgs = {
  dirId: Scalars['String'];
};


export type RootQueryTypeDriveFindPublishArgs = {
  txid: Scalars['String'];
};


export type RootQueryTypeDriveFindShareArgs = {
  code?: Maybe<Scalars['String']>;
  uri: Scalars['String'];
};


export type RootQueryTypeDriveListCollectionsArgs = {
  type?: Maybe<DriveCollectionType>;
};


export type RootQueryTypeDriveListFilesArgs = {
  dirFullName?: Maybe<Array<Maybe<Scalars['String']>>>;
  dirId?: Maybe<Scalars['String']>;
  space?: Maybe<DriveSpace>;
  token?: Maybe<Scalars['String']>;
};


export type RootQueryTypeDrivePreviewShareArgs = {
  uri: Scalars['String'];
};


export type RootQueryTypeDriveSearchArgs = {
  keywords: Scalars['String'];
  space?: Maybe<DriveSpace>;
};


export type RootQueryTypeImOfflineMessagesArgs = {
  limit: Scalars['Int'];
  messageId: Scalars['Snowflake'];
  offset: Scalars['Int'];
  userSessionId: Scalars['ID'];
};


export type RootQueryTypeKanbanColumnsArgs = {
  organizationId: Scalars['ID'];
};


export type RootQueryTypeOrganizationArgs = {
  id: Scalars['ID'];
};


export type RootQueryTypeOrganizationsArgs = {
  pageNumber?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
  userId: Scalars['ID'];
};


export type RootQueryTypePaymentIncomesArgs = {
  address: Scalars['String'];
  fromHeight: Scalars['Int'];
  toHeight: Scalars['Int'];
};

export type RootSubscriptionType = {
  __typename?: 'RootSubscriptionType';
  /** User successfully uploaded. */
  driveFileUploaded?: Maybe<DriveUserFile>;
  /** User's bsv utxo status change. */
  transactionUtxo?: Maybe<TransactionUtxo>;
};


export type RootSubscriptionTypeDriveFileUploadedArgs = {
  userId: Scalars['ID'];
};


export type RootSubscriptionTypeTransactionUtxoArgs = {
  userId: Scalars['ID'];
};

export type Session = {
  __typename?: 'Session';
  token: Scalars['String'];
  user: User;
};

export type Setting = {
  __typename?: 'Setting';
  currency?: Maybe<Currency>;
  insertedAt?: Maybe<Scalars['NaiveDateTime']>;
  updatedAt?: Maybe<Scalars['NaiveDateTime']>;
  user: User;
};

/** kanban share */
export type Share = {
  __typename?: 'Share';
  body?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  updatedAt: Scalars['NaiveDateTime'];
  user?: Maybe<User>;
};


/** kanban task */
export type Task = {
  __typename?: 'Task';
  body?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  insertedAt: Scalars['NaiveDateTime'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['NaiveDateTime'];
  user?: Maybe<User>;
};

export type TransactionUtxo = {
  __typename?: 'TransactionUtxo';
  address?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['Float']>;
  blockHash?: Maybe<Scalars['String']>;
  confirmations?: Maybe<Scalars['Int']>;
  height?: Maybe<Scalars['Int']>;
  hex?: Maybe<Scalars['String']>;
  isConfirmed?: Maybe<Scalars['Boolean']>;
  outputIndex?: Maybe<Scalars['Int']>;
  txid?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  channels?: Maybe<Array<Maybe<Channel>>>;
  driveSetting?: Maybe<DriveUserSetting>;
  email: Scalars['String'];
  emails?: Maybe<Array<Maybe<Email>>>;
  id: Scalars['ID'];
  lastLoginAt?: Maybe<Scalars['NaiveDateTime']>;
  messageNknAddress?: Maybe<Scalars['String']>;
  organizationInvitations?: Maybe<Array<Maybe<OrganizationInvitation>>>;
  organizations?: Maybe<Array<Maybe<Organization>>>;
  personalInfo?: Maybe<PersonalInfo>;
  role?: Maybe<Role>;
  setting?: Maybe<Setting>;
  type?: Maybe<UserType>;
  username: Scalars['String'];
  wallets?: Maybe<Array<Maybe<Wallet>>>;
};

export type UserPreview = {
  __typename?: 'UserPreview';
  avatar?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export enum UserType {
  Issuer = 'ISSUER',
  Basic = 'BASIC'
}

export enum VerifyCodeType {
  ActiveEmail = 'ACTIVE_EMAIL',
  ActiveNkn = 'ACTIVE_NKN',
  ChangeInfo = 'CHANGE_INFO',
  ResetPassword = 'RESET_PASSWORD'
}

export enum Visible {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Wallet = {
  __typename?: 'Wallet';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  info: WalletInfo;
  /** default nkn address tag */
  tags?: Maybe<Array<Maybe<WalletTag>>>;
  type: WalletType;
  user: User;
};

export type WalletInfo = {
  __typename?: 'WalletInfo';
  identifier?: Maybe<Scalars['String']>;
  publicKey?: Maybe<Scalars['String']>;
};

export enum WalletTag {
  Login = 'LOGIN',
  Message = 'MESSAGE'
}

export enum WalletType {
  Bsv = 'BSV',
  Nkn = 'NKN'
}
