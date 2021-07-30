<template>
  <a-table
    class="TableFiles"
    size="small"
    :showHeader="showHeader"
    :bordered="false"
    :rowKey="rowKey"
    :loading="loading"
    :columns="columns"
    :data-source="data"
    :scroll="{ x: true }"
    :row-selection="rowSelection"
    :pagination="false"
  >
    <!-- slot="header" 是插入别人的插槽 -->
    <template v-for="slotName in slots" :key="slotName" #[slotName]="data">
      <slot :name="slotName" v-bind="data"></slot>
    </template>
  </a-table>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

type TColumn = {
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: "left" | "right";
  slots?: {
    customRender: string;
  };
};

export default defineComponent({
  props: {
    rowKey: {
      type: String,
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array as PropType<TColumn[]>,
      required: true,
    },
    loading: {
      type: Boolean,
    },
    selectedRows: {
      type: Array,
      default: () => [],
    },
    selectedRowKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    disableSelect: {
      type: Boolean,
      default: false,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:selectedRows", "update:selectedRowKeys"],
  setup(props, { emit }) {
    // 不能通过props 传递个ref 然后 .value = 赋值改了的话就没有响应式了 , 需要toRef 改成响应父组件的的
    // 从 column 里面算出要slot 的
    const slots = props.columns
      .filter((i) => i.slots)
      .map((i) => i.slots?.customRender);
    const rowSelection = props.disableSelect
      ? null
      : {
          onChange: (
            selectedRowKeys: string[],
            selectedRows: { [key: string]: any }[]
          ) => {
            // console.log(
            //   `selectedRowKeys: ${selectedRowKeys}`,
            //   "selectedRows: ",
            //   selectedRows
            // );
            emit("update:selectedRowKeys", selectedRowKeys);
            emit("update:selectedRows", selectedRows);
          },
          getCheckboxProps: (record: { [key: string]: any }) => ({
            // 禁选上级目录
            disabled: record.fullName && record.fullName[0] === "...", // Column configuration not to be checked
            // name: record.name,
            // 默认选中
            defaultChecked: props.selectedRowKeys.includes(
              record[props.rowKey]
            ),
          }),
        };

    return {
      slots,
      rowSelection,
    };
  },
});
</script>

<style lang="less" scoped>
.ant-table td {
  white-space: nowrap;
}

// 覆盖ant 样式
:deep(.ant-table-thead > tr > th) {
  // padding: 0.7em 0 !important;
  background: #f7f7f8;
  // background: blue;
  border: none;
  // border-bottom: 1rem solid #fff;
}
:deep(.ant-table-selection-column) {
  border-radius: 10px 0 0 10px !important;
}
:deep(.ant-table-row-cell-last) {
  border-radius: 0px 10px 10px 0 !important;
}
:deep(.ant-table-fixed-right .ant-table-row-cell-break-word) {
  border-radius: 0 10px 10px 0 !important;
}
:deep(.ant-table-row > td) {
  border: none;
  border-bottom: 1px solid #eff2f9;
}
// :deep(.ant-table-tbody) {
//   // &::before {
//   //   content: "-";
//   //   display: block;
//   //   line-height: 1em;
//   //   color: transparent;
//   //   background: #eff2f9;
//   // }
// }
:deep(.ant-table-thead > tr) {
  border-bottom: 1rem solid blue;
}
</style>