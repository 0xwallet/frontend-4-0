import { isMobile } from "./utils";

if (isMobile()) {
  console.log("isMobile");
  import(
    /* webpackChunkName: "mobile" */
    /* webpackMode: "lazy" */
    "./device_mobile/main"
  ).then((module) => {
    console.log("加载移动端模块_mobile_module", module);
  });
} else {
  console.log("isPC");
  import(
    /* webpackChunkName: "pc" */
    /* webpackMode: "lazy" */
    "./device_pc/main"
  ).then((module) => {
    console.log("加载PC端模块_pc_module", module);
  });
}
