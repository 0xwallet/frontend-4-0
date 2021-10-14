<template>
  <div>
    <!-- 功能区 height 32px-->
    <div class="relative h-8 flex items-center mb-3 pl-0">
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

      <!-- 刷新按钮 -->
      <!-- <a-button class="mr-2" @click="onRefreshTableData">
        <SyncOutlined :spin="tableLoading" />
        {{ $t("metanet.refresh") }}
      </a-button> -->

      <!-- 处理选中数据按钮集合 -->
      <!-- TODO 分享多个? -->
      <!-- 下载 删除 重命名 复制到 移动到 -->
      <!-- <a-button-group class="mr-2" v-show="selectedRows.length">
        <a-button type="danger" @click="onBatchDelete">
          {{ $t("metanet.delete") }}
        </a-button>
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
      </a-button-group> -->
      <!-- 刷新按钮 -->
      <a-tooltip title="上一级目录">
        <a
          href="javascript:;"
          class="inline-block mr-2 px-1"
          @click="onUpperLevel"
        >
          <ArrowLeftOutlined />
        </a>
      </a-tooltip>
      <a-tooltip :title="$t('metanet.refresh')">
        <a
          href="javascript:;"
          class="inline-block mr-2 px-1"
          @click="onRefreshTableData"
        >
          <SyncOutlined :spin="tableLoading" />
        </a>
      </a-tooltip>
      <div
        class="flex-1 flex items-center px-3 mr-2"
        :style="{
          height: '28px',
          'border-radius': '50px',
          'background-color': '#f7f7f8',
        }"
      >
        <!-- 网盘使用信息 -->
        <a-tooltip title="网盘信息">
          <a class="mr-2" href="javascript:;" @click="onShowDiskDetail">
            <DatabaseOutlined />
          </a>
        </a-tooltip>
        <!-- 面包屑 目录历史索引 -->
        <a-breadcrumb class="flex-1">
          <template #separator>/</template>
          <template v-if="historyDir.length > 1">
            <a-breadcrumb-item
              :style="{
                color: 'rgba(0, 0, 0, 0.85)',
              }"
              v-for="(hItem, hItemIdx) in historyDir.slice(0, -1)"
              :key="hItem.id"
            >
              <a
                @click="onClickHistoryDirUpperLevel(hItemIdx)"
                style="color: #1890ff"
                >{{ hItem.name }}</a
              >
            </a-breadcrumb-item>
          </template>
          <a-breadcrumb-item
            :style="{
              color: 'rgba(0, 0, 0, 0.85)',
            }"
            >{{ $lastOfArray(historyDir).name }}</a-breadcrumb-item
          >
          <template v-if="currentClickItem.name.length > 0">
            <a-breadcrumb-item
              :style="{
                color: 'rgba(0, 0, 0, 0.85)',
              }"
            >
              {{ currentClickItem.name }}
            </a-breadcrumb-item>
          </template>
        </a-breadcrumb>
        <a-tooltip :title="getIsShareText()">
          <!-- 点击class 为notInClickOutSide 的元素的时候 clickOutSide 不运行 -->
          <a href="javascript:;" class="cursor-default">
            <!-- 切换是否显示当前点击项的分享状态 -->
            <StarFilled
              v-if="
                currentClickItem.name.length > 0
                  ? isCurClickItemShared
                  : isCurFolderShared
              "
              :style="{ color: '#faad14' }"
            />
            <StarOutlined class="notInClickOutSide" v-else />
          </a>
        </a-tooltip>
      </div>
      <div class="relative h-full" :style="{ width: '178px' }">
        <transition name="no-mode-fade">
          <!-- different key forceUdpate -->
          <div key="1" class="absolute" v-if="selectedRows.length === 0">
            <!-- 下拉 - 上传 -->
            <a-dropdown class="mr-2">
              <template #overlay>
                <a-menu @click="onClickDropDownMenuUpload">
                  <a-menu-item key="file">{{
                    $t("metanet.uploadFile")
                  }}</a-menu-item>
                  <a-menu-item key="folder">{{
                    $t("metanet.uploadFolder")
                  }}</a-menu-item>
                </a-menu>
              </template>
              <a-button type="primary" shape="round">
                <CloudUploadOutlined />
                {{ $t("metanet.uploadButton") }}
              </a-button>
            </a-dropdown>
            <!-- 下拉 - 新建 -->
            <a-dropdown class="">
              <template #overlay>
                <a-menu @click="onClickDropDownMenuCreate">
                  <!-- 新建文件 -->
                  <a-menu-item key="file">{{
                    $t("metanet.createFile")
                  }}</a-menu-item>
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
              <a-button type="primary" shape="round">
                <FolderAddOutlined />
                {{ $t("metanet.create") }}
              </a-button>
            </a-dropdown>
          </div>
          <div key="2" class="absolute" v-else>
            <!-- 移动 -->
            <a-button
              class="mr-2 ant-btn-cyan"
              shape="round"
              @click="
                onCopyMoveModalPreAction(
                  'move',
                  selectedRows.map((i) => i.id)
                )
              "
            >
              <DragOutlined />
              <!-- {{ $t("metanet.buttonMoveTo") }} -->
              移动
            </a-button>
            <!-- 下拉 - 新建 -->
            <a-dropdown class="">
              <template #overlay>
                <a-menu>
                  <!-- 复制 -->
                  <a-menu-item
                    key="file"
                    @click="
                      onCopyMoveModalPreAction(
                        'copy',
                        selectedRows.map((i) => i.id)
                      )
                    "
                    >复制</a-menu-item
                  >
                  <!-- 删除 -->
                  <a-menu-item key="folder" @click="onBatchDelete"
                    >删除</a-menu-item
                  >
                </a-menu>
              </template>
              <a-button class="ant-btn-cyan" shape="round">
                <BarsOutlined />
                更多
              </a-button>
            </a-dropdown>
          </div>
        </transition>
      </div>
    </div>
    <!-- 表格 -->
    <XTableFiles
      ref="fileTableRef"
      rowKey="id"
      :rowClassName="rowClassName"
      :customRow="customRow"
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
            @click.stop="onClickItemName(record)"
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
              @pressEnter="onRecordRenameConfirm(record)"
            />
            <CheckSquareOutlined
              class="ml-1 shortcutButton"
              @click.stop="onRecordRenameConfirm(record)"
            />
            <CloseSquareOutlined
              class="ml-1 shortcutButton"
              @click.stop="onResetRecordRenameState"
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
                class="shortcutButton ml-1"
                href="javascript:;"
                @click.stop="onRecordDetail(record)"
                ><InfoCircleOutlined
              /></a>
            </a-tooltip>
            <!-- 重命名 -->
            <a-tooltip title="重命名">
              <a
                class="shortcutButton ml-1"
                href="javascript:;"
                @click.stop="onRecordRename(record)"
                ><EditOutlined
              /></a>
            </a-tooltip>
            <!-- 分享 -->
            <a-tooltip title="分享">
              <a
                class="shortcutButton ml-1"
                href="javascript:;"
                @click.stop="onRecordShare(record)"
                ><ShareAltOutlined
              /></a>
            </a-tooltip>
            <!-- 下载 -->
            <!-- 非文件夹才显示 -->
            <a-tooltip v-if="!record.isDir" title="下载">
              <a
                class="shortcutButton ml-1"
                href="javascript:;"
                @click.stop="onDownload(record)"
                ><DownloadOutlined
              /></a>
            </a-tooltip>
            <!-- 删除 -->
            <a-tooltip title="删除">
              <a
                class="shortcutButton ml-1 ant-color-danger text-red-500"
                href="javascript:;"
                @click.stop="onRecordDelete(record)"
                :style="{
                  color: '#ff7875',
                }"
                ><DeleteOutlined
              /></a>
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #hash="{ record }">
        <XTdHash v-if="record && record.hash" :hash="record.hash" />
      </template>
      <template #action="{ record }">
        <!-- <a-button-group size="small">
          <a-button @click="onDownload(record)">
            {{ $t("metanet.downloadButton") }}
          </a-button>
          <a-button type="danger">{{ $t("metanet.delButton") }}</a-button>
        </a-button-group> -->
        <a-dropdown
          class="rounded-xl"
          placement="bottomRight"
          :trigger="['hover', 'click']"
        >
          <div class="text-center">
            <!-- <a href="javascript:void(0)" class="ant-color-blue-6">...</a> -->
            <a href="javascript:'">
              <EllipsisOutlined class="cursor-pointer" />
            </a>
          </div>
          <template #overlay>
            <a-menu class="rounded-xl">
              <!-- 详情 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordDetail(record)"
              >
                <InfoCircleOutlined />
                详情
              </a-menu-item>
              <!-- 分享 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordShare(record)"
              >
                <ShareAltOutlined />
                {{ $t("metanet.shareButton") }}
              </a-menu-item>
              <!-- 发布 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordPublish(record)"
              >
                <ApartmentOutlined />
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
                <DownloadOutlined />
                {{ $t("metanet.downloadButton") }}
              </a-menu-item>
              <!-- 移动 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onCopyMoveModalPreAction('move', [record.id])"
              >
                <DragOutlined />
                {{ $t("metanet.buttonMoveTo") }}
              </a-menu-item>
              <!-- 复制 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onCopyMoveModalPreAction('copy', [record.id])"
              >
                <CopyOutlined />
                {{ $t("metanet.buttonCopyTo") }}
              </a-menu-item>
              <!-- 重命名 -->
              <a-menu-item
                class="px-4 flex items-center"
                @click="onRecordRename(record)"
              >
                <EditOutlined />
                {{ $t("metanet.rename") }}
              </a-menu-item>
              <!-- 删除 -->
              <a-menu-item
                class="px-4 flex items-center text-red-500"
                @click="onRecordDelete(record)"
              >
                <DeleteOutlined />
                {{ $t("metanet.delButton") }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </XTableFiles>
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
                class="ant-color-blue-6"
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
                class="ant-color-blue-6"
                href="javascript:;"
                >{{ $t("metanet.copyButton") }}</a
              >
            </template>
          </a-input>
        </a-col>
      </a-row>
      <a-row>
        <a-col
          >链接<span class="ant-color-blue-6"
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
          <a-textarea
            placeholder="可用两个#来表示标签, 例如#标签1#"
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
          <a-textarea
            placeholder="可用两个#来表示标签, 例如#标签1#"
            :maxlength="200"
            v-model:value="createFolderModelRef.folderDesc"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 弹窗 - 修改描述 -->
    <a-modal
      :destroyOnClose="true"
      v-model:visible="isShowEditDescriptionModal"
      :title="`编辑描述-${editDescriptionModalRef.name}`"
      :confirmLoading="editDescriptionModalConfirmLoading"
      @ok="onEditDescriptionModalConfirm"
    >
      <!-- <a-form> </a-form> -->
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
        <a-form-item>
          <a-tooltip title="支持markdown语法, 可用两个#来表示标签, 例如#标签1#">
            <a-textarea
              :autoSize="{ minRows: 6 }"
              placeholder="支持markdown语法, 可用两个#来表示标签, 例如#标签1#"
              v-model:value="editDescriptionModalRef.desc"
            />
          </a-tooltip>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 弹窗 复制/移动 -->
    <!-- <a-modal
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
        <template #name="{ record }">
          <div class="inline-block">
            <XFileTypeIcon class="w-4 h-4" type="folder" />
            <a href="javascript:;" class="ml-1">{{ record.dirName }}</a>
          </div>
        </template>
      </a-table>
    </a-modal> -->
    <XModalDir
      rowKey="dirId"
      v-model:visible="isShowCopyMoveModal"
      :title="
        currentCopyMoveModalTitle === 'copy'
          ? $t('metanet.buttonCopyTo')
          : $t('metanet.buttonMoveTo')
      "
      @ok="onCopyMoveModalConfirm"
      :rowClassName="copyMoveModalTableRowClassName"
      :columns="copyMoveTableColumns"
      :dataSource="copyMoveModalTableData"
      :customRow="copyMoveModalTableCustomRow"
      :loading="copyMoveModalTableLoading"
    />
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
    <ModalDetail
      v-model:visible="isShowDetailModal"
      :detail="currentDetailInfo"
    >
      <!-- <template #name="{ value }">
        <div>i am the name--{{ value }}</div>
      </template> -->
      <template
        v-if="currentDetailInfo.slotDiskUsageInfo"
        #slotDiskUsagePercent
      >
        <a-tooltip
          :title="`总空间 ${
            currentDetailInfo.slotDiskUsageInfo.split(' / ')[1]
          }, 已使用 ${currentDetailInfo.slotDiskUsageInfo.split(' / ')[0]}`"
        >
          <a-row class="mb-1" justify="space-between">
            <a-col :span="6" class="ant-color-gray">空间使用</a-col>
            <a-col :span="17">
              <a-progress :percent="+currentDetailInfo.slotDiskUsagePercent" />
            </a-col>
          </a-row>
        </a-tooltip>
      </template>
      <template v-if="currentDetailInfo.slotDiskUsageInfo" #slotBuyMoreDisk>
        <a-row class="mb-1" justify="space-between">
          <a-col :span="6" class="ant-color-gray"></a-col>
          <a-col :span="17" class="pt-4">
            <a-button type="primary" shape="round">{{
              $t("metanet.buyStorage")
            }}</a-button>
          </a-col>
        </a-row>
      </template>
      <template #rawDescription><div></div></template>
      <!-- <template #rawDescription="{ record }">
        <a-row class="mb-1" justify="space-between">
          <a-col class="ant-color-gray" :span="6"
            >描述
            <a-tooltip title="编辑描述">
              <a
                href="javascript:;"
                class="ml-2"
                @click="onShowDescriptionModal"
              >
                <EditOutlined />
              </a>
            </a-tooltip>
          </a-col>
          <a-col :span="17">
            <template v-if="record.desc.tagArr.length">
              <a-tag
                v-for="item in record.desc.tagArr"
                color="orange"
                :key="item"
                class="mb-1"
                >{{ item }}</a-tag
              >
            </template>
            {{ record.desc.text }}
          </a-col>
        </a-row>
      </template> -->
      <template #bottom="{ record }">
        <div class="relative">
          <div
            class="p-4 mt-4"
            :style="{
              border: '1px solid #eff2f9',
              'border-radius': '12px',
            }"
          >
            <XMdParser
              v-if="record.rawDescription"
              :content="record.rawDescription"
            />
            <div v-else class="text-gray-400 text-center">暂无描述</div>
          </div>
          <div
            class="absolute ant-color-gray"
            :style="{
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0 10px',
              background: '#fff',
            }"
          >
            描述
            <a href="javascript:;">
              <EditOutlined @click="onShowDescriptionModal" />
            </a>
          </div>
        </div>
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
  onActivated,
} from "vue";
import {
  DownOutlined,
  CloudUploadOutlined,
  DragOutlined,
  BarsOutlined,
  ArrowLeftOutlined,
  SyncOutlined,
  RocketOutlined,
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
  CopyOutlined,
  ApartmentOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";
import ModalDetail, { TDetailInfo } from "./ModalDetail.vue";
import {
  XTableFiles,
  XFileTypeIcon,
  XTdHash,
  XModalDir,
  XMdParser,
} from "../../../components";
import { useI18n } from "vue-i18n";
import {
  apiBatchDelete,
  apiCopyFileToDir,
  apiEditFileDescption,
  apiGetPreviewToken,
  apiMakeDirByPath,
  apiMakeDirByRoot,
  apiMoveFileToDir,
  apiPublishCreate,
  apiPublishUpdate,
  apiQueryDirSize,
  apiQueryFileByDir,
  apiQueryMeSpace,
  apiQueryPublishList,
  apiQueryShareFileList,
  apiRename,
  apiShareCreate,
  apiSingleDelete,
  apiUploadSingle,
  ParamsQueryFileByDir,
  TFileItem,
  TFileList,
} from "@/apollo/api";
import dayjs from "dayjs";
import { assign, isEqual } from "lodash-es";
import { message, Modal } from "ant-design-vue";
import { useBaseStore, useTransportStore, useUserStore } from "@/store";
import {
  DescObj,
  useDelay,
  downloadFileByUrl,
  exactUniqueTabId,
  formatBytes,
  cacheFormatDescription,
  getFileSHA256,
  getFileType,
  lastOfArray,
  makeShareUrlByUri,
} from "@/utils";
import { FILE_TYPE_MAP, PRODUCT_NAME } from "@/constants";
import { useForm } from "@ant-design-vue/use";
import { RuleObject } from "ant-design-vue/lib/form/interface";
import { useClipboard, onClickOutside } from "@vueuse/core";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { api as viewerApi } from "v-viewer";

export type THistoryDirItem = {
  name: string;
  isShared: boolean;
};
// type UploadItem = {
//   fileHash: string; // 文件的id
//   fileName: string; // 文件名称
//   fileType: string;
//   fileSize: string;
//   progress: number;
//   status: "uploading" | "success" | "failed";
//   speed: string; // 2m / s
// };
export type TDir = {
  dirId: string;
  dirName: string;
  parent: null | TDir;
  /** 是否展开 */
  isExpend: boolean;
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
/** 创建4位访问码 */
function makeRandomCode(count: number) {
  /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  return Array(count)
    .fill(null)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}
export default defineComponent({
  name: "FileItem",
  components: {
    // icon
    // DownOutlined,
    CloudUploadOutlined,
    DragOutlined,
    BarsOutlined,
    ArrowLeftOutlined,
    SyncOutlined,
    RocketOutlined,
    FolderAddOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    GlobalOutlined,
    InfoCircleOutlined,
    DatabaseOutlined,
    CheckSquareOutlined,
    CloseSquareOutlined,
    EditOutlined,
    CopyOutlined,
    ApartmentOutlined,
    ShareAltOutlined,
    StarFilled,
    StarOutlined,
    DownloadOutlined,
    //
    XTableFiles,
    XFileTypeIcon,
    XTdHash,
    XModalDir,
    XMdParser,
    ModalDetail,
  },
  setup() {
    const { t } = useI18n();
    const selectedRows = ref<TFileItem[]>([]);
    const selectedRowKeys = ref<string[]>([]);
    const transportStore = useTransportStore();
    const baseStore = useBaseStore();
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
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
        // console.log("onClickDropDownMenuUpload", key);
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
              resOfDeleteDirs.forEach(({ err }) => {
                if (err) message.warning(err.message);
              });
            }
            if (idOfFiles.length) {
              const resultBatchDelete = await apiBatchDelete({
                ids: selectedRows.value.map((i) => i.id),
                space: "PRIVATE",
              });
              if (resultBatchDelete.err) return;
              const { driveDeleteFiles } = resultBatchDelete.data;
              if (driveDeleteFiles === idOfFiles.length) {
                message.success(t("metanet.deleted"));
              }
            }
            getAndSetTableDataFn({
              fullName: requestDirNameList.value,
            });
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
        const resultQuerySpace = await apiQueryMeSpace();
        if (resultQuerySpace.err) {
          return;
        }
        const { availableSpace } = resultQuerySpace.data.me.driveSetting;
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
        input.value = "";
        if (!sizeCanUploadFiles.length) {
          input.value = "";
          return;
        }
        try {
          // 如果当前没有任务正在上传, 增加回合id
          if (!transportStore.uploadingList.length) {
            transportStore.plusCurRoundId();
          }
          Promise.all(
            sizeCanUploadFiles.map((i) =>
              onUploadSingleFile(i, transportStore.uploadCurRoundId)
            )
          );
          router.push({
            name: "TransportUploading",
          });
          // console.log("resOfAll", resOfAll);
        } catch (error) {
          console.log("上传文件错误", error);
        }
        // input.value = "";
      };
      /** 上传文件夹 */
      const onChangeMultipleUploadFolder = async (e: Event) => {
        const input = e.target as HTMLInputElement;
        if (!input.files?.length) return;
        // 创建文件夹 直接传fullName 会自动创建文件夹
        const resultQuerySpace = await apiQueryMeSpace();
        if (resultQuerySpace.err) {
          return;
        }
        const { availableSpace } = resultQuerySpace.data.me.driveSetting;
        // 如果即将要传的文件总大小超出可用, 退出
        if (
          [...input.files].reduce((a, b) => (a += b.size), 0) > +availableSpace
        ) {
          message.warning("超出最大可用容量!");
          input.value = "";
          return;
        }
        const sizeCanUploadFiles = [...input.files] as TFileWithFolderPath[];
        input.value = "";
        if (!sizeCanUploadFiles.length) {
          return;
        }
        try {
          // 如果当前没有任务正在上传, 增加回合id
          if (!transportStore.uploadingList.length) {
            transportStore.plusCurRoundId();
          }
          Promise.all(
            sizeCanUploadFiles.map((i) =>
              onUploadSingleFile(
                i,
                transportStore.uploadCurRoundId,
                i.webkitRelativePath.split("/")
              )
            )
          );
          router.push({
            name: "TransportUploading",
          });
          // console.log("resOfAll", resOfAll);
        } catch (error) {
          console.log("上传文件错误", error);
        }
        // input.value = "";
      };
      /** 上传单个文件 */
      const onUploadSingleFile = async (
        file: File,
        roundId: number,
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
        const fileName = file.name;
        const fileHash = await getFileSHA256(file);
        // const resultUploadSingle =
        await transportStore.uploadFile({
          file,
          fileHash,
          roundId,
          fileType: getFileType({
            isDir: false,
            fileName,
          }),
          fullName: [
            ...historyDir.value.slice(1).map((i) => i.name),
            ...(withPathFileNameArr?.length ? withPathFileNameArr : [fileName]),
          ],
          description: "",
          action: "drive",
        });
        // console.log("resultUploadSingle", resultUploadSingle);
      };
      return {
        onClickDropDownMenuCreate,
        onClickDropDownMenuUpload,
        onBatchDelete,
        onDownloadBatch,
        onChangeMultipleUploadFile,
        onChangeMultipleUploadFolder,
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
      // const copyMoveModalCurrentSelectedDir = ref("root");
      const copyMoveModalCurrentSelectedDir = ref<TDir>({
        dirId: "root",
        dirName: "全部文件",
        parent: null,
        isExpend: true,
      });
      /** 选中的要复制/移动的文件的 id list */
      const copyMoveModalSelectedDirList = ref<string[]>([]);
      const getAndSetCopyMoveModalTableData = () => {
        copyMoveModalTableLoading.value = true;
        // 2021-07-05 先递归处理所有的目录, 后续要按需加载
        apiQueryFileByDir({ dirId: "root" }).then(async (resultQueryFile) => {
          if (resultQueryFile.err) {
            // console.log("err", err);
            copyMoveModalTableLoading.value = false;
            return;
          }
          /** 根据目录id, 父目录id 去递归获取children */
          const getAndSetDirChildren = async (item: TDir) => {
            const parentId = item.parent?.dirId;
            // const [resItem, errItem] = await apiQueryFileByDir({
            const resultQueryFileItem = await apiQueryFileByDir({
              dirId: item.dirId,
            });
            // console.log("目录res", item.dirId, item.dirName, resItem);
            if (resultQueryFileItem.err) return item;
            // 排除 非目录文件/ 根目录/ 自身/ 父目录(上一级)
            const afterFilterList =
              resultQueryFileItem.data.driveListFiles.filter(
                (i): i is TFileItem =>
                  i !== null &&
                  i.isDir &&
                  !["root", item.dirId, parentId].includes(i.id)
              );
            // console.log("afterFilterList", afterFilterList);
            if (!afterFilterList.length) return item;
            item.children = await Promise.all(
              afterFilterList.map((i) =>
                getAndSetDirChildren({
                  dirId: i.id,
                  dirName: lastOfArray(i.fullName),
                  parent: item,
                  isExpend: false,
                })
              )
            );
            return item;
          };
          // res.data.driveListFiles 提取文件夹的出来
          const resIsDirList = resultQueryFile.data.driveListFiles.filter(
            (i): i is TFileItem => i !== null && i.isDir && i.id !== "root"
          );
          const withChildrensDirList = await Promise.all(
            resIsDirList.map((i) =>
              getAndSetDirChildren({
                dirId: i.id,
                dirName: lastOfArray(i.fullName),
                isExpend: false,
                parent: {
                  dirId: "root",
                  dirName: "root",
                  parent: null,
                  isExpend: true,
                },
              })
            )
          );
          const rootDir: TDir = {
            dirId: "root",
            dirName: t("metanet.allFiles"),
            isExpend: true,
            parent: null,
            children: withChildrensDirList,
          };
          copyMoveModalTableData.push(rootDir);
          // console.log(
          //   "获取api后的copyMoveModalTableData",
          //   copyMoveModalTableData
          // );
          copyMoveModalTableLoading.value = false;
        });
      };
      // getAndSetCopyMoveModalTableData();
      /** 确认按钮点击 */
      const onCopyMoveModalConfirm = () => {
        /** 是否复制操作 */
        const isActionCopy = currentCopyMoveModalTitle.value === "copy";
        /** 检查 选中的文件(要移动的) 是不是 目的文件夹 的父级 */
        const checkParentSameId = (fromId: string, item: TDir) => {
          let parent: null | TDir = item.parent;
          while (parent !== null) {
            if (parent.dirId === fromId) return true;
            parent = parent.parent;
          }
          return false;
        };
        // 检测是否复制/移动到自身
        // TODO 检测是否复制/移动到自身的子目录下
        if (
          copyMoveModalSelectedDirList.value.some(
            (fromId) =>
              fromId === copyMoveModalCurrentSelectedDir.value.dirId ||
              checkParentSameId(fromId, copyMoveModalCurrentSelectedDir.value)
          )
        ) {
          message.warning(
            isActionCopy
              ? "不能复制到自身或其子目录下"
              : "不能移动到自身或其子目录下"
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
            getAndSetTableDataFn({ fullName: requestDirNameList.value });
          };
          const toId = copyMoveModalCurrentSelectedDir.value.dirId;
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
                resOfCopyList.forEach(({ err }) => {
                  if (err) {
                    isAllSuccess = false;
                    message.warning(err.message);
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
                resOfMoveList.forEach(({ err }) => {
                  if (err) {
                    isAllSuccess = false;
                    message.warning(err.message);
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
          console.log("copyMoveModalTableCustomRow", record);
          // console.log(e.currentTarget.dataset.rowKey);
          copyMoveModalCurrentSelectedDir.value = record;
        },
      });
      const copyMoveModalTableRowClassName = (record: TDir, index: number) => {
        return record.dirId === copyMoveModalCurrentSelectedDir.value.dirId
          ? "copyMoveModalRow copyMoveModalRowActive"
          : "copyMoveModalRow";
      };
      /** 设置要移动的idList,操作类型 */
      const onCopyMoveModalPreAction = (
        type: "move" | "copy",
        idList: string[]
      ) => {
        // 重置为全部文件
        copyMoveModalCurrentSelectedDir.value = {
          dirId: "root",
          dirName: "全部文件",
          isExpend: true,
          parent: null,
        };
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
      fullName: string[]
    ) => {
      return new Promise<void>((resolve, reject) => {
        apiQueryFileByDir({ fullName }).then((resultQueryFile) => {
          if (resultQueryFile.err) {
            reject();
            return;
          }
          if (
            resultQueryFile.data.driveListFiles.some(
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
      // 每次打开分享弹窗就新建个默认访问码
      watch(
        () => isShowShareFileModal.value,
        (newVal) => {
          if (newVal === true) shareFileModelRef.code = makeRandomCode(4);
        },
        {
          immediate: true,
        }
      );
      const shareFileRulesRef = reactive({
        expired: [
          {
            required: true,
            type: "number",
            message: "请输入有效数字",
            // message: t("metanet.requireFileName"),
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
          const resultShareCreate = await apiShareCreate({
            userFileId: fileId,
            expiredAfterDays: shareFileModelRef.expired,
            code: type === "PRIVATE" ? (code as string) : "",
          });
          shareFileModalConfirmLoading.value = false;
          if (resultShareCreate.err) {
            message.warning(resultShareCreate.err.message);
            return;
          }
          message.success("分享成功");
          isShowShareFileModal.value = false;
          // 开始显示分享成功后的分享信息弹窗 -start
          currentSuccessShare.name = name;
          currentSuccessShare.url = makeShareUrlByUri(
            resultShareCreate.data.driveCreateShare.uri
          );
          currentSuccessShare.code = type === "PRIVATE" ? code || "" : "";
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
        const text = `链接: ${url} ${codeText} \n--来自${PRODUCT_NAME} ${username}的分享`;
        useClipboard({ read: false })
          .copy(text)
          .then(() => message.success(t("metanet.copySuccess")));
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
        const resultQueryPublishList = await apiQueryPublishList();
        if (resultQueryPublishList.err) {
          return;
        }
        publishModalOptionList.value =
          resultQueryPublishList.data.driveListPublishs.map((i) => ({
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
          const resultPublishCreateOrUpdate =
            publishId === "new"
              ? await apiPublishCreate({
                  userFileId: currentPublish.id,
                })
              : await apiPublishUpdate({
                  userFileId: currentPublish.id,
                  id: publishId,
                });
          publishModalConfirmLoading.value = false;
          if (resultPublishCreateOrUpdate.err) {
            message.warning(resultPublishCreateOrUpdate.err.message);
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
            requestDirNameList.value
          ).then(async () => {
            // console.log("fullFileName", fullFileName, fileName);
            const file = new File([""], fullFileName, {
              type: isTxt ? "text/plain" : "text/markdown",
            });
            createFileModalConfirmLoading.value = true;
            const fileHash = await getFileSHA256(file);
            const resultUploadSingle = await apiUploadSingle({
              isCreateNewFile: true,
              file: file,
              // 上传到不同的文件夹就要带上其名称在前面 (除了root)
              fullName: [
                ...historyDir.value.slice(1).map((i) => i.name),
                fullFileName,
              ],
              fileHash,
              userId: useUserStore().id,
              space: "PRIVATE",
              description: fileDesc,
              action: "drive",
            });
            createFileModalConfirmLoading.value = false;
            if (resultUploadSingle.err) {
              message.warning(resultUploadSingle.err.message);
              return;
            }
            message.success("新建成功");
            isShowCreateFileModal.value = false;
            onResetCreateFileModalForm();
            getAndSetTableDataFn({ fullName: requestDirNameList.value });
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
      const onCreateFolderModalConfirm = async () => {
        const onFinishedAndCloseModal = () => {
          isShowCreateFolderModal.value = false;
          onResetCreateFolderModalForm();
          message.success(t("metanet.successCreateFolder"));
          getAndSetTableDataFn({ fullName: requestDirNameList.value });
        };
        try {
          await validate();
          // 结构不需要toRaw
          const { folderPrefix, folderName, folderDesc } = createFolderModelRef;
          const isMakeDirByRoot = folderPrefix === "2";
          // console.log("folderPrefix", folderPrefix, isMakeDirByRoot);
          if (isMakeDirByRoot) {
            checkSameFileOrFolderNameByDirId("folder", folderName, []).then(
              async () => {
                const resultMakeDirByRoot = await apiMakeDirByRoot({
                  fullName: folderName,
                  description: folderDesc,
                });
                if (resultMakeDirByRoot.err) {
                  message.warning(resultMakeDirByRoot.err.message);
                  return;
                }
                onFinishedAndCloseModal();
              }
            );
          } else {
            checkSameFileOrFolderNameByDirId(
              "folder",
              folderName,
              requestDirNameList.value
            ).then(async () => {
              const resultMakeDirByPath = await apiMakeDirByPath({
                fullName: folderName,
                description: folderDesc,
                //
                parentId: curFolderId.value,
              });
              if (resultMakeDirByPath.err) {
                message.warning(resultMakeDirByPath.err.message);
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

    const isShowEditDescriptionModal = ref(false);
    const editDescriptionModalConfirmLoading = ref(false);
    const editDescriptionModalRef = reactive({
      name: "",
      fileId: "",
      desc: "",
    });
    const onResetEditDescriptionModal = () => {
      editDescriptionModalRef.name = "";
      editDescriptionModalRef.fileId = "";
      editDescriptionModalRef.desc = "";
    };
    /** 弹窗 修改描述 */
    function useEditDescriptionModal() {
      const onEditDescriptionModalConfirm = async () => {
        const { fileId, desc } = editDescriptionModalRef;
        if (!fileId) return;
        editDescriptionModalConfirmLoading.value = true;
        const res = await apiEditFileDescption({
          userFileId: editDescriptionModalRef.fileId,
          description: desc,
        });
        editDescriptionModalConfirmLoading.value = false;
        if (res.err) {
          message.warning(res.err.message);
          return;
        }
        isShowEditDescriptionModal.value = false;
        // 编辑成功后立马修改弹窗里的信息
        currentDetailInfo.value.rawDescription =
          res.data.driveEditDescription.info.description || "";
        // 还要刷新列表, 因为详情是从列表拿的
        // 如果不刷新的话,再次点开弹窗依然是修改前的状态
        // getAndSetTableDataFn({ dirId: curFolderId.value });
        getAndSetTableDataFn({ fullName: requestDirNameList.value });
        message.success("编辑成功!");
        // 重置挪到了关闭详情弹窗的时候,因为可能在已经打开详情窗口的情况下再次编辑
        // onResetEditDescriptionModal();
      };

      return {
        isShowEditDescriptionModal,
        editDescriptionModalConfirmLoading,
        editDescriptionModalRef,
        onEditDescriptionModalConfirm,
        onResetEditDescriptionModal,
      };
    }
    /** action 里对record的操作 */
    function useActions() {
      /** 分享 */
      const onRecordShare = async (record: TFileItem) => {
        // console.log("share", record);
        // 1 如果文件已分享, 跳转到分享页并选中该文件
        const { data } = await apiQueryShareFileList();
        if (data && data.driveListShares) {
          // 当前文件加上路径
          const recordFileFullName = [
            ...historyDir.value.slice(1).map((i) => i.name),
            ...record.fullName, // record.fullName是经过过滤的
          ];
          // 相同分享文件判断条件: fullname相同(路径) hash相同
          const foundShareFile = data.driveListShares.find(
            (i) =>
              i.userFile &&
              isEqual(i.userFile.fullName, recordFileFullName) &&
              i.userFile.hash === record.hash
          );
          if (foundShareFile) {
            // console.log("相同的分享文件的id", foundShareFile);
            router.push({
              name: "MetanetShare",
              params: {
                id: foundShareFile.id,
              },
            });
            return;
          }
        }
        // 2 否则打开创建分享的弹窗
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
      const onRecordDetail = async (record: TFileItem) => {
        // 点击详情的时候设置编辑描述的弹窗里的内容 -star
        editDescriptionModalRef.name = lastOfArray(record.fullName);
        editDescriptionModalRef.fileId = record.id;
        editDescriptionModalRef.desc = record.info.description || "";
        // 如果是文件夹 请求文件夹大小接口
        const showSize = record.isDir
          ? (await apiQueryDirSize({ dirId: record.id })).data?.driveDirSize ??
            0
          : record.info.size;
        // 点击详情的时候设置编辑描述的弹窗里的内容 -end]
        currentDetailInfo.value = {
          name: lastOfArray(record.fullName),
          location: historyDir.value.map((i) => i.name).join("/"),
          // curFolderId.value === "root"
          //   ? "~/"
          //   : `~/${lastOfArray(historyDir.value).name}`,
          type: getFileType({
            isDir: record.isDir,
            fileName: lastOfArray(record.fullName),
          }),
          size: formatBytes(+showSize),
          usedSpaceRatio:
            ((+showSize / +record.user.driveSetting.totalSpace) * 100).toFixed(
              3
            ) + "%",
          insertedAt: dayjs(record.insertedAt).format("YYYY年MM月DD日hh:mm"),
          updatedAt: dayjs(record.updatedAt).format("YYYY年MM月DD日hh:mm"),
          rawDescription: record.info.description || "",
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
        const resultRename = await apiRename({
          id: currentRenameId.value,
          newName: currentRenameString.value,
          space: "PRIVATE",
        });
        if (resultRename.err) {
          onResetRecordRenameState();
          message.warning(resultRename.err.message);
          return;
        }
        // 这里暂时赋值, 保证视觉连贯性
        record.fullName = [currentRenameString.value];
        onResetRecordRenameState();
        getAndSetTableDataFn({ fullName: requestDirNameList.value });
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
            const resultSingleDelete = await apiSingleDelete({
              id: record.id,
              space: "PRIVATE",
            });
            if (resultSingleDelete.err) return;
            // if (res.data.driveDeleteFile === 1) {
            // }
            message.success(t("metanet.deleted"));
            getAndSetTableDataFn({ fullName: requestDirNameList.value });
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
    let getAndSetTableDataFn: (
      params: ParamsQueryFileByDir
    ) => Promise<TFileList>;

    // 记录目录
    const historyDir = ref<THistoryDirItem[]>([
      {
        name: "~",
        isShared: false,
      },
    ]);
    /** 请求的 fullName (排除根目录) */
    const requestDirNameList = computed(() =>
      historyDir.value.slice(1).map((i) => i.name)
    );
    const curFolderId = ref("");
    /** 当前目录是否分享 */
    const isCurFolderShared = computed(() => {
      const dirArr = historyDir.value;
      return lastOfArray(dirArr).isShared;
    });
    /** 预览图片数组 */
    const previewImages = reactive<string[]>([]);
    function useTableData() {
      // 返回当前目录的上一级
      const onUpperLevel = () => {
        const len = historyDir.value.length;
        // 1. 如果只有根目录
        if (len === 1) {
          // message.info("已经是根目录");
          return;
        }
        // 2 跳到上一级
        const idx = historyDir.value.length - 2;
        onClickHistoryDirUpperLevel(idx);
      };
      /** 点击目录历史的面包屑 */
      const onClickHistoryDirUpperLevel = (idx: number) => {
        const showInRoutePath = historyDir.value
          .slice(0, idx + 1)
          .map((i) => i.name)
          .join("/");
        historyDir.value.splice(idx + 1);
        onRefreshTableData();
        router.push({
          name: "MetanetFile",
          query: {
            id: exactUniqueTabId(route.fullPath),
            path: showInRoutePath,
          },
        });
      };
      /** 表格里每一行的名字的点击事件 */
      const onClickItemName = async (record: TFileItem) => {
        const { fileType: e, id, fullName, isShared, user, space } = record;
        if (!e) return;
        // console.log("点击的当前record", e, id);
        // 原来的处理有 : 文件夹 / 图片 / md txt json文本 / pdf
        if (e === "folder") {
          // const foundIndex = historyDir.value.findIndex((v) => v.id === id);
          // if (foundIndex !== -1) {
          //   historyDir.value.splice(foundIndex + 1);
          // } else {
          //   historyDir.value.push({
          //     id,
          //     name: lastOfArray(fullName),
          //     isShared,
          //   });
          // }
          // onRefreshTableData();
          // curFolderId.value = id;
          const curRouterWindowId = exactUniqueTabId(route.fullPath);
          historyDir.value.push({
            name: lastOfArray(fullName),
            isShared,
          });
          onRefreshTableData();
          router.push({
            name: "MetanetFile",
            query: {
              id: curRouterWindowId,
              path: historyDir.value.map((i) => i.name).join("/"),
            },
          });
          // curFolderId.value = id;
        } else if (FILE_TYPE_MAP.image.includes(e)) {
          previewImages.length = 0;
          //  const { user, space, id: fileId, fullName } = item.userFile;
          const resultPreviewToken = await apiGetPreviewToken();
          // console.log("resultPreviewToken", resultPreviewToken);
          if (resultPreviewToken.err) return;
          const token = resultPreviewToken.data.drivePreviewToken;
          const url = `https://drive-s.owaf.io/preview/${
            user.id
          }/${space.toLowerCase()}/${id}/${
            fullName.slice(-1)[0]
          }?token=${token}&t=${dayjs(record.updatedAt).format(
            "YYYYMMDDHHmmss"
          )}`;
          previewImages.push(url);
          const $viewer = viewerApi({
            options: {
              zIndex: 99999,
              toolbar: {
                zoomIn: 1,
                zoomOut: 1,
                oneToOne: 1,
                reset: 0,
                prev: 0,
                play: {
                  show: 0,
                  size: "large",
                },
                next: 0,
                rotateLeft: 0,
                rotateRight: 0,
                flipHorizontal: 0,
                flipVertical: 0,
              },
              movable: true,
              // initialViewIndex: 1,
            },
            images: previewImages,
          });
          $viewer.show();
        } else if (FILE_TYPE_MAP.text.includes(e)) {
          console.log("todo type-text");
        } else if (FILE_TYPE_MAP.archive.includes(e)) {
          console.log("todo type-archive");
        } else if (FILE_TYPE_MAP.audio.includes(e)) {
          console.log("todo type-audio");
        } else if (FILE_TYPE_MAP.video.includes(e)) {
          console.log("todo type-video");
        } else if (e === "pdf") {
          // console.log("pdf");
          const resultPreviewToken = await apiGetPreviewToken();
          // console.log("resultPreviewToken", resultPreviewToken);
          if (resultPreviewToken.err) return;
          const token = resultPreviewToken.data.drivePreviewToken;
          const pdfUrl = `https://drive-s.owaf.io/preview/${
            user.id
          }/${space.toLowerCase()}/${id}/${
            fullName.slice(-1)[0]
          }?token=${token}`;
          window.open(pdfUrl, "_blank");
        } else {
          console.log("else unknown types");
          // type not found
        }
      };
      /** 当前表格点击的项 */
      const currentClickItem = reactive({
        id: "",
        name: "",
      });
      const resetCurrentClickItem = () => {
        currentClickItem.id = "";
        currentClickItem.name = "";
      };
      /** 当前点击的item 是否分享 */
      const isCurClickItemShared = computed(() => {
        if (currentClickItem.id.length === 0) return false;
        return tableData.value.find((item) => item?.id === currentClickItem.id)
          ?.isShared;
      });
      const getIsShareText = () => {
        const condition =
          currentClickItem.name.length > 0
            ? isCurClickItemShared.value
            : isCurFolderShared.value;
        return condition ? "已分享" : "未分享";
      };
      const rowClassName = (record: TFileItem, index: number) => {
        return record.id === currentClickItem.id &&
          lastOfArray(record.fullName) === currentClickItem.name
          ? "ant-table-row-hover"
          : "";
      };
      const customRow = (record: TFileItem, index: number) => ({
        onClick: (e: {
          currentTarget: {
            dataset: {
              rowKey: string;
            };
          };
        }) => {
          // console.log("customRow-click", e, record);
          // 如果点击的是相同项, 取消"点击转态"
          if (currentClickItem.id === record.id) {
            resetCurrentClickItem();
          } else {
            currentClickItem.id = record.id;
            currentClickItem.name = lastOfArray(record.fullName);
          }
        },
      });
      const fileTableRef = ref(null);
      /** 点击除了表格的其他地方, 重置当前点击项(还原地址栏),除了地址栏的收藏icon */
      onClickOutside(fileTableRef, (e) => {
        // console.log("e", e.target);
        const target = e.target as HTMLElement;
        if (
          (target.nodeName === "path" &&
            target.outerHTML.includes("353.1l-253.9-36.9L540.7")) ||
          (target.nodeName === "svg" &&
            target.innerHTML.includes("353.1l-253.9-36.9L540.7")) ||
          (target.nodeName === "a" &&
            target.innerHTML.includes("353.1l-253.9-36.9L540.7"))
        ) {
          return;
        }
        resetCurrentClickItem();
      });
      const columns = [
        {
          title: t("metanet.name"),
          slots: { customRender: "name" },
          sortDirections: ["descend", "ascend"],
          sorter: (a: TFileItem, b: TFileItem) => {
            // 文件夹的排在前面
            if (a.isDir && !b.isDir) return 0;
            else if (!a.isDir && b.isDir) return 0;
            return lastOfArray(a.fullName).localeCompare(
              lastOfArray(b.fullName)
            );
          },
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
          sortDirections: ["descend", "ascend"],
          sorter: (a: TFileItem, b: TFileItem) => {
            // 文件夹的排在前面
            if (a.isDir && !b.isDir) return 0;
            else if (!a.isDir && b.isDir) return 0;
            return Number(a.info.size) - Number(b.info.size);
          },
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
          sortDirections: ["descend", "ascend"],
          sorter: (a: TFileItem, b: TFileItem) => {
            // 文件夹的排在前面
            if (a.isDir && !b.isDir) return 0;
            else if (!a.isDir && b.isDir) return 0;
            return dayjs(a.updatedAt).diff(dayjs(b.updatedAt));
          },
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
      getAndSetTableDataFn = (params: ParamsQueryFileByDir) => {
        return new Promise((resolve, reject) => {
          // 重置选中项目
          selectedRows.value.length = 0;
          selectedRowKeys.value.length = 0;
          // 重置当前点击表格项
          resetCurrentClickItem();
          tableLoading.value = true;
          apiQueryFileByDir(params).then((resultQueryFile) => {
            if (resultQueryFile.err || !resultQueryFile.data.driveListFiles) {
              reject("result-no-list");
              return;
            }
            // 如果返回的 fullName 是空数组的话 代表是根目录
            // 排除null 和 fullName是当前目录的数据(当前目录若不是root , 要加...返回上一级)
            // console.log("网盘文件获取", res);
            tableData.value = resultQueryFile.data.driveListFiles
              // 排序 文件夹在前
              // 加上类型
              .map((i) => {
                if (!i) return i;
                if (!i.fullName.length) return null;
                const obj = { ...i };
                // 如果目标文件夹是根目录,注册当前目录的id为root
                if (params.fullName?.length === 0) {
                  curFolderId.value = "root";
                  historyDir.value[historyDir.value.length - 1].isShared =
                    false;
                  const curFileWindowId = exactUniqueTabId(route.fullPath);
                  baseStore.setWindowIdItem(+curFileWindowId, {
                    path: historyDir.value.map((i) => i.name).join("/"),
                    desc: { tagArr: [], text: "" },
                  });
                }
                // 如果是当前目录, 注册fileWindow的路径和描述信息,然后返回null , 下一步把它去除(为了填到表格)
                if (
                  obj.id === params.dirId ||
                  (obj.fullName.length === params.fullName?.length &&
                    obj.fullName.every(
                      (item, idx) => item === params.fullName?.[idx]
                    ))
                ) {
                  // 注册当前目录的id
                  curFolderId.value = obj.id;
                  // 注册当前目录是否已分享
                  historyDir.value[historyDir.value.length - 1].isShared =
                    obj.isShared;
                  const curFileWindowId = exactUniqueTabId(route.fullPath);
                  // console.log("why this can", curFileWindowId, {
                  //   path: historyDir.value.map((i) => i.name).join("/"),
                  //   desc: formatDescription(obj.info.description),
                  // });
                  baseStore.setWindowIdItem(+curFileWindowId, {
                    path: historyDir.value.map((i) => i.name).join("/"),
                    desc: cacheFormatDescription(obj.info.description || ""),
                  });
                  return null;
                }
                // 如果是父级目录, 返回null , 下一步把它去除
                const hArr = historyDir.value;
                if (
                  hArr.length > 1 &&
                  lastOfArray(obj.fullName) === hArr[hArr.length - 2].name
                ) {
                  // obj.fullName = ["..."];
                  return null;
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
            // 如果路由里有参数
            if (paramsFileName.value) {
              const found = tableData.value.find(
                (item) =>
                  item && lastOfArray(item.fullName) === paramsFileName.value
              );
              if (found) {
                selectedRows.value.push(found);
                selectedRowKeys.value.push(found.id);
                // currentClickItem.id = found.id;
                // currentClickItem.name = lastOfArray(found.fullName);
              }
              paramsFileName.value = "";
            }
            tableLoading.value = false;
            resolve(resultQueryFile.data.driveListFiles);
          });
        });
      };
      /** 路由params里的name */
      const paramsFileName = ref("");
      onActivated(() => {
        // 只会执行一次?
        // console.log("onActivated");
        if (!route.path.includes("metanet/file")) {
          return;
        }
        // metanet/file?id=2&path=~/材料清单
        const routeDirPath = route.query.path as string;
        let routeWindowId = exactUniqueTabId(route.fullPath);
        if (!routeWindowId) {
          routeWindowId = `${baseStore.getNewOpenWindowId()}`;
          console.log("路由不存在文件应用windowId,重新获取", routeWindowId);
        }
        // console.log("routeDirPath", routeDirPath);
        /** 导航到根目录 */
        const routerToDefaultFilePath = () => {
          console.log("call-routerToDefaultFilePath");
          router.replace({
            name: "MetanetFile",
            query: { id: routeWindowId, path: "~" },
          });
        };
        paramsFileName.value = (route.params.name as string) || "";
        // console.log("paramsFileName", paramsFileName.value);
        if (routeDirPath) {
          // 删除原来~ 后面的路径
          historyDir.value.splice(1);
          // ~/test1/test222
          // 正确的目录应该是 ~ 开头的
          const pathArr = routeDirPath.split("/");
          if (pathArr[0] !== "~") {
            routerToDefaultFilePath();
            return;
          }
          historyDir.value.push(
            ...pathArr.slice(1).map((item) => ({
              name: item,
              isShared: false,
            }))
          );
          // ~路径不传后端
          const dirFullName = historyDir.value.slice(1).map((i) => i.name);
          getAndSetTableDataFn({
            fullName: dirFullName,
          }).catch(() => {
            console.log("路由的路径不存在数据,即将导航到根目录", dirFullName);
            routerToDefaultFilePath();
          });
        } else {
          // 如果没有path 重新给个path
          routerToDefaultFilePath();
        }
      });
      onBeforeRouteUpdate(async (to, from) => {
        // console.log("beforeRouteUpdate", to, from);
        // 浏览器的后退 前进点击, 这时候historyDir没有及时响应,所以这里修改
        const routeDirPath = to.query.path as string;
        if (routeDirPath) {
          const pathArr = routeDirPath.split("/");
          if (pathArr.length !== historyDir.value.length) {
            // console.log("用路由update守卫去改变historyDir然后请求数据");
            historyDir.value.splice(1);
            historyDir.value.push(
              ...pathArr.slice(1).map((item) => ({
                name: item,
                isShared: false,
              }))
            );
            onRefreshTableData();
          }
        }
      });
      /** 清除当前组件的select数据, 然后重新获取表格数据 */
      const onRefreshTableData = () => {
        // getAndSetTableDataFn({ dirId: curFolderId.value });
        getAndSetTableDataFn({ fullName: requestDirNameList.value });
      };
      const onDownload = (record: TFileItem) => {
        const { user, space, id: fileId, fullName } = record;
        // TODO
        // Content-Disposition: attachment
        const hideLoadingMsg = message.loading("连接服务器中...", 0);
        apiGetPreviewToken()
          .then((resultPreviewToken) => {
            if (resultPreviewToken.err) return;
            const token = resultPreviewToken.data.drivePreviewToken;
            const url = `https://drive-s.owaf.io/download/${
              user.id
            }/${space.toLowerCase()}/${fileId}/${
              fullName.slice(-1)[0]
            }?token=${token}&t=${dayjs(record.updatedAt).format(
              "YYYYMMDDHHmmss"
            )}`;
            downloadFileByUrl(url, fullName.slice(-1)[0]);
          })
          .finally(hideLoadingMsg);
      };
      return {
        historyDir,
        isCurFolderShared,
        onClickItemName,
        onUpperLevel,
        onClickHistoryDirUpperLevel,
        onRefreshTableData,
        onDownload,
        currentClickItem,
        isCurClickItemShared,
        getIsShareText,
        rowClassName,
        customRow,
        fileTableRef,
        columns,
        tableData,
        tableLoading,
      };
    }

    /** 当前详情数据 */
    const currentDetailInfo = ref<TDetailInfo>({});
    const isShowDetailModal = ref(false);
    watch(
      () => isShowDetailModal.value,
      (newVal) => {
        // 如果详情弹窗关闭了, 清空 编辑描述 的内容
        if (newVal === false) {
          onResetEditDescriptionModal();
        }
      }
    );
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
        currentDetailInfo.value = diskDetail;
        apiQueryMeSpace().then((resultQuerySpace) => {
          if (resultQuerySpace.err) return;
          // currentDetailInfo.value.
          const { usedSpace, totalSpace, availableSpace } =
            resultQuerySpace.data.me.driveSetting;
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
      /** 点击详情里的编辑描述 */
      const onShowDescriptionModal = () => {
        isShowEditDescriptionModal.value = true;
      };
      // 关闭弹窗时清空数据
      watch(
        () => isShowDetailModal.value,
        (val) => {
          if (val === false) {
            currentDetailInfo.value = {};
          }
        }
      );
      return {
        currentDetailInfo,
        onShowDescriptionModal,
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
      ...useEditDescriptionModal(),
      ...useActions(),
      ...useTableData(),
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
</style>