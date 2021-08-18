<template>
  <keep-alive>
    <component :is="curComponent" :key="curComponent"></component>
  </keep-alive>
</template>

<script lang="ts">
import { MAX_FILEITEM_COUNT } from "@/constants";
import { useBaseStore } from "@/store";
import { values } from "lodash-es";
import {
  Component,
  computed,
  defineComponent,
  onActivated,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import FileItem from "./components/FileItem.vue";

/** {FileItem1:FIleItem,...,FileItem20:FileItem} */
const fileItemComponents = Array(MAX_FILEITEM_COUNT)
  .fill(null)
  .map((i, idx) => `FileItem${idx}`)
  .reduce<{ [key: string]: Component }>((acc, cur) => {
    acc[cur] = FileItem;
    return acc;
  }, {});
/** 根据数字获取对应的组件名称 */
export const getComponentNameByNum = (n: number) => `FileItem${n}`;

export default defineComponent({
  name: "MetanetFile",
  components: {
    ...fileItemComponents,
  },
  setup() {
    // 每次进来, 判断路由, 根据navList 确定keepAliveList
    const baseStore = useBaseStore();
    const route = useRoute();
    const router = useRouter();
    const keepAliveList = computed(() => {
      const fileWindow = baseStore.fileWindow;
      return Object.keys(fileWindow)
        .filter((key) => fileWindow[key] !== null)
        .map((i, idx) => getComponentNameByNum(idx + 1));
    });
    // const curComponent = computed(() => baseStore.curFileWindow);
    const curComponent = ref("FileItem1");
    // watch(
    //   () => curComponent.value,
    //   (newVal) => console.log("curComponent-newVal", newVal)
    // );
    // watch(
    //   () => keepAliveList.value,
    //   (newVal) => {
    //     console.log("keepAliveList", newVal);
    //   },
    //   {
    //     immediate: true,
    //     deep: true,
    //   }
    // );
    watch(
      () => route,
      (newVal) => {
        if (!newVal.fullPath.includes("/metanet/file")) {
          return;
        }
        // console.log("MetanetFile-activated");
        // 根据路由判断是否正常数值, 是的话分配, 不是的话replace 并创建新的s
        const routeWindowId = +(newVal.query.id as string);
        // 1. id 不正常
        if (!(routeWindowId > 0 && routeWindowId <= MAX_FILEITEM_COUNT)) {
          // console.log("条件1");
          const toOpenFileWindowId = baseStore.getNewOpenWindowId();
          router.replace({
            name: "MetanetFile",
            query: {
              id: toOpenFileWindowId,
            },
          });
          curComponent.value = getComponentNameByNum(toOpenFileWindowId);
        } else if (baseStore.fileWindow[routeWindowId]) {
          // console.log("条件2", baseStore.fileWindow);
          // 2. id 正常且有效 => 直接使用这个id
          // router.replace({
          //   name: "MetanetFile",
          //   query: {
          //     id: routeWindowId,
          //   },
          // });
          curComponent.value = getComponentNameByNum(routeWindowId);
        } else {
          // console.log("条件3");
          // 3. id正常到已经销毁 => 重新激活这个id, 设置默认path tag
          baseStore.setWindowIdItem(routeWindowId, "default");
          curComponent.value = getComponentNameByNum(routeWindowId);
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
    onActivated(() => {
      // console.log("MetanetFile-activated");
      // // 根据路由判断是否正常数值, 是的话分配, 不是的话replace 并创建新的s
      // const routeWindowId = +(route.query.id as string);
      // // 1. id 不正常
      // if (!(routeWindowId > 0 && routeWindowId <= 20)) {
      //   const toOpenFileWindowId = baseStore.getNewOpenWindowId();
      //   router.replace({
      //     name: "MetanetFile",
      //     query: {
      //       id: toOpenFileWindowId,
      //     },
      //   });
      //   curComponent.value = getComponentNameByNum(toOpenFileWindowId);
      // } else if (baseStore.fileWindow[routeWindowId] === true) {
      //   // 2. id 正常且有效 => 直接使用这个id
      //   // router.replace({
      //   //   name: "MetanetFile",
      //   //   query: {
      //   //     id: routeWindowId,
      //   //   },
      //   // });
      //   curComponent.value = getComponentNameByNum(routeWindowId);
      // } else if (baseStore.fileWindow[routeWindowId] === false) {
      //   // 3. id正常到已经销毁 => 重新激活这个id
      //   router.replace({
      //     name: "MetanetFile",
      //     query: {
      //       id: routeWindowId,
      //     },
      //   });
      //   curComponent.value = getComponentNameByNum(routeWindowId);
      // }
    });
    // const keepAliveList = computed(() => values(baseStore.FileWindow));
    return { curComponent, keepAliveList };
  },
});
</script>

<style scoped>
</style>