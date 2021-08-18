const isMobile =
  /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
if (isMobile) {
  import(
    /* webpackChunkName: "mobile" */
    /* webpackMode: "lazy" */
    "./MOBILE/main"
  ).then((module) => {
    console.log("加载移动端模块_mobile_module", module);
  });
} else {
  import(
    /* webpackChunkName: "pc" */
    /* webpackMode: "lazy" */
    "./PC/main"
  ).then((module) => {
    console.log("加载PC端模块_pc_module", module);
  });
}
