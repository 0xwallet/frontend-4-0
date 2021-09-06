import { isMobile } from "./utils";

if (isMobile()) {
  console.log("isMobile");
  import(
    /* webpackChunkName: "mobile" */
    /* webpackPrefetch: true */
    "./device_mobile/main"
  ).then((module) => {
    console.log("加载移动端模块_mobile_module", module);
  });
} else {
  console.log("isPC");
  import(
    /* webpackChunkName: "pc" */
    /* webpackPrefetch: true */
    "./device_pc/main"
  ).then((module) => {
    console.log("加载PC端模块_pc_module", module);
  });
}

setTimeout(() => {
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntriesByName("first-paint")) {
      console.log("性能-FP candidate:", entry.startTime, entry);
    }
  }).observe({ type: "paint", buffered: true });
}, 2000);
