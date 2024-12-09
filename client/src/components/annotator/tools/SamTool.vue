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

name.value = "SAM";
cursor.value = "crosshair";
const icon = ref("fa-crosshairs");

const settings = ref({
      padding: 50,
      threshold: 80,
});

let paperPoint=null;
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

function createPoint(point) {
      paperPoint = new paper.Path.Circle(point, 5);
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

function createPath(segments, width, height) {
    const center = new paper.Point(width, height);
    const compoundPath = new paper.CompoundPath();
    segments.forEach(polygon => {
        const path = new paper.Path();
        for (let j = 0; j < polygon.length; j += 2) {
            const point = new paper.Point(polygon[j], polygon[j + 1]);
            path.add(point.subtract(center));
        }
        path.closePath();
        compoundPath.addChild(path);
    });
    return compoundPath;
}

// original code was watching for new points, but it seem's to be a bug between Vue3 and paper.js.
// so we call function directly
function checkPoints(newPoints) {
  if (newPoints.length == 1) {
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

        axios
              .post(`/api/model/sam`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
          .then((response) => {
            console.log('response:', response.data);
            let compoundPath = createPath(response.data.segmentaiton, width, height);
            currentAnnotation.unite(compoundPath);
          })
        .finally(() => { 
              points.value = [];
              paperPoint.removeSegments();
        });
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
