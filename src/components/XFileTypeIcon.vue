<template>
  <img :src="svg" class="inline-block align-middle" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import archive from "../assets/svg/fileType/archive.svg";
import audio from "../assets/svg/fileType/audio.svg";
// import defaultSkin from "../assets/svg/fileType/default-skin.svg";
import doc from "../assets/svg/fileType/doc.svg";
// import empty from "../assets/svg/fileType/empty.svg"; //
import defaultFile from "../assets/svg/fileType/file.svg";
import folder from "../assets/svg/fileType/folder.svg";
import image from "../assets/svg/fileType/image.svg";
import pdf from "../assets/svg/fileType/pdf.svg";
import ppt from "../assets/svg/fileType/ppt.svg";
import psd from "../assets/svg/fileType/psd.svg";
import text from "../assets/svg/fileType/text.svg";
import video from "../assets/svg/fileType/video.svg";
import xls from "../assets/svg/fileType/xls.svg";
import { FILE_TYPE_MAP } from "@/constants";

// fileType=folder doc docx xls xlsx mp3
function getIcon(fileType: string | undefined) {
  const e = fileType;
  // console.log("e", e);
  if (!e || e === "file") return defaultFile;
  if (/folder$/g.test(e)) return folder;
  if (/\docx?$/g.test(e)) return doc;
  if (/xlsx?$/g.test(e)) return xls;
  if (/pdf$/g.test(e)) return pdf;
  if (/ppt$/g.test(e)) return ppt;
  if (/psd$/g.test(e)) return psd;
  if (FILE_TYPE_MAP.image.includes(e)) return image;
  if (FILE_TYPE_MAP.text.includes(e)) return text;
  if (FILE_TYPE_MAP.archive.includes(e)) return archive;
  if (FILE_TYPE_MAP.audio.includes(e)) return audio;
  if (FILE_TYPE_MAP.video.includes(e)) return video;
  else return defaultFile;
}

export default defineComponent({
  props: {
    type: String, // 文件后缀
  },
  setup(props) {
    return { svg: getIcon(props.type) };
  },
});
</script>
