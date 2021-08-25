/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.9.359/build/pdf.js" {
  export * from "pdfjs-dist";
}
