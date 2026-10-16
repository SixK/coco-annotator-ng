<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";
import { downloadURI, fetchAndDownloadJson } from "@/libs/download";

const { iconColor, click } = useButton();

const { save } = inject('annotator');

const image = defineModel('image', { type: Object, required: true });

const name =  ref("Download COCO");
const icon = ref("fa-download");
const include = {
        image: true,
        coco: true,
      };

const download = () => {
  if (include.image) {
    const url = '/api/image/' + image.value.id + '?asAttachment=true';
    downloadURI(url, image.value.filename);
  }
  if (include.coco) {
    fetchAndDownloadJson(
      '/api/image/' + image.value.id + '/coco',
      image.value.filename.replace(/\.[^/.]+$/, '') + '.json'
    );
  }
};

const execute = async () => {
  try {
    if (typeof save === 'function') {
      await save();
    }
    download();
  } catch (err) {
    console.error('Error saving before download:', err);
    // Optionally show user feedback
    // Still attempt download in case save failed but download is allowed:
    download();
  }
}

</script>
