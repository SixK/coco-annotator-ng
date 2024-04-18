<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>
<script setup>
import paper from "paper";
import { useTools } from "@/composables/toolBar/tools";
import axios from "axios";
import { ref, computed, watch, inject, onMounted, provide } from 'vue'

const getCurrentAnnotation = inject('getCurrentAnnotation');
const getImageRaster = inject('getImageRaster');
const getImageId = inject('getImageId');

const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

const scale = defineModel('scale', { type: Number, default: 1 });

name.value = "DEXTR";
cursor.value = "crosshair";

const icon = ref("fa-crosshairs");

const settings = ref({
      padding: 50,
      threshold: 80,
});

const points = ref([]);

const localCurrentAnnotation=ref(null);
const localImageRaster=ref(null);

watch(
  () => getImageRaster(),
  (value) => {
      localImageRaster.value=value;
  }
);

watch(
  () => getCurrentAnnotation(),
  (value) => {
      localCurrentAnnotation.value=value;
  }
);

const isDisabled = computed(() => {
  return state.isDisabled;
})

const isActive = computed(() => {
  return state.isActive;
});

function createPoint(point) {
      let paperPoint = new paper.Path.Circle(point, 5);
      paperPoint.fillColor = localCurrentAnnotation.value.color;
      paperPoint.data.point = point;
      points.value.push(paperPoint);
}

function onMouseDown(event) {
    if(state.isActive)
    {
      createPoint(event.point);
      checkPoints(points.value);
    }
}


// original code was watching for new points, but it seem's to be a bug between Vue3 and paper.js.
// so we call function directly
function checkPoints(newPoints) {
  if (newPoints.length == 4) {
    let currentAnnotation = localCurrentAnnotation.value;
    let pointsList = [];
    let width = localImageRaster.value.width / 2;
    let height = localImageRaster.value.height / 2;
    newPoints.forEach((point) => {
      let pt = point.position;
      pointsList.push([
        Math.round(width + pt.x),
        Math.round(height + pt.y),
      ]);
    });

    let  canvas = getImageRaster().canvas;
    let data = new FormData();

    data.append('data', JSON.stringify({ 'points': pointsList,
            ...settings.value}));

    canvas.toBlob((blob) => {
        data.append('image', blob);
/*
        axios
          .post(`/api/model/dextr/${getImageId()}`, {
            points: pointsList,
            ...settings.value,
          })*/
        axios
              .post(`/api/model/dextr`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
          .then((response) => {
            let segments = response.data.segmentaiton;
            let center = new paper.Point(width, height);

            let compoundPath = new paper.CompoundPath();
            for (let i = 0; i < segments.length; i++) {
              let polygon = segments[i];
              let path = new paper.Path();

              for (let j = 0; j < polygon.length; j += 2) {
                let point = new paper.Point(polygon[j], polygon[j + 1]);
                path.add(point.subtract(center));
              }
              path.closePath();
              compoundPath.addChild(path);
            }

            currentAnnotation.unite(compoundPath);
          })
          .finally(() => points.value = [] );
          // .finally(() => points.value.forEach((point) => point.remove()));
        });
    }
};

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
    // state.tool.onMouseDrag = onMouseDrag;
    // state.tool.onMouseMove = onMouseMove;
    // state.tool.onMouseUp = onMouseUp;
})

defineExpose({points, settings, name});

</script>
