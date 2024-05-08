<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import axios from "axios";
import { ref, computed, watch, inject, onMounted, provide } from 'vue';
import { useButton } from "@/composables/toolBar/button";
import useAxiosRequest from "@/composables/axiosRequest";

const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();

const addAnnotation = inject('addAnnotation');
const getImageRaster = inject('getImageRaster');

const { iconColor, click } = useButton();

const annotateUrl = defineModel('annotateUrl', { type: [String, Number], required: true });

const cursor = ref("copy");
const icon = ref('fa-cloud-download')
const disabled = ref(true);
const loading = ref(false);


const name = computed(() => {
  if (!validUrl.value) return 'Annotate url is invalid'
  return 'Annotate Image'
})


const validUrl = computed(() => {
  if (typeof annotateUrl.value === 'number') return false
  return annotateUrl.value.length > 2
});

watch(
      // do not use validURL.value here
      [() => loading.value, validUrl],
      ([loading, validUrl]) => {
        icon.value = loading ? 'fa-spinner fa-spin' : 'fa-cloud-download';
        disabled.value = !validUrl;
      }
);


const execute = () => {
      if (!validUrl.value) return;
      
      // const canvas = this.$parent.image.raster.canvas;
      const canvas = getImageRaster().canvas;
      const data = new FormData();
      canvas.toBlob((blob) => {
        data.append('image', blob);
        loading.value = true;
        axios
          .post(annotateUrl.value, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((response) => {
            let coco = response.data.coco || {};
            let images = coco.images || [];
            let categories = coco.categories || [];
            let annotations = coco.annotations || [];

            if (
              images.length == 0 ||
              categories.length == 0 ||
              annotations.length == 0
            ) {
              // Error
              return;
            }
            // Index categoires
            let indexedCategories = {};
            categories.forEach((category) => {
              indexedCategories[category.id] = category;
            });

            annotations.forEach((annotation) => {
              let keypoints = annotation.keypoints || [];
              let segmentation = annotation.segmentation || [];
              let category = indexedCategories[annotation.category_id];
              let isbbox = annotation.isbbox || false;

              addAnnotation(
                category.name,
                segmentation,
                keypoints,
                isbbox=isbbox
              );
            });
          })
          .catch((error) => {
            axiosReqestError("Annotator", "Could not read data from URL");
          })
          .finally(() => {
            loading.value = false;
          });
      });
};

</script>
