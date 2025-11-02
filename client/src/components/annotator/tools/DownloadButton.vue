<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import axios from "axios";
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";

const { iconColor, click } = useButton();

const save = inject('save');

const image = defineModel('image', { type: Object, required: true });

const name =  ref("Download COCO");
const icon = ref("fa-download");
const include = {
        image: true,
        coco: true,
      };

const  downloadURI = (uri, exportName) => {
  const link = document.createElement('a');
  link.href = uri;
  link.download = exportName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const download = () => {
  if (include.image) {
    const url = '/api/image/' + image.value.id + '?asAttachment=true';
    downloadURI(url, image.value.filename);
  }
  if (include.coco) {
    const url = '/api/image/' + image.value.id + '/coco';
    axios.get(url).then((response) => {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(response.data));
      const filename =
        image.value.filename.replace(/\.[^/.]+$/, '') + '.json';
      downloadURI(dataStr, filename);
    });
  }
};

const execute = () => {
    save(download);
}

</script>
