<template>
  <div>
    <!-- 功能区 -->
    <div class="relative flex items-center mb-3">
      <!-- 这个为隐藏的作为选择文件用的 -->
      <input
        multiple
        class="hidden"
        type="file"
        id="singleInput"
        @change="onChangeMultipleUploadFile"
      />
      <!-- 这个作为上传文件夹的时候用的 -->
      <input
        multiple
        class="hidden"
        type="file"
        id="folderInput"
        webkitdirectory
        @change="onChangeMultipleUploadFolder"
      />
      <!-- 下拉 - 上传 -->
      <a-dropdown class="mr-2">
        <template #overlay>
          <a-menu @click="onClickDropDownMenuUpload">
            <a-menu-item key="file">{{ $t("metanet.uploadFile") }}</a-menu-item>
            <a-menu-item key="folder">{{
              $t("metanet.uploadFolder")
            }}</a-menu-item>
          </a-menu>
        </template>
        <a-button type="primary">
          <CloudUploadOutlined />
          {{ $t("metanet.uploadButton") }}
        </a-button>
      </a-dropdown>
      <!-- 下拉 - 新建 -->
      <a-dropdown class="mr-2">
        <template #overlay>
          <a-menu @click="onClickDropDownMenuCreate">
            <!-- 新建文件 -->
            <a-menu-item key="file">{{ $t("metanet.createFile") }}</a-menu-item>
            <!-- 新建文件夹 -->
            <a-menu-item key="folder">{{
              $t("metanet.createFolder")
            }}</a-menu-item>
            <!-- 新建by 导入 -->
            <a-menu-item key="import">{{
              $t("metanet.createByImport")
            }}</a-menu-item>
          </a-menu>
        </template>
        <a-button type="primary">
          <FolderAddOutlined />
          {{ $t("metanet.create") }}
        </a-button>
      </a-dropdown>
      <!-- 刷新按钮 -->
      <a-button class="mr-2" @click="onRefreshTableData">
        <SyncOutlined :spin="tableLoading" />
        {{ $t("metanet.refresh") }}
      </a-button>

      <!-- 处理选中数据按钮集合 -->
      <!-- TODO 分享多个? -->
      <!-- 下载 删除 重命名 复制到 移动到 -->
      <a-button-group class="mr-2" v-show="selectedRows.length">
        <a-button type="danger" @click="onBatchDelete">
          <!-- <DeleteOutlined /> -->
          {{ $t("metanet.delete") }}
        </a-button>
        <!-- 选中有文件夹的话禁用下载按钮(因为还没有下载文件夹功能) -->
        <!-- <DownloadOutlined /> -->
        <!-- <a-button
          @click="onDownloadBatch"
          :disabled="selectedRows.some((i) => i.isDir)"
        >
          {{ $t("metanet.downloadButton") }}
        </a-button> -->
        <!-- 选中多个的时候禁用重命名 -->
        <!-- <a-button @click="onDownload" :disabled="selectedRows.length > 1">
          {{ $t("metanet.rename") }}
        </a-button> -->
        <a-button
          @click="
            onCopyMoveModalPreAction(
              'copy',
              selectedRows.map((i) => i.id)
            )
          "
        >
          {{ $t("metanet.buttonCopyTo") }}
        </a-button>
        <a-button
          @click="
            onCopyMoveModalPreAction(
              'move',
              selectedRows.map((i) => i.id)
            )
          "
        >
          {{ $t("metanet.buttonMoveTo") }}
        </a-button>
      </a-button-group>
      <!-- 临时加的显示进度抽屉的按钮 -->
      <div class="flex items-center absolute right-1 cursor-pointer">
        <!-- 网盘使用信息 -->
        <a-tooltip title="网盘信息">
          <div class="inline-block mr-2" @click="onShowDiskDetail">
            <DatabaseOutlined />
          </div>
        </a-tooltip>
        <!-- 上传信息 -->
        <a-tooltip :title="$t('metanet.uploadStatusInfo')">
          <div class="inline-block mr-2" @click="onToggleIsShowProgressDrawer">
            <InfoCircleOutlined />
          </div>
        </a-tooltip>
        <!-- nkn节点状态 -->
        <a-tooltip title="nknClient状态">
          <a-dropdown>
            <a-tag color="#3b5999">
              <template #icon>
                <GlobalOutlined />
              </template>
              <span class="inline-block w-16 text-center">
                {{ nknClientConnectStatusShowText }}
              </span>
            </a-tag>
            <template #overlay>
              <a-menu>
                <a-menu-item class="text-xs" @click="onResetNknMultiClient">
                  重置Client
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-tooltip>
      </div>
    </div>
    <!-- 面包屑 目录历史索引 -->
    <a-breadcrumb class="pl-2 mb-1">
      <template #separator>></template>
      <template v-if="historyDir.length > 1">
        <a-breadcrumb-item
          v-for="hItem in historyDir.slice(0, -1)"
          :key="hItem.id"
        >
          <a
            @click="onClickHistoryDirUpperLevel(hItem)"
            style="color: #1890ff"
            >{{ hItem.name }}</a
          >
        </a-breadcrumb-item>
      </template>
      <a-breadcrumb-item>{{ $lastOfArray(historyDir).name }}</a-breadcrumb-item>
    </a-breadcrumb>
    <!-- 表格 -->
    <TableFiles
      rowKey="id"
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      v-model:selectedRows="selectedRows"
      v-model:selectedRowKeys="selectedRowKeys"
    >
      <template #name="{ record }">
        <div class="tdName relative">
          <!-- 空白就是blank 文件夹就是folder -->
          <XFileTypeIcon class="w-6 h-6" :type="record.fileType" />
          <a
            v-if="currentRenameId !== record.id"
            href="javascript:;"
            class="ml-2"
            :title="record.fullName[0]"
            @click="onClickTableItemName(record)"
          >
            {{ record.fullName[0] }}
          </a>
          <div v-else class="inline-flex items-center ml-1">
            <a-input
              ref="renameInput"
              class="w-48"
              size="small"
              :maxlength="200"
              v-model:value="currentRenameString"
            />
            <CheckSquareOutlined
              class="ml-1 renameButton"
              @click="onRecordRenameConfirm(record)"
            />
            <CloseSquareOutlined
              class="ml-1 renameButton"
              @click="onResetRecordRenameState"
            />
          </div>
          <!-- hover 才显示的shortCut栏 -->
          <!-- 非上级目录 -->
          <div
            v-if="record.fullName[0] !== '...'"
            class="tableShortcut hidden inline-block absolute right-0"
          >
            <!-- 详情 -->
            <a-tooltip title="详情">
              <a
                class="renameButton ml-1"
                href="javascript:;"
                @click="onRecordDetail(record)"
                ><InfoCircleOutlined
              /></a>
            </a-tooltip>
            <!-- 重命名 -->
            <a-tooltip title="重命名">
              <a
                class="renameButton ml-1"
                href="javascript:;"
                @click="onRecordRename(record)"
                ><EditOutlined
              /></a>
            </a-tooltip>
            <!-- 分享 -->
            <a-tooltip title="分享">
              <a
                class="renameButton ml-1"
                href="javascript:;"
                @click="onRecordShare(record)"
                ><ShareAltOutlined
              /></a>
            </a-tooltip>
            <!-- 下载 -->
            <!-- 非文件夹才显示 -->
            <a-tooltip v-if="!record.isDir" title="下载">
              <a
                class="renameButton ml-1"
                href="javascript:;"
                @click="onDownload(record)"
                ><DownloadOutlined
              /></a>
            </a-tooltip>
            <!-- 删除 -->
            <a-tooltip title="删除">
              <a
                class="renameButton ml-1 ant-color-danger"
                href="javascript:;"
                @click="onRecordDelete(record)"
                ><DeleteOutlined
              /></a>
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #hash="{ record }">
        <TdHash v-if="record && record.hash" :hash="record.hash" />
      </template>
      <template #action="{ record }">
        <!-- <a-button-group size="small">
          <a-button @click="onDownload(record)">
            {{ $t("metanet.downloadButton") }}
          </a-button>
          <a-button type="danger">{{ $t("metanet.delButton") }}</a-button>
        </a-button-group> -->
        <a-dropdown placement="bottomRight">
          <div class="text-center">
            <!-- <a href="javascript:void(0)" class="ant-color-blue">...</a> -->
            <EllipsisOutlined />
          </div>
          <template #overlay>
            <a-menu>
              <!-- 分享 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.shareButton") }}
              </a-menu-item>
              <!-- 发布 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordPublish(record)"
              >
                {{ $t("metanet.publish") }}
              </a-menu-item>
              <!-- TODO 传送 -->
              <!-- <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                {{ $t("metanet.send") }}
              </a-menu-item> -->
              <!-- 下载 -->
              <!-- 非文件夹才显示下载 -->
              <a-menu-item
                v-if="!record.isDir"
                class="px-4 flex items-center"
                @click="onDownload(record)"
              >
                {{ $t("metanet.downloadButton") }}
              </a-menu-item>
              <!-- 移动 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onCopyMoveModalPreAction('move', [record.id])"
              >
                {{ $t("metanet.buttonMoveTo") }}
              </a-menu-item>
              <!-- 复制 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onCopyMoveModalPreAction('copy', [record.id])"
              >
                {{ $t("metanet.buttonCopyTo") }}
              </a-menu-item>
              <!-- 重命名 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordRename(record)"
              >
                {{ $t("metanet.rename") }}
              </a-menu-item>
              <!-- 删除 -->
              <a-menu-item
                class="px-4 flex items-center text-red-500"
                @click="onRecordDelete(record)"
              >
                {{ $t("metanet.delButton") }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </TableFiles>
    <!-- 抽屉 上传进度 -->
    <a-drawer
      id="uploadDrawer"
      height="auto"
      :wrapStyle="{
        width: '520px',
        left: 'auto',
        right: '40px',
      }"
      :drawerStyle="{
        'max-height': '400px',
        overflow: 'hidden',
        'overflow-y': 'scroll',
      }"
      :headerStyle="{
        padding: '8px 12px',
        'background-color': '#F7F7F8',
      }"
      :bodyStyle="{
        padding: '12px',
      }"
      placement="bottom"
      :closable="true"
      :mask="false"
      :visible="isShowProgressDrawer"
      @close="onCloseProgressDrawer"
    >
      <template #title>
        <!-- <a-button type="primary">fuck u</a-button> -->
        <!-- 一个circle 总体进度 -->
        <!-- TODO 根据情况变动背景颜色? -->
        <div
          class="
            inline-block
            w-16
            text-center
            py-1
            rounded-2xl
            bg-blue-400
            text-white
          "
          :style="{
            'background-color': '#1890FF',
          }"
        >
          {{ uploadTaskTotalProgress }}%
        </div>
        <a-tooltip :title="$t('metanet.uploadDrawerClearAll')">
          <a-button
            class="ml-4"
            shape="circle"
            size="small"
            @click="onRemoveTaskList"
          >
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </a-tooltip>
      </template>
      <div v-for="taskItem in uploadTaskList" :key="taskItem.id">
        <div class="flex items-center">
          <!-- icon/name/size/status -->
          <XFileTypeIcon class="w-6 h-6 mr-2" :type="taskItem.fileType" />
          <div
            :style="{
              'max-width': '275px',
              'text-overflow': 'ellipsis',
              overflow: 'hidden',
              'white-space': 'nowrap',
            }"
            :title="taskItem.fileName"
          >
            {{ taskItem.fileName }}
          </div>
          <div class="flex-1 ml-4 text-xs text-gray-400">
            | &nbsp; {{ taskItem.fileSize
            }}{{ taskItem.status === "uploading" ? `(${taskItem.speed})` : "" }}
            <a-tooltip :title="$t('metanet.uploadDrawerClearItem')">
              <DeleteOutlined @click="onRemoveTaskItem(taskItem)" />
            </a-tooltip>
          </div>
          <div
            :class="{
              'ant-color-uploading': taskItem.status === 'uploading',
              'ant-color-success': taskItem.status === 'success',
              'ant-color-failed': taskItem.status === 'failed',
            }"
          >
            {{ transformStatusText(taskItem.status) }}
          </div>
        </div>
        <!-- progress -->
        <!-- status	状态，可选: success exception normal active -->
        <a-progress
          :strokeWidth="3"
          :showInfo="false"
          :percent="taskItem.progress"
          :status="
            taskItem.status === 'failed'
              ? 'exception'
              : taskItem.progress < 100
              ? 'active'
              : 'success'
          "
        />
      </div>
    </a-drawer>
    <!-- 弹窗 分享文件 -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowShareFileModal"
      :title="`分享文件(夹) ${currentShareFile.name}`"
      :confirmLoading="shareFileModalConfirmLoading"
      @ok="onShareFileModalConfirm"
      @cancel="onResetShareFileModalForm"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="有效期" v-bind="shareFileValidateInfos.expired">
          <a-input-number
            :maxlength="30"
            :min="1"
            v-model:value="shareFileModelRef.expired"
          />
        </a-form-item>
        <a-form-item
          :label="$t('metanet.createFileType')"
          v-bind="shareFileValidateInfos.type"
        >
          <a-radio-group v-model:value="shareFileModelRef.type">
            <a-radio value="PUBLIC">公开</a-radio>
            <a-radio value="PRIVATE">私密</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="访问码"
          v-if="shareFileModelRef.type === 'PRIVATE'"
          v-bind="shareFileValidateInfos.code"
        >
          <a-input :maxlength="6" v-model:value="shareFileModelRef.code" />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 弹窗 分享链接 -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowSuccessShareModal"
      :okText="
        currentSuccessShare.code
          ? $t('metanet.copyShare')
          : $t('metanet.copyLink')
      "
      :title="`分享文件(夹) ${currentSuccessShare.name}`"
      @ok="onSuccessShareModalConfirm"
      @cancel="onResetSuccessShareModalForm"
    >
      <a-row class="mb-4" type="flex" justify="space-around" align="middle">
        <a-col :span="4">{{ $t("metanet.shareUrl") }}</a-col>
        <a-col :span="20">
          <a-input v-model:value="currentSuccessShare.url">
            <template #suffix>
              <a
                @click="onCopySuccessShareInput('url')"
                class="ant-color-blue"
                href="javascript:;"
                >{{ $t("metanet.copyButton") }}</a
              >
            </template>
          </a-input>
        </a-col>
      </a-row>
      <a-row
        v-if="currentSuccessShare.code"
        class="mb-4"
        type="flex"
        justify="start"
        align="middle"
      >
        <a-col :span="4">{{ $t("metanet.code") }}</a-col>
        <a-col :span="5">
          <a-input v-model:value="currentSuccessShare.code">
            <template #suffix>
              <a
                @click="onCopySuccessShareInput('code')"
                class="ant-color-blue"
                href="javascript:;"
                >{{ $t("metanet.copyButton") }}</a
              >
            </template>
          </a-input>
        </a-col>
      </a-row>
      <a-row>
        <a-col
          >链接<span class="ant-color-blue"
            >{{ currentSuccessShare.expired }}天</span
          >后失效</a-col
        >
      </a-row>
    </a-modal>
    <!-- 弹窗 发布文件 -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowPublishModal"
      :title="`发布文件(夹) ${currentPublish.name}`"
      :confirmLoading="publishModalConfirmLoading"
      @ok="onPublishModalConfirm"
      @cancel="onResetPublishModalForm"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="发布ID" v-bind="publishValidateInfos.publishId">
          <a-select
            v-model:value="publishModelRef.publishId"
            placeholder="选择发布ID"
          >
            <a-select-option key="new">新的发布</a-select-option>
            <a-select-option
              v-for="item in publishModalOptionList"
              :key="item.publishId"
              :title="item.showText"
            >
              {{ item.showText }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- TODO tag 参数? -->
        <!-- <a-form-item label="TAG" v-bind="publishValidateInfos.expired">
          <a-input :maxlength="30" v-model:value="publishModelRef.tag" />
        </a-form-item> -->
      </a-form>
    </a-modal>
    <!-- 新建文件 txt/ markdown -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowCreateFileModal"
      :title="$t('metanet.createFile')"
      :confirmLoading="createFileModalConfirmLoading"
      @ok="onCreateFileModalConfirm"
      @cancel="onResetCreateFileModalForm"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          :label="$t('metanet.createFileType')"
          v-bind="createFileValidateInfos.fileType"
        >
          <a-radio-group v-model:value="createFileModelRef.fileType">
            <a-radio value="txt">txt</a-radio>
            <a-radio value="markdown">markdown</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('metanet.fileName')"
          v-bind="createFileValidateInfos.fileName"
        >
          <a-input
            :maxlength="30"
            :placeholder="$t('metanet.fileName')"
            v-model:value="createFileModelRef.fileName"
            :addonAfter="
              createFileModelRef.fileType === 'txt' ? '.txt' : '.md '
            "
          />
        </a-form-item>
        <a-form-item :label="$t('metanet.addDesc')">
          <a-input
            :maxlength="200"
            v-model:value="createFileModelRef.fileDesc"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 弹窗 新建文件夹 -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowCreateFolderModal"
      :title="$t('metanet.createFolder')"
      :confirmLoading="createFolderModalConfirmLoading"
      @ok="onCreateFolderModalConfirm"
      @cancel="onResetCreateFolderModalForm"
    >
      <!-- <a-form> </a-form> -->
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          :label="$t('metanet.createFolderPath')"
          v-bind="createFolderValidateInfos.folderPrefix"
        >
          <a-radio-group v-model:value="createFolderModelRef.folderPrefix">
            <a-radio value="1">当前路径*</a-radio>
            <a-radio value="2">根目录~ </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('metanet.folderName')"
          v-bind="createFolderValidateInfos.folderName"
        >
          <a-input
            :maxlength="30"
            :placeholder="$t('metanet.folderName')"
            v-model:value="createFolderModelRef.folderName"
          />
        </a-form-item>
        <a-form-item :label="$t('metanet.addDesc')">
          <a-input
            :maxlength="200"
            v-model:value="createFolderModelRef.folderDesc"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 弹窗 复制/移动 -->
    <a-modal
      destroyOnClose
      v-model:visible="isShowCopyMoveModal"
      :title="
        currentCopyMoveModalTitle === 'copy'
          ? $t('metanet.buttonCopyTo')
          : $t('metanet.buttonMoveTo')
      "
      @ok="onCopyMoveModalConfirm"
      :bodyStyle="{ padding: '18px 12px', border: '1px solid #f2f2f2' }"
    >
      <!-- padding: '18px 12px', -->
      <a-table
        size="small"
        rowKey="dirId"
        :showHeader="false"
        :pagination="false"
        :style="{
          border: '1px solid #eff2f9',
        }"
        :defaultExpandedRowKeys="['root']"
        :rowClassName="copyMoveModalTableRowClassName"
        :columns="copyMoveTableColumns"
        :data-source="copyMoveModalTableData"
        :customRow="copyMoveModalTableCustomRow"
        :loading="copyMoveModalTableLoading"
      >
        <!-- <template #name="{ record }"> -->
        <template #name="{ record }">
          <div class="inline-block">
            <!-- 空白就是blank 文件夹就是folder -->
            <XFileTypeIcon class="w-4 h-4" type="folder" />
            <a href="javascript:;" class="ml-1">{{ record.dirName }}</a>
          </div>
        </template>
      </a-table>
    </a-modal>

    <!-- 弹窗 导入文件(夹) -->
    <!-- <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowImportModal"
      :title="$t('metanet.createFolder')"
      :confirmLoading="createFolderModalConfirmLoading"
      @ok="onCreateFolderModalConfirm"
      @cancel="onResetCreateFolderModalForm"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          :label="$t('metanet.createFolderPath')"
          v-bind="createFolderValidateInfos.folderPrefix"
        >
          <a-radio-group v-model:value="createFolderModelRef.folderPrefix">
            <a-radio value="1">当前路径*</a-radio>
            <a-radio value="2">根目录~ </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('metanet.folderName')"
          v-bind="createFolderValidateInfos.folderName"
        >
          <a-input
            :maxlength="30"
            :placeholder="$t('metanet.folderName')"
            v-model:value="createFolderModelRef.folderName"
          />
        </a-form-item>
        <a-form-item :label="$t('metanet.addDesc')">
          <a-input
            :maxlength="200"
            v-model:value="createFolderModelRef.folderDesc"
          />
        </a-form-item>
      </a-form>
    </a-modal> -->

    <!-- 详情卡片 -->
    <ModalDetail v-model:visible="isShowDetailModal" :detail="currenDetailInfo">
      <!-- <template #name="{ value }">
        <div>i am the name--{{ value }}</div>
      </template> -->
      <template v-if="currenDetailInfo.slotDiskUsageInfo" #slotDiskUsagePercent>
        <a-tooltip
          :title="`总空间 ${
            currenDetailInfo.slotDiskUsageInfo.split(' / ')[1]
          }, 已使用 ${currenDetailInfo.slotDiskUsageInfo.split(' / ')[0]}`"
        >
          <a-row class="mb-1" justify="space-between">
            <a-col :span="6" class="ant-color-gray">空间使用</a-col>
            <a-col :span="17">
              <a-progress :percent="+currenDetailInfo.slotDiskUsagePercent" />
            </a-col>
          </a-row>
        </a-tooltip>
      </template>
      <template v-if="currenDetailInfo.slotDiskUsageInfo" #slotBuyMoreDisk>
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray"></a-col>
          <a-col :span="17" class="pt-4">
            <a-button type="primary" shape="round">{{
              $t("metanet.buyStorage")
            }}</a-button>
          </a-col>
        </a-row>
      </template>
    </ModalDetail>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  createVNode,
  computed,
  watch,
  reactive,
  onUnmounted,
  toRaw,
  nextTick,
} from "vue";
import {
  DownOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  FolderAddOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EllipsisOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  EditOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";
import TableFiles from "./TableFiles.vue";
import ModalDetail, { TDetailInfo } from "./ModalDetail.vue";
import TdHash from "./TdHash.vue";
import { XFileTypeIcon } from "@/components";
import { useI18n } from "vue-i18n";
import {
  apiBatchDelete,
  apiCopyFileToDir,
  apiGetPreviewToken,
  apiMakeDirByPath,
  apiMakeDirByRoot,
  apiMoveFileToDir,
  apiPublishCreate,
  apiPublishUpdate,
  apiQueryFileByDir,
  apiQueryMeSpace,
  apiQueryPublishList,
  apiRename,
  apiShareCreate,
  apiSingleDelete,
  apiUploadSingle,
  TFileItem,
  TFileList,
} from "@/apollo/api";
import dayjs from "dayjs";
import { assign } from "lodash-es";
import { message, Modal } from "ant-design-vue";
import { useUserStore } from "@/store";
import { useDelay } from "@/hooks";
import { formatBytes, getFileSHA256, getFileType, lastOfArray } from "@/utils";
import {
  FILE_TYPE_MAP,
  MAX_UPLOAD_SIZE,
  NKN_SUB_CLIENT_COUNT,
} from "@/constants";
import pLimit from "p-limit";
import { useForm } from "@ant-design-vue/use";
import { RuleObject } from "ant-design-vue/lib/form/interface";
import { useClipboard } from "@vueuse/core";

type THistoryDirItem = {
  id: string;
  name: string;
};
type TUploadTaskItem = {
  fileHash: string; // 文件的id
  fileName: string; // 文件名称
  fileType: string;
  fileSize: string;
  progress: number;
  status: "uploading" | "success" | "failed";
  speed: string; // 2m / s
};
type TDir = {
  dirId: string;
  dirName: string;
  children?: TDir[];
};
type TCreateFile = {
  fileType: "txt" | "markdown";
  fileName: string;
  fileDesc: string;
};
type TImport = {
  codeType: "hash" | "txid";
  code: string;
};
type TCreateFolder = {
  folderPrefix: "1" | "2";
  folderName: string;
  folderDesc: string;
};
type TShareCreate = {
  type: "PUBLIC" | "PRIVATE";
  expired: number;
  code?: string;
};
type TPublish = {
  publishId: string;
  tag?: string;
};
type TPublishOptionItem = {
  publishId: string;
  collectCount: number;
  txId: string;
  fileId: string;
  fileName: string;
  version: number;
  showText: string;
};
/** 上传文件夹的时候需要非标准的webkitRelativePath 属性 */
type TFileWithFolderPath = File & { webkitRelativePath: string };

function sortByDirType(a: TFileItem, b: TFileItem) {
  return a.isDir ? (b.fullName[0] === "..." ? 1 : -1) : 1;
}
export default defineComponent({
  components: {
    // icon
    // DownOutlined,
    CloudUploadOutlined,
    SyncOutlined,
    FolderAddOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    GlobalOutlined,
    InfoCircleOutlined,
    DatabaseOutlined,
    CheckSquareOutlined,
    CloseSquareOutlined,
    EditOutlined,
    ShareAltOutlined,
    DownloadOutlined,
    //
    TableFiles,
    XFileTypeIcon,
    TdHash,
    ModalDetail,
  },
  setup() {
    const { t } = useI18n();
    const selectedRows = ref<TFileItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    /** 按钮功能集合 */
    function useToolSet() {
      const onClickDropDownMenuCreate = ({
        key,
      }: {
        key: "file" | "folder" | "import";
      }) => {
        if (key === "file") isShowCreateFileModal.value = true;
        if (key === "folder") isShowCreateFolderModal.value = true;
        // if (key === "import") isShowImportModal.value = true;
      };
      const onClickDropDownMenuUpload = ({
        key,
      }: {
        key: "file" | "folder";
      }) => {
        console.log("onClickDropDownMenuUpload", key);
        // 点击文件
        if (key === "file") {
          document.getElementById("singleInput")?.click();
          // 选择完文件后会触发 onChangeMultipleUploadFile
        } else {
          // 点击文件夹
          document.getElementById("folderInput")?.click();
          // 选择完文件后会触发 onChangeMultipleUploadFolder
        }
      };
      // 批量删除
      const onBatchDelete = () => {
        const len = selectedRows.value.length;
        if (!len) {
          message.warning(t("metanet.errorPleaseSelect"));
          return;
        }
        Modal.confirm({
          // title: "Do you Want to delete these items?",
          title: `${t("metanet.delContent1")} ${len} ${t("metanet.items")} ${t(
            "metanet.delContent2"
          )}?`,
          icon: createVNode(ExclamationCircleOutlined),
          // content: createVNode(
          //   "div",
          //   { style: "color:red;" },
          //   "Some descriptions"
          // ),
          onOk: async () => {
            // 2021-07-06 因为批量接口不支持删除文件夹, 所以这里先分开处理
            const idOfFiles: string[] = [];
            const idOfDirs: string[] = [];
            selectedRows.value.forEach((item) =>
              item.isDir ? idOfDirs.push(item.id) : idOfFiles.push(item.id)
            );
            if (idOfDirs.length) {
              const resOfDeleteDirs = await Promise.all(
                idOfDirs.map((id) => apiSingleDelete({ id, space: "PRIVATE" }))
              );
              resOfDeleteDirs.forEach(([r, e]) => {
                if (e) message.warning(e.message);
              });
            }
            if (idOfFiles.length) {
              const [res, err] = await apiBatchDelete({
                ids: selectedRows.value.map((i) => i.id),
                space: "PRIVATE",
              });
              if (err || !res) return;
              const { driveDeleteFiles } = res.data;
              if (driveDeleteFiles === idOfFiles.length) {
                message.success(t("metanet.deleted"));
              }
            }
            getAndSetTableDataFn(curFolderId.value);
          },
          onCancel() {
            console.log("Cancel");
          },
          // class: 'test',
        });
      };
      /** 批量下载 */
      const onDownloadBatch = () => {
        const rows = selectedRows.value;
        if (rows.some((v) => v.isDir)) {
          // TODO 国际化
          message.warning("无法下载文件夹");
          return;
        }
        console.log("todo");
        // Modal.confirm({
        //   title: `是否下载选中的${rows.length}个文件?`,
        //   icon: createVNode(ExclamationCircleOutlined),
        //   onOk: async () => {
        //     const [res, err] = await apiGetPreviewToken();
        //     if (err || !res) return;
        //     const token = res.data.drivePreviewToken;
        //     let startWait = 100;
        //     rows.map(({ user, space, id: fileId, fullName }) => {
        //       const url = `https://drive-s.owaf.io/download/${
        //         user.id
        //       }/${space.toLowerCase()}/${fileId}/${
        //         fullName.slice(-1)[0]
        //       }?token=${token}`;
        //       const el = document.createElement("a");
        //       el.href = url;
        //       useDelay(++startWait).then(() => {
        //         el.click();
        //         el.remove();
        //       });
        //     });
        //   },
        // });
      };
      // TODO input 上传成功后清除文件?
      /** 文件对话框选完文件后就会触发这个函数 */
      const onChangeMultipleUploadFile = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        // const availableSpace
        const [res, err] = await apiQueryMeSpace();
        if (err || !res) {
          return;
        }
        const { availableSpace } = res.data.me.driveSetting;
        // 如果即将要传的文件总大小超出可用, 退出
        if (
          [...input.files].reduce((a, b) => (a += b.size), 0) > +availableSpace
        ) {
          message.warning("超出最大可用容量!");
          input.value = "";
          return;
        }
        const sizeCanUploadFiles = [...input.files].filter((file) => {
          // 如果超出最大可用容量
          // if (file.size > MAX_UPLOAD_SIZE) {
          //   message.warning(t("metanet.errorUploadSizeLimit"));
          //   // message.warning("超出最大可用容量!");
          //   return false;
          // } else {
          return true;
          // }
        });
        if (!sizeCanUploadFiles.length) {
          input.value = "";
          return;
        }
        try {
          const resOfAll = await Promise.all(
            sizeCanUploadFiles.map((i) => onUploadSingleFile(i))
          );
          // console.log("resOfAll", resOfAll);
        } catch (error) {
          console.log("上传文件错误", error);
        }
        input.value = "";
      };
      /** 上传文件夹 */
      const onChangeMultipleUploadFolder = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        // 创建文件夹 直接传fullName 会自动创建文件夹
        const [res, err] = await apiQueryMeSpace();
        if (err || !res) {
          return;
        }
        const { availableSpace } = res.data.me.driveSetting;
        // 如果即将要传的文件总大小超出可用, 退出
        if (
          [...input.files].reduce((a, b) => (a += b.size), 0) > +availableSpace
        ) {
          message.warning("超出最大可用容量!");
          input.value = "";
          return;
        }
        const sizeCanUploadFiles = [...input.files] as TFileWithFolderPath[];
        if (!sizeCanUploadFiles.length) {
          input.value = "";
          return;
        }
        try {
          const resOfAll = await Promise.all(
            sizeCanUploadFiles.map((i) =>
              onUploadSingleFile(i, i.webkitRelativePath.split("/"))
            )
          );
          // console.log("resOfAll", resOfAll);
        } catch (error) {
          console.log("上传文件错误", error);
        }
        input.value = "";
      };
      // 并发管理器 只允许两个文件同时上传
      const limitUploadFiles = pLimit(2);
      /** 上传单个文件 */
      const onUploadSingleFile = async (
        file: File,
        withPathFileNameArr?: string[]
      ) => {
        // input.files[0] =>file
        // lastModified: 1623572088894
        // lastModifiedDate: Sun Jun 13 2021 16:14:48 GMT+0800 (中国标准时间) {}
        // name: "record.md"
        // size: 1916
        // type: ""
        // webkitRelativePath: ""
        // 弹出上传drawer
        isShowProgressDrawer.value = true;
        const fileName = file.name;
        const fileHash = await getFileSHA256(file);
        const taskItem: TUploadTaskItem = reactive({
          fileHash,
          fileName,
          fileSize: formatBytes(+file.size),
          fileType: getFileType({
            isDir: false,
            fileName,
          }),
          progress: 0,
          status: "uploading",
          speed: "0 Bytes /s",
        });
        const setTaskItemProgress = (
          percentNum: number,
          bytesPerSecond: number
        ) => {
          // console.log(
          //   "bytesPerSecond",
          //   bytesPerSecond,
          //   typeof bytesPerSecond,
          //   formatBytes(bytesPerSecond)
          // );
          // console.log("setTaskItemProgress", v);
          taskItem.progress = percentNum;
          if (percentNum === 100) taskItem.status = "success";
          taskItem.speed = `${formatBytes(bytesPerSecond)} /s`;
        };
        uploadTaskList.value.push(taskItem);
        // TODO 上传完后清除?
        // const [res, err] = await apiUploadSingle({
        const [res, err] = await limitUploadFiles(() =>
          apiUploadSingle({
            // File: new Uint8Array(await file.arrayBuffer()),
            SourceFile: file,
            // 上传到不同的文件夹就要带上其名称在前面 (除了root)
            FullName: [
              ...historyDir.value.slice(1).map((i) => i.name),
              ...(withPathFileNameArr?.length
                ? withPathFileNameArr
                : [fileName]),
            ],
            FileSize: file.size,
            UserId: useUserStore().id,
            Space: "PRIVATE",
            Description: "",
            Action: "drive",
            SetProgress: setTaskItemProgress,
          })
        );
        if (err) {
          taskItem.status = "failed";
          return;
        }
        if (res?.data.startsWith("秒传成功")) {
          message.success(t("metanet.uploadSuccess"));
          setTaskItemProgress(100, 0);
          taskItem.status = "success";
          getAndSetTableDataFn(curFolderId.value);
          return;
        }
        // 处理秒传
        // 同步添加新的事件监听 然后解除监听
        const hide = message.loading(
          `上传${fileName}成功,等待websocket 返回确认信息`,
          0
        );
        let timer: number;
        const { channel } = useUserStore();
        if (!channel) throw Error("no channel");
        // console.log("channel", channel);
        let removeListener = channel.on(
          "file_uploaded",
          (fileUploadInfo: {
            // full_name: ["testTrace.go"]
            // hash: "1e926583a18c6a0a8e26372a5055c9ec748d983c1458c43d125154a74eee7b83"
            // id: "zrEK5LckpjNr2bsRJoT6p0"
            // space: 2
            full_name: string[];
            hash: string;
            id: string;
            space: number;
          }) => {
            // console.log("包括remove的listen", fileUploadInfo);
            if (fileUploadInfo.hash === fileHash) {
              useDelay().then(() => {
                clearTimeout(timer);
                message.success(t("metanet.uploadSuccess"));
                setTaskItemProgress(100, 0);
                taskItem.status = "success";
                getAndSetTableDataFn(curFolderId.value);
                // console.log("getAndSetTableDataFn", getAndSetTableDataFn);
                channel.off("file_uploaded", removeListener);
                hide();
              });
            }
          }
        );
        // 设置超时
        timer = window.setTimeout(() => {
          channel.off("file_uploaded", removeListener);
          hide();
          clearTimeout(timer);
          // TODO 国际化提示
          message.warn(t("metanet.errorUpload"));
          taskItem.status = "failed";
          // getAndSetTableDataFn(curFolderId.value);
        }, 60000);
        // 重新刷新数据?
        if (err) console.error(err);
        // console.log("writestream---", res, input);
      };
      return {
        onClickDropDownMenuCreate,
        onClickDropDownMenuUpload,
        onBatchDelete,
        onDownloadBatch,
        onChangeMultipleUploadFile,
        onChangeMultipleUploadFolder
      };
    }
    const isShowCopyMoveModal = ref(false);
    const currentCopyMoveModalTitle = ref<"copy" | "move">("copy"); // copy or move
    /** 弹窗 复制/移动 */
    function useCopyMoveModal() {
      const copyMoveTableColumns = [
        {
          title: "Name",
          // dataIndex: "name",
          slots: { customRender: "name" },
          key: "name",
        },
      ];
      const copyMoveModalTableLoading = ref(false);
      const copyMoveModalTableData = reactive<TDir[]>([]);
      /** 选中要复制/移动的目标文件夹 默认选中'全部文件' */
      const copyMoveModalCurrentSelectedDir = ref("root");
      /** 选中的要复制/移动的文件的 id list */
      const copyMoveModalSelectedDirList = ref<string[]>([]);
      const getAndSetCopyMoveModalTableData = () => {
        copyMoveModalTableLoading.value = true;
        // 2021-07-05 先递归处理所有的目录, 后续要按需加载
        apiQueryFileByDir({ dirId: "root" }).then(async ([res, err]) => {
          if (err || !res) {
            // console.log("err", err);
            copyMoveModalTableLoading.value = false;
            return;
          }
          /** 根据目录id, 父目录id 去递归获取children */
          const getAndSetDirChildren = async (item: TDir, parentId: string) => {
            const [resItem, errItem] = await apiQueryFileByDir({
              dirId: item.dirId,
            });
            // console.log("目录res", item.dirId, item.dirName, resItem);
            if (errItem || !resItem) return item;
            // 排除 非目录文件/ 根目录/ 自身/ 父目录(上一级)
            const afterFilterList = resItem.data.driveListFiles.filter(
              (i): i is TFileItem =>
                i !== null &&
                i.isDir &&
                !["root", item.dirId, parentId].includes(i.id)
            );
            // console.log("afterFilterList", afterFilterList);
            if (!afterFilterList.length) return item;
            item.children = await Promise.all(
              afterFilterList.map((i) =>
                getAndSetDirChildren(
                  {
                    dirId: i.id,
                    dirName: lastOfArray(i.fullName),
                  },
                  item.dirId
                )
              )
            );
            return item;
          };
          // res.data.driveListFiles 提取文件夹的出来
          const resIsDirList = res.data.driveListFiles.filter(
            (i): i is TFileItem => i !== null && i.isDir && i.id !== "root"
          );
          const withChildrensDirList = await Promise.all(
            resIsDirList.map((i) =>
              getAndSetDirChildren(
                {
                  dirId: i.id,
                  dirName: lastOfArray(i.fullName),
                },
                "root"
              )
            )
          );
          const rootDir: TDir = {
            dirId: "root",
            dirName: t("metanet.allFiles"),
            children: withChildrensDirList,
          };
          copyMoveModalTableData.push(rootDir);
          copyMoveModalTableLoading.value = false;
        });
      };
      // getAndSetCopyMoveModalTableData();
      /** 确认按钮点击 */
      const onCopyMoveModalConfirm = () => {
        /** 是否复制操作 */
        const isActionCopy = currentCopyMoveModalTitle.value === "copy";
        // 检测是否复制/移动到自身
        if (
          copyMoveModalSelectedDirList.value.some(
            (fromId) => fromId === copyMoveModalCurrentSelectedDir.value
          )
        ) {
          message.warning(
            isActionCopy
              ? "不能将文件复制到自身或其子目录下"
              : "不能将文件移动到自身或其子目录下"
          );
          return;
        }
        return new Promise<void>((resolve) => {
          /** 是否全部成功 */
          let isAllSuccess = true;
          /** 统一的收尾 */
          const onFinally = () => {
            resolve();
            if (isAllSuccess) {
              message.success(isActionCopy ? "复制成功" : "移动成功");
            } else {
              message.success(isActionCopy ? "部分复制成功" : "部分移动成功");
            }
            // 关闭弹窗并刷新当前列表
            isShowCopyMoveModal.value = false;
            getAndSetTableDataFn(curFolderId.value);
          };
          const toId = copyMoveModalCurrentSelectedDir.value;
          // 移动/复制
          if (isActionCopy) {
            Promise.all(
              copyMoveModalSelectedDirList.value.map((fromId) =>
                apiCopyFileToDir({ fromId, toId })
              )
            )
              .then((resOfCopyList) => {
                // resOfCopyList: [[res,err],[res,err]...]
                // console.log("resOfCopyList", resOfCopyList);
                resOfCopyList.forEach(([r, e]) => {
                  if (e) {
                    isAllSuccess = false;
                    message.warning(e.message);
                  }
                });
              })
              .finally(onFinally);
          } else {
            Promise.all(
              copyMoveModalSelectedDirList.value.map((fromId) =>
                apiMoveFileToDir({
                  fromId,
                  toId,
                  fromSpace: "PRIVATE",
                  toSpace: "PRIVATE",
                })
              )
            )
              .then((resOfMoveList) => {
                // resOfMoveList: [[res,err],[res,err]...]
                // console.log("resOfMoveList", resOfMoveList);
                resOfMoveList.forEach(([r, e]) => {
                  if (e) {
                    isAllSuccess = false;
                    message.warning(e.message);
                  }
                });
              })
              .finally(onFinally);
          }
        });
      };
      /** 设置自定义行onClick 事件 */
      const copyMoveModalTableCustomRow = (record: TDir, index: number) => ({
        onClick: (e: {
          currentTarget: {
            dataset: {
              rowKey: string;
            };
          };
        }) => {
          // console.log(e.currentTarget.dataset.rowKey);
          copyMoveModalCurrentSelectedDir.value =
            e.currentTarget.dataset.rowKey;
        },
      });
      const copyMoveModalTableRowClassName = (record: TDir, index: number) => {
        return record.dirId === copyMoveModalCurrentSelectedDir.value
          ? "copyMoveModalRow copyMoveModalRowActive"
          : "copyMoveModalRow";
      };
      /** 设置要移动的idList,操作类型 */
      const onCopyMoveModalPreAction = (
        type: "move" | "copy",
        idList: string[]
      ) => {
        copyMoveModalCurrentSelectedDir.value = "root"; // 重置为全部文件
        copyMoveModalSelectedDirList.value.length = 0;
        copyMoveModalSelectedDirList.value.push(...idList);
        currentCopyMoveModalTitle.value = type;
        isShowCopyMoveModal.value = true;
        // 每次打开弹窗都获取最新的文件夹数据
        copyMoveModalTableData.length = 0;
        getAndSetCopyMoveModalTableData();
      };
      return {
        isShowCopyMoveModal,
        currentCopyMoveModalTitle,
        copyMoveTableColumns,
        copyMoveModalTableData,
        onCopyMoveModalConfirm,
        copyMoveModalCurrentSelectedDir,
        copyMoveModalSelectedDirList,
        copyMoveModalTableLoading,
        copyMoveModalTableCustomRow,
        copyMoveModalTableRowClassName,
        onCopyMoveModalPreAction,
      };
    }
    /** 检查对应位置的同名文件/ 文件夹 */
    const checkSameFileOrFolderNameByDirId = (
      type: "file" | "folder",
      fileOrFolderName: string,
      dirId: string
    ) => {
      return new Promise<void>((resolve, reject) => {
        apiQueryFileByDir({ dirId }).then(([res, err]) => {
          if (err || !res) {
            reject();
            return;
          }
          if (
            res.data.driveListFiles.some(
              (i) => i && lastOfArray(i.fullName) === fileOrFolderName
            )
          ) {
            message.warning(
              type === "file"
                ? "对应位置已经存在同名文件"
                : "对应位置已经存在同名文件夹"
            );
            reject();
          } else {
            resolve();
          }
        });
      });
    };
    const isShowShareFileModal = ref(false);
    /** 正在分享的文件 */
    const currentShareFile = reactive({
      name: "", // 文件(夹)名
      id: "", // 文件id
    });
    /** 弹窗 分享文件 */
    function useShareFileModal() {
      const shareFileModelRef: TShareCreate = reactive({
        type: "PUBLIC",
        expired: 7, // 有效期
        code: "", // 如果是私密文件,则需要访问码 后面传参数的时候如果还是空字符串则不要传这个参数
      });
      const shareFileRulesRef = reactive({
        expired: [
          {
            required: true,
            type: "number",
            message: t("metanet.requireFileName"),
          },
        ],
        code: [
          {
            required: true,
            asyncValidator: (rule: RuleObject, val: string) => {
              // console.log("code-validate", rule, val);
              return new Promise<void>((resolve, reject) => {
                // 如果是私有但还没写验证码,则报错
                if (shareFileModelRef.type === "PRIVATE" && val.length === 0) {
                  reject("请输入访问码");
                } else {
                  resolve();
                }
              });
            },
          },
        ],
      });
      const {
        resetFields,
        validate,
        validateInfos: shareFileValidateInfos,
      } = useForm(shareFileModelRef, shareFileRulesRef);
      const shareFileModalConfirmLoading = ref(false);
      const onShareFileModalConfirm = async () => {
        try {
          await validate();
          // 验证通过
          const { type, expired, code } = shareFileModelRef;
          const { name, id: fileId } = currentShareFile;
          shareFileModalConfirmLoading.value = true;
          const [res, err] = await apiShareCreate({
            userFileId: fileId,
            day: expired,
            ...(type === "PRIVATE"
              ? {
                  code: code,
                }
              : {}),
          });
          shareFileModalConfirmLoading.value = false;
          if (err) {
            message.warning(err.message);
            return;
          }
          message.success("分享成功");
          isShowShareFileModal.value = false;
          // 开始显示分享成功后的分享信息弹窗 -start
          currentSuccessShare.name = name;
          currentSuccessShare.url = `${window.location.href}?shareUri=${res?.data.driveCreateShare.uri}`;
          currentSuccessShare.code = code || "";
          currentSuccessShare.expired = expired;
          isShowSuccessShareModal.value = true;
          // 开始显示分享成功后的分享信息弹窗 -end
          onResetShareFileModalForm();
        } catch (error) {
          console.log(error);
        }
      };
      const onResetShareFileModalForm = () => {
        const ori = toRaw(shareFileModelRef);
        ori.type = "PUBLIC";
        ori.expired = 7;
        ori.code = "";
        currentShareFile.name = "";
        currentShareFile.id = "";
      };
      return {
        isShowShareFileModal,
        currentShareFile,
        shareFileModelRef,
        shareFileValidateInfos,
        shareFileModalConfirmLoading,
        onShareFileModalConfirm,
        onResetShareFileModalForm,
      };
    }
    const isShowSuccessShareModal = ref(false);
    const currentSuccessShare = reactive({
      name: "",
      url: "", // 分享链接
      code: "", // 提取码
      expired: 0, // 1 or 7 天有效期
    });
    /** 弹窗 分享链接 */
    function useSuccessShareModal() {
      /** 复制链接及访问码 */
      const onSuccessShareModalConfirm = () => {
        // console.log("onSuccessShareModalConfirm");
        const { url, code } = currentSuccessShare;
        const { username } = useUserStore();
        const codeText = code ? `访问码: ${code}` : "";
        const text = `链接: ${url} ${codeText} \n--来自0xWallet ${username}的分享`;
        const { copy } = useClipboard({ read: false });
        copy(text).then(() => message.success(t("metanet.copySuccess")));
      };
      /** 重置当前分享成功信息 */
      const onResetSuccessShareModalForm = () => {
        const ori = toRaw(currentSuccessShare);
        ori.name = "";
        ori.url = "";
        ori.code = "";
        ori.expired = 0;
      };
      const onCopySuccessShareInput = (type: "url" | "code") => {
        const text =
          type === "url" ? currentSuccessShare.url : currentSuccessShare.code;
        const { copy } = useClipboard({ read: false });
        copy(text).then(() => message.success(t("metanet.copySuccess")));
      };
      return {
        isShowSuccessShareModal,
        currentSuccessShare,
        onCopySuccessShareInput,
        onSuccessShareModalConfirm,
        onResetSuccessShareModalForm,
      };
    }
    const isShowPublishModal = ref(false);
    /** 正在发布的文件 */
    const currentPublish = reactive({
      name: "",
      id: "",
    });
    /** 获取发布下拉框选项,块变量,给其他函数access */
    let getPublishOptionList: () => Promise<void>;
    /** 弹窗 发布文件 */
    function usePublishModal() {
      const publishModelRef: TPublish = reactive({
        publishId: "new",
        tag: "", // 描述tag
      });
      const publishRulesRef = reactive({
        publishId: [
          {
            required: true,
            message: "请选择发布id",
          },
        ],
      });
      const publishModalOptionList = ref<TPublishOptionItem[]>([]);
      getPublishOptionList = async () => {
        // 先清空原来的
        publishModalOptionList.value.length = 0;
        const [res, err] = await apiQueryPublishList();
        if (err || !res) {
          return;
        }
        publishModalOptionList.value = res.data.driveListPublishs.map((i) => ({
          publishId: i.id,
          collectCount: i.collectedCount,
          txId: i.current.txid,
          fileId: i.current.userFile.id,
          fileName: lastOfArray(i.current.userFile.fullName),
          version: i.current.version,
          showText: `id-${i.id}/ 版本-${i.current.version}/ 收藏数-${
            i.collectedCount
          }/ ${lastOfArray(i.current.userFile.fullName)}`,
        }));
      };
      const {
        resetFields,
        validate,
        validateInfos: publishValidateInfos,
      } = useForm(publishModelRef, publishRulesRef);
      const publishModalConfirmLoading = ref(false);
      const onPublishModalConfirm = async () => {
        try {
          await validate();
          const { publishId, tag } = publishModelRef;
          publishModalConfirmLoading.value = true;
          const [res, err] =
            publishId === "new"
              ? await apiPublishCreate({
                  userFileId: currentPublish.id,
                })
              : await apiPublishUpdate({
                  userFileId: currentPublish.id,
                  id: publishId,
                });
          publishModalConfirmLoading.value = false;
          if (err) {
            message.warning(err.message);
            return;
          }
          message.success(t("metanet.publishSuccess"));
          isShowPublishModal.value = false;
          onResetPublishModalForm();
        } catch (error) {
          console.log(error);
        }
      };
      /** 重置发布弹窗的表单值 */
      const onResetPublishModalForm = () => {
        const ori = toRaw(publishModelRef);
        ori.publishId = "new";
        ori.tag = "";
      };
      return {
        isShowPublishModal,
        currentPublish,
        publishModelRef,
        publishValidateInfos,
        publishModalOptionList,
        publishModalConfirmLoading,
        onPublishModalConfirm,
        onResetPublishModalForm,
      };
    }
    const isShowCreateFileModal = ref(false);
    /** 弹窗 新建文件 */
    function useCreateFileModal() {
      const createFileModelRef: TCreateFile = reactive({
        fileType: "txt", // txt markdown
        fileName: "",
        fileDesc: "",
      });
      const createFileRulesRef = reactive({
        fileName: [
          {
            required: true,
            message: t("metanet.requireFileName"),
          },
        ],
      });
      const {
        resetFields,
        validate,
        validateInfos: createFileValidateInfos,
      } = useForm(createFileModelRef, createFileRulesRef);
      const createFileModalConfirmLoading = ref(false);
      const onCreateFileModalConfirm = async () => {
        try {
          await validate();
          // 验证通过
          const { fileType, fileName, fileDesc } = createFileModelRef;
          const isTxt = fileType === "txt";
          const fullFileName = `${fileName}${isTxt ? ".txt" : ".md"}`;
          checkSameFileOrFolderNameByDirId(
            "file",
            fullFileName,
            curFolderId.value
          ).then(async () => {
            // console.log("fullFileName", fullFileName, fileName);
            const file = new File([""], fullFileName, {
              type: isTxt ? "text/plain" : "text/markdown",
            });
            createFileModalConfirmLoading.value = true;
            const [res, err] = await apiUploadSingle({
              SourceFile: file,
              // 上传到不同的文件夹就要带上其名称在前面 (除了root)
              FullName: [
                ...historyDir.value.slice(1).map((i) => i.name),
                fullFileName,
              ],
              FileSize: file.size,
              UserId: useUserStore().id,
              Space: "PRIVATE",
              Description: fileDesc,
              Action: "drive",
            });
            createFileModalConfirmLoading.value = false;
            if (err) {
              message.warning(err.message);
              return;
            }
            message.success("新建成功");
            isShowCreateFileModal.value = false;
            onResetCreateFileModalForm();
            getAndSetTableDataFn(curFolderId.value);
          });
        } catch (error) {
          console.log(error);
        }
      };
      const onResetCreateFileModalForm = () => {
        const ori = toRaw(createFileModelRef);
        ori.fileType = "txt";
        ori.fileName = "";
        ori.fileDesc = "";
      };
      return {
        isShowCreateFileModal,
        createFileModelRef,
        createFileValidateInfos,
        createFileModalConfirmLoading,
        onCreateFileModalConfirm,
        onResetCreateFileModalForm,
      };
    }
    const isShowCreateFolderModal = ref(false);
    /** 弹窗 新建文件夹 */
    function useCreateFolderModal() {
      const createFolderModelRef: TCreateFolder = reactive({
        folderPrefix: "1", //1 当前路径 2根目录
        folderName: "",
        folderDesc: "",
      });
      const createFolderRulesRef = reactive({
        folderName: [
          {
            required: true,
            message: t("metanet.requireFolderName"),
          },
        ],
      });
      const {
        resetFields,
        validate,
        validateInfos: createFolderValidateInfos,
      } = useForm(createFolderModelRef, createFolderRulesRef);
      const createFolderModalConfirmLoading = ref(false);
      const onCreateFolderModalConfirm2 = () => {
        return new Promise<void>((resolve, reject) => {
          const onResolvedAndCloseModal = () => {
            resolve();
            isShowCreateFolderModal.value = false;
            onResetCreateFolderModalForm();
            message.success(t("metanet.successCreateFolder"));
            getAndSetTableDataFn(curFolderId.value);
          };
          validate()
            .then(() => {
              // 结构不需要toRaw
              const { folderPrefix, folderName, folderDesc } =
                createFolderModelRef;
              const isMakeDirByRoot = folderPrefix === "2";
              console.log("folderPrefix", folderPrefix, isMakeDirByRoot);

              if (isMakeDirByRoot) {
                checkSameFileOrFolderNameByDirId(
                  "folder",
                  folderName,
                  "root"
                ).then(() => {
                  apiMakeDirByRoot({
                    fullName: folderName,
                    description: folderDesc,
                  }).then(([res, err]) => {
                    err ? reject() : onResolvedAndCloseModal();
                  });
                });
              } else {
                checkSameFileOrFolderNameByDirId(
                  "folder",
                  folderName,
                  curFolderId.value
                ).then(() => {
                  apiMakeDirByPath({
                    fullName: folderName,
                    description: folderDesc,
                    parentId: curFolderId.value,
                  }).then(([res, err]) => {
                    err ? reject() : onResolvedAndCloseModal();
                  });
                });
              }
            })
            .catch(() => {
              resolve();
            });
        });
      };
      const onCreateFolderModalConfirm = async () => {
        const onFinishedAndCloseModal = () => {
          isShowCreateFolderModal.value = false;
          onResetCreateFolderModalForm();
          message.success(t("metanet.successCreateFolder"));
          getAndSetTableDataFn(curFolderId.value);
        };
        try {
          await validate();
          // 结构不需要toRaw
          const { folderPrefix, folderName, folderDesc } = createFolderModelRef;
          const isMakeDirByRoot = folderPrefix === "2";
          // console.log("folderPrefix", folderPrefix, isMakeDirByRoot);
          if (isMakeDirByRoot) {
            checkSameFileOrFolderNameByDirId("folder", folderName, "root").then(
              async () => {
                const [res, err] = await apiMakeDirByRoot({
                  fullName: folderName,
                  description: folderDesc,
                });
                if (err) {
                  message.warning(err.message);
                  return;
                }
                onFinishedAndCloseModal();
              }
            );
          } else {
            checkSameFileOrFolderNameByDirId(
              "folder",
              folderName,
              curFolderId.value
            ).then(async () => {
              const [res, err] = await apiMakeDirByPath({
                fullName: folderName,
                description: folderDesc,
                parentId: curFolderId.value,
              });
              if (err) {
                message.warning(err.message);
                return;
              }
              onFinishedAndCloseModal();
            });
          }
        } catch (error) {
          console.log(error);
        }
      };
      /** 重置为原始值 */
      const onResetCreateFolderModalForm = () => {
        const ori = toRaw(createFolderModelRef);
        ori.folderPrefix = "1";
        ori.folderName = "";
        ori.folderDesc = "";
      };
      return {
        isShowCreateFolderModal,
        createFolderModelRef,
        createFolderValidateInfos,
        createFolderModalConfirmLoading,
        onCreateFolderModalConfirm,
        onResetCreateFolderModalForm,
      };
    }
    // const isShowImportModal = ref(false);
    /** 弹窗 导入 */
    // function useImportModal() {
    //   const importModelRef: TImport = reactive({
    //     codeType: "hash", // txt markdown
    //     code: "",
    //   });
    //   const importRulesRef = reactive({
    //     code: [
    //       {
    //         required: true,
    //         message: '请输入代码',
    //       },
    //     ],
    //   });
    //   const {
    //     resetFields,
    //     validate,
    //     validateInfos: importValidateInfos,
    //   } = useForm(importModelRef, importRulesRef);
    //   const importModalConfirmLoading = ref(false);
    //    const onimportModalConfirm = async () => {
    //     try {
    //       await validate();
    //       // 验证通过
    //       const { codeType, code } = importModelRef;
    //       const isTxt = fileType === "txt";
    //       const fullFileName = `${fileName}${isTxt ? ".txt" : ".md"}`;
    //       // TODO 导入相同hash 的文件怎么办
    //         // console.log("fullFileName", fullFileName, fileName);
    //         const file = new File([""], fullFileName, {
    //           type: isTxt ? "text/plain" : "text/markdown",
    //         });
    //         importModalConfirmLoading.value = true;
    //         const [res, err] = await apiUploadSingle({
    //           SourceFile: file,
    //           // 上传到不同的文件夹就要带上其名称在前面 (除了root)
    //           FullName: [
    //             ...historyDir.value.slice(1).map((i) => i.name),
    //             fullFileName,
    //           ],
    //           FileSize: file.size,
    //           UserId: useUserStore().id,
    //           Space: "PRIVATE",
    //           Description: fileDesc,
    //           Action: "drive",
    //         });
    //         importModalConfirmLoading.value = false;
    //         if (err) {
    //           message.warning(err.message);
    //           return;
    //         }
    //         message.success("新建成功");
    //         isShowImportModal.value = false;
    //         onResetImportModalForm();
    //         getAndSetTableDataFn(curFolderId.value);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   };
    //   const onResetImportModalForm = () => {
    //     const ori = toRaw(importModelRef);
    //     ori.codeType = "hash";
    //     ori.code = "";
    //   };
    //   return {
    //     isShowImportModal,
    //     importModelRef,
    //     importModalConfirmLoading,
    //     onimportModalConfirm,
    //     onResetImportModalForm
    //   };
    // }
    /** action 里对record的操作 */
    function useActions() {
      /** 分享 */
      const onRecordShare = (record: TFileItem) => {
        // console.log("share", record);
        currentShareFile.name = lastOfArray(record.fullName);
        currentShareFile.id = record.id;
        isShowShareFileModal.value = true;
      };
      /** 发布 */
      const onRecordPublish = (record: TFileItem) => {
        // console.log("onRecordPublish", record);
        getPublishOptionList();
        currentPublish.name = lastOfArray(record.fullName);
        currentPublish.id = record.id;
        isShowPublishModal.value = true;
      };
      // 详情
      const onRecordDetail = (record: TFileItem) => {
        currenDetailInfo.value = {
          name: lastOfArray(record.fullName),
          location:
            historyDir.value
              .map((i) => (i.id === "root" ? "~" : i.name))
              .join("/") + "/",
          // curFolderId.value === "root"
          //   ? "~/"
          //   : `~/${lastOfArray(historyDir.value).name}`,
          type: getFileType({
            isDir: record.isDir,
            fileName: lastOfArray(record.fullName),
          }),
          size: formatBytes(+record.info.size),
          usedSpaceRatio:
            (
              (+record.info.size / +record.user.driveSetting.totalSpace) *
              100
            ).toFixed(3) + "%",
          insertedAt: dayjs(record.insertedAt).format("YYYY年MM月DD日hh:mm"),
          updatedAt: dayjs(record.updatedAt).format("YYYY年MM月DD日hh:mm"),
          desc: record.info.description || "无",
        };
        isShowDetailModal.value = true;
      };
      // 下载
      const currentRenameId = ref("");
      const currentRenameString = ref("");
      const renameInput =
        ref<{ focus: () => void; input: HTMLInputElement } | null>(null);
      /** 重命名 */
      const onRecordRename = (record: TFileItem) => {
        // console.log("onRecordRename", record);
        const toEditName = lastOfArray(record.fullName);
        currentRenameString.value = toEditName;
        currentRenameId.value = record.id;
        nextTick(() => {
          // console.log("renameInput", renameInput.value);
          // 设置默认选中编辑的文字区域
          const end = record.isDir
            ? toEditName.length
            : toEditName.lastIndexOf(".");
          renameInput.value?.input.setSelectionRange(0, end);
          renameInput.value?.focus();
        });
      };
      const onRecordRenameConfirm = async (record: TFileItem) => {
        // api success clear
        const [res, err] = await apiRename({
          id: currentRenameId.value,
          newName: currentRenameString.value,
          space: "PRIVATE",
        });
        if (err) {
          onResetRecordRenameState();
          message.warning(err.message);
          return;
        }
        // 这里暂时赋值, 保证视觉连贯性
        record.fullName = [currentRenameString.value];
        onResetRecordRenameState();
        getAndSetTableDataFn(curFolderId.value);
        message.success("重命名成功");
      };
      /** 清空编辑状态 */
      const onResetRecordRenameState = () => {
        currentRenameString.value = "";
        currentRenameId.value = "";
      };
      const onRecordDelete = (record: TFileItem) => {
        const fileName = lastOfArray(record.fullName);
        Modal.confirm({
          title: `是否删除${fileName}`,
          icon: createVNode(ExclamationCircleOutlined),
          onOk: async () => {
            const [res, err] = await apiSingleDelete({
              id: record.id,
              space: "PRIVATE",
            });
            if (err || !res) return;
            // if (res.data.driveDeleteFile === 1) {
            // }
            message.success(t("metanet.deleted"));
            getAndSetTableDataFn(curFolderId.value);
          },
        });
      };

      return {
        onRecordShare,
        onRecordPublish,
        onRecordDelete,
        onRecordDetail,
        currentRenameId,
        currentRenameString,
        renameInput,
        onRecordRename,
        onRecordRenameConfirm,
        onResetRecordRenameState,
      };
    }
    let getAndSetTableDataFn: (dirId: string) => void;

    // 记录目录
    const historyDir = ref<THistoryDirItem[]>([
      {
        id: "root",
        name: t("metanet.allFiles"),
      },
    ]);
    // 当前目录
    const curFolderId = computed(() => {
      const dirArr = historyDir.value;
      return lastOfArray(dirArr).id;
    });

    function useTableData() {
      /** 点击目录历史的面包屑 */
      const onClickHistoryDirUpperLevel = ({ id, name }: THistoryDirItem) => {
        // 删除后面的
        historyDir.value.splice(
          historyDir.value.findIndex((v) => v.id === id) + 1
        );
        // console.log("history", historyDir);
        onRefreshTableData();
      };
      /** 表格里每一行的名字的点击事件 */
      const onClickTableItemName = ({
        fileType: e,
        id,
        fullName,
      }: TFileItem) => {
        if (!e) return;
        // console.log("点击的当前record", e, id);
        // 原来的处理有 : 文件夹 / 图片 / md txt json文本 / pdf
        if (e === "folder") {
          const foundIndex = historyDir.value.findIndex((v) => v.id === id);
          if (foundIndex !== -1) {
            historyDir.value.splice(foundIndex + 1);
          } else {
            historyDir.value.push({
              id,
              name: lastOfArray(fullName),
            });
          }
          onRefreshTableData();
        } else if (FILE_TYPE_MAP.image.includes(e)) {
          console.log("todo type-image");
        } else if (FILE_TYPE_MAP.text.includes(e)) {
          console.log("todo type-text");
        } else if (FILE_TYPE_MAP.archive.includes(e)) {
          console.log("todo type-archive");
        } else if (FILE_TYPE_MAP.audio.includes(e)) {
          console.log("todo type-audio");
        } else if (FILE_TYPE_MAP.video.includes(e)) {
          console.log("todo type-video");
        } else {
          console.log("else unknown types");
          // type not found
        }
      };
      const columns = [
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
          // width: 100,
          // ellipsis: true,
        },
        // {
        //   title: t("metanet.type"),
        //   width: 100,
        //   customRender: ({
        //     record,
        //   }: {
        //     record: { isDir: boolean; fileType: string };
        //   }) => {
        //     return record.isDir ? "" : record.fileType;
        //   },
        // },
        {
          title: t("metanet.size"),
          dataIndex: "info.size",
          width: 100,
          customRender: ({
            record,
            text,
          }: {
            record: TFileItem;
            text: string;
          }) => {
            return record.isDir ? "" : formatBytes(+text);
          },
        },
        {
          title: "Hash",
          dataIndex: "hash",
          slots: { customRender: "hash" },
          width: 150,
        },
        {
          title: t("metanet.data"),
          dataIndex: "updatedAt",
          customRender: ({ text }: { text: string }) => {
            return text ? dayjs(text).format("YYYY-MM-DD hh:mm") : "";
          },
          width: 180,
        },
        {
          title: t("metanet.action"),
          fixed: "right",
          width: 60,
          slots: { customRender: "action" },
        },
      ];
      const tableLoading = ref(false);
      const tableData = ref<TFileList>([]);
      // 提供一个函数给外部
      getAndSetTableDataFn = (dirId) => {
        // 重置选中项目
        selectedRows.value.length = 0;
        selectedRowKeys.value.length = 0;
        tableLoading.value = true;
        apiQueryFileByDir({ dirId }).then(([res, err]) => {
          if (err || !res?.data.driveListFiles) return;
          // 如果返回的 fullName 是空数组的话 代表是根目录
          // 排除null 和 fullName是当前目录的数据(当前目录若不是root , 要加...返回上一级)
          // console.log("网盘文件获取", res);
          tableData.value = res.data.driveListFiles
            // 排序 文件夹在前
            // 加上类型
            .map((i) => {
              if (!i) return i;
              const obj = { ...i };
              // 如果是当前目录, 返回null , 下一步把它去除
              if (obj.id === dirId) return null;
              // 如果是父级目录, 变成...
              const hArr = historyDir.value;
              if (hArr.length > 1 && obj.id === hArr[hArr.length - 2].id) {
                obj.fullName = ["..."];
              } else {
                // 等于名字最后一项, 因为返回的是 [父级目录,item文件夹名] 所以取最后一个
                obj.fullName = [lastOfArray(obj.fullName)];
              }
              obj.fileType = getFileType({
                isDir: obj.isDir,
                fileName: obj.fullName[0],
              });
              return obj;
            })
            // filter 里用类型守卫去除null
            .filter((i): i is TFileItem => i !== null)
            // 排序文件夹,上级目录... 到表格最前面
            .sort(sortByDirType);
          // console.log("tabledData", tableData);
          tableLoading.value = false;
        });
      };
      getAndSetTableDataFn(curFolderId.value);
      /** 清除当前组件的select数据, 然后重新获取表格数据 */
      const onRefreshTableData = () => {
        getAndSetTableDataFn(curFolderId.value);
      };
      const onDownload = ({ user, space, id: fileId, fullName }: TFileItem) => {
        // TODO
        // Content-Disposition: attachment
        const hideLoadingMsg = message.loading("连接服务器中...", 0);
        apiGetPreviewToken()
          .then(([res, err]) => {
            if (err || !res) return;
            const token = res.data.drivePreviewToken;
            const url = `https://drive-s.owaf.io/download/${
              user.id
            }/${space.toLowerCase()}/${fileId}/${
              fullName.slice(-1)[0]
            }?token=${token}`;
            let el = document.createElement("a");
            // fireFox 要求el 在body中
            document.body.appendChild(el);
            el.type = "download";
            el.href = url;
            el.click();
            el.remove();
          })
          .finally(hideLoadingMsg);
      };
      return {
        historyDir,
        onClickTableItemName,
        onClickHistoryDirUpperLevel,
        onRefreshTableData,
        onDownload,
        columns,
        tableData,
        tableLoading,
      };
    }
    const uploadTaskList = ref<TUploadTaskItem[]>([]);
    const uploadTaskTotalProgress = computed(() => {
      const taskList = uploadTaskList.value.map((i) => i.progress);
      if (!taskList.length) return 0;
      const totalPercent = taskList.length * 100;
      const currentProgress = taskList.reduce((a, b) => a + b);
      return Math.floor((currentProgress / totalPercent) * 100);
    });
    /** 清除列表中非上传状态的数据 */
    const onRemoveTaskList = () => {
      const listOfUploading = uploadTaskList.value.filter(
        (v) => v.status === "uploading"
      );
      uploadTaskList.value.length = 0;
      if (listOfUploading.length) {
        message.warning("上传中的数据无法清除");
        uploadTaskList.value.push(...listOfUploading);
      }
    };
    /** 清除这条记录 */
    const onRemoveTaskItem = (item: TUploadTaskItem) => {
      if (item.status === "uploading") {
        message.warning("上传中,无法清除");
        return;
      }
      const foundIndex = uploadTaskList.value.findIndex(
        // 同文件不同名文件?
        (v) => v.fileName === item.fileName && v.fileHash === item.fileHash
      );
      if (foundIndex !== -1) uploadTaskList.value.splice(foundIndex, 1);
    };
    const isShowProgressDrawer = ref(false);
    /** 上传进度抽屉 */
    function useDrawer() {
      const onCloseProgressDrawer = () => {
        // console.log("onCloseProgressDrawer", onCloseProgressDrawer);
        isShowProgressDrawer.value = false;
      };

      const onToggleIsShowProgressDrawer = () => {
        isShowProgressDrawer.value = !isShowProgressDrawer.value;
      };
      const transformStatusText = (s: TUploadTaskItem["status"]) => {
        if (s === "uploading") return t("metanet.uploadStatusUploading");
        if (s === "success") return t("metanet.uploadStatusSuccess");
        if (s === "failed") return t("metanet.uploadStatusFailed");
      };
      return {
        uploadTaskList,
        onRemoveTaskList,
        onRemoveTaskItem,
        uploadTaskTotalProgress,
        isShowProgressDrawer,
        onCloseProgressDrawer,
        onToggleIsShowProgressDrawer,
        transformStatusText,
      };
    }
    /** nkn client 连接状态 */
    function useNknStatus() {
      // 连接中 3/4
      const nknClientConnectStatusMap = reactive({
        count: 0,
        text: "连接中",
      });
      // let readyClientCount = useUserStore().multiClient?.clients ?? 0
      const getStoreNknClientCount = () => {
        const multiClient = useUserStore().multiClient;
        if (!multiClient) return 0;
        else {
          // console.log(multiClient.readyClientIDs());
          return multiClient.readyClientIDs().length;
        }
      };
      nknClientConnectStatusMap.count = getStoreNknClientCount();
      let counterOfNknCLient = 0; // 用来猜测计时ws 连接fail 的时间
      let timer: number;
      /** 全局不断检测nkn节点状态 */
      const intervalGetClientCount = () => {
        timer = window.setTimeout(() => {
          counterOfNknCLient++;
          nknClientConnectStatusMap.count = getStoreNknClientCount();
          intervalGetClientCount();
          if (nknClientConnectStatusMap.count === NKN_SUB_CLIENT_COUNT) {
            nknClientConnectStatusMap.text = "就绪";
          } else if (counterOfNknCLient > 30) {
            // 30秒后
            if (nknClientConnectStatusMap.count === 0) {
              // 一个都没成功就自动重置
              useUserStore().resetMultiClient();
              nknClientConnectStatusMap.text = "重连中";
            } else {
              // 未能全部成功的话
              nknClientConnectStatusMap.text = "半连接"; // 半准备?
            }
          }
        }, 1000);
      };
      // 防止内存泄漏
      onUnmounted(() => {
        clearInterval(timer);
      });
      intervalGetClientCount();
      const nknClientConnectStatusShowText = computed(() => {
        const { count, text } = nknClientConnectStatusMap;
        return `${text} ${count}/${NKN_SUB_CLIENT_COUNT}`;
      });
      /** 重置nkn client */
      const onResetNknMultiClient = () => {
        Modal.confirm({
          title: "是否重置nkn multiClient?",
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            counterOfNknCLient = 0;
            nknClientConnectStatusMap.text = "连接中";
            useUserStore().resetMultiClient();
            // console.log("重置nkn multiClient", useUserStore().multiClient);
          },
        });
      };
      return { nknClientConnectStatusShowText, onResetNknMultiClient };
    }
    /** 当前详情数据 */
    const currenDetailInfo = ref<TDetailInfo>({});
    const isShowDetailModal = ref(false);
    /** 详情数据 */
    function useModalDetail() {
      /** 显示网盘详情 */
      const onShowDiskDetail = () => {
        // 类型	所有者	扩容 (列出扩容购买选项)
        // Type	Owner	Add More Space
        const diskDetail = reactive({
          type: "folder",
          owner: "Me",
          slotDiskUsagePercent: "",
          slotDiskUsageInfo: "",
          slotBuyMoreDisk: "",
        });
        currenDetailInfo.value = diskDetail;
        apiQueryMeSpace().then(([res, err]) => {
          if (err || !res) return;
          // currenDetailInfo.value.
          const { usedSpace, totalSpace, availableSpace } =
            res.data.me.driveSetting;
          diskDetail.slotDiskUsageInfo = `${formatBytes(
            +usedSpace
          )} / ${formatBytes(+totalSpace)}`;
          diskDetail.slotDiskUsagePercent = (
            (+usedSpace / +totalSpace) *
            100
          ).toFixed(0);
        });
        isShowDetailModal.value = true;
      };
      // 关闭弹窗时清空数据
      watch(
        () => isShowDetailModal.value,
        (val) => {
          if (val === false) {
            currenDetailInfo.value = {};
          }
        }
      );
      return {
        currenDetailInfo,
        isShowDetailModal,
        onShowDiskDetail,
      };
    }
    return {
      selectedRows,
      selectedRowKeys,
      ...useToolSet(),
      ...useCopyMoveModal(),
      ...useShareFileModal(),
      ...useSuccessShareModal(),
      ...usePublishModal(),
      ...useCreateFileModal(),
      ...useCreateFolderModal(),
      // ...useImportModal(),
      ...useActions(),
      ...useTableData(),
      ...useDrawer(),
      ...useNknStatus(),
      ...useModalDetail(),
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-breadcrumb-separator) {
  margin: 0 3px;
}
</style>

<style lang="less" >
#uploadDrawer {
  .ant-drawer-close {
    // color: yellow;
    // 这个 48 根据实测, 关联headerStyle的padding变动
    width: 47px;
    height: 47px;
    line-height: 47px;
  }
}

.copyMoveModalRow > td {
  cursor: pointer;
  border: none !important;
  // border-bottom: 1px solid #eff2f9;
}
.copyMoveModalRowActive > td {
  background: #bae7ff;
}
.renameButton {
  cursor: pointer;
  font-size: 17px;
  color: #1890ff;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
}
</style>