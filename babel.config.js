module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  // ant-design-vue 按需引入
  plugins: [
    [
      "import",
      { libraryName: "ant-design-vue", libraryDirectory: "es", style: "css" },
      "antd",
    ], // `style: true` 会加载 less 文件
    [
      "import",
      {
        libraryName: "vant",
        libraryDirectory: "es",
        style: true,
      },
      "vant",
    ],
  ],
};
