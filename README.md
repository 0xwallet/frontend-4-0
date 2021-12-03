# frontend-4.0

### 技术栈

typescript / vue3 / vue-router-next / vue-i18n / pinia(数据管理) / webpack / graphql / ant-design-vue@2.1.6

### src 目录结构

```bash
├─@types #typescript 类型文件
├─apollo #关于 graphql 的所有函数
├─assets #logo 等资源
├─constants #全局常量配置
├─device_mobile #mobile端
    ├─components #mobile端公共组件
    ├─pages #pc端页面
    ├─router #pc端路由
    ├─App.vue
    ├─main.ts #mobile端入口
├─device_pc #pc端
    ├─components #pc端公共组件
    ├─layouts #登录/非登录的页面再包装一层
    ├─pages #pc端页面
    ├─router #pc端路由
    ├─App.vue
    ├─main.ts #pc端入口
├─languages #国际化语言
├─store #全局数据中心
├─utils #公共工具函数
├─main.ts #pc/移动端工程入口
├─router #路由
```

### 项目命令

```bash
# 安装依赖
yarn install
# 开发项目(注意localhost:4000 端口,不然websocket 授权失败)
yarn serve
# 打包
yarn build
# 单元测试(todo)
yarn test:unit
# 格式检测
yarn lint
# 查看线上包的信息
yarn info [package_name]
# 查看本地安装包的信息
yarn list --pattern [package_name]
```

### 开发技巧

外部 JS 文件加载:

1. public/index.html 里 CDN 引入,然后通过全局引用,webpack 同时配置 externals
2. npm 安装

> 关于 nkn  
> package.json 中安装了依赖 nkn-sdk 然后拷贝其 nkn.min.js 到了 public 目录,  
> 并在 index.html 中手动引入
> webpack 中配置 externals => webpack 不会打包进来
> @types/nkn-sdk.d.ts 中声明了 nkn => typescript 编译器可以识别类型

```css
/* 在css中引入资源 */
background-image: url("~@/assets/svg/login-bg.svg");
```

```javascript
// 1. 路由懒加载的方法
{
  path: "/about",
  name: "About",
  // route level code-splitting
  // this generates a separate chunk (about.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  component: () =>
    import(/* webpackChunkName: "about" */ "../pages/About.vue"),
}
// 2. 不用引入 @apollo/client , 不然要装 react ! 引入 /core 就可以了
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
```

### 相关 url

> 工程跟 vercel 关联,push 到对应分支会自动更新:

- 更新 master(生产分支)会更新到域名 https://bitdrive.me/
- 更新 dev(开发分支)会更新到域名 https://bitdrive.owaf.org/
- 需求/问题/接口 issue 页 https://github.com/0xwallet/issues/issues
- 后端 gql 接口网站(上面有具体的参数类型) https://owaf.io/graphiql
- nkn-sdk https://docs.nkn.org/nkn-sdk-js/
- ant-design-vue@2 https://2x.antdv.com/components/button-cn/
- vant@v3 https://youzan.github.io/vant/v3/#/zh-CN

- mega 网盘（参考设计）https://github.com/meganz/webclient
- Wormhole P2P 文件传输 https://wormhole.app/

### 难点:

1. 多窗口文件的需求: 点一下左菜单的文件就打开一个新的 tab, 然后不同的文件 tab 是单独开来的,分别可以打开不同的文件夹
2. nkn 的连接: nkn-sdk-js 文档网站 https://docs.nkn.org/nkn-sdk-js/ ; 初始化 nkn 时会定时检测 nkn 节点状态,相关源码在 \src\store\user.ts 146 行 setMultiClient 方法中
3. 空投 源码目录 src\device_pc\pages\Transport\PeerTransfer.vue 本质上是双方同时在线然后用 nkn 传输数据, 难点是 nkn 的错误处理、nkn 监听的及时清除、前端的大文件存储, 断点续传、登录和非登录状态的处理、异常情况处理（发送方或接收方突然断开或者 nkn 突然断开）、状态的保持（接收方异常断开后，发送方的监听保持知道下一次连接）、移动端兼容性; 目前采用的方案是 idb-keyval（indexedDB 库） 负责文件存储，file-saver 负责下载文件（原先用的 stream-saver 在华为原生浏览器下无法下载文件等兼容性问题所以改为了 file-saver，但 file-saver 需要下载前全部加载数据到浏览器 ram, 可能会直接造成手机端浏览器崩溃）
4. 移动端兼容性

### 目前主要开发 roadmap:

空投 -> 移动端的页面 -> 添加资产 -> 分享的打赏 -> 国际化

### **通常开发流程:**

开会确认需求 -> 建立该需求文档(用 github 的 issue 来表示) -> 前端开发页面 -> 对接后端接口 -> push 到 dev 开发分支测试 -> 合并到 master 生产分支
