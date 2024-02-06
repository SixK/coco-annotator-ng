<template>
  <div>
    <i v-tooltip.right="tooltip" class='fa fa-x' :class="icon" :style="{ color: iconColor }" @click="click"></i>
    <br>
  </div>
</template>
<script setup>
import paper from "paper";
import UndoAction from "@/undo";

import { invertColor } from "@/libs/colors";
import { BBox } from "@/libs/bbox";
import { ref, computed, watch, inject, onMounted, provide } from 'vue'
import { useTools } from "@/composables/toolBar/tools";

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();


const uniteCurrentAnnotation = inject('uniteCurrentAnnotation');
const getCurrentCategory = inject('getCurrentCategory');
const getCurrentAnnotation = inject('getCurrentAnnotation');
const getImageRaster = inject('getImageRaster');

const scale = defineModel('scale', { type: Number, default: 1 });
const settings = defineModel('settings', { type: [Object, null], default: null });

/*
const props = defineProps({
  scale: {
    type: Number,
    default: 1,
  },
  settings: {
    type: [Object, null],
    default: null,
  },
});
*/

name.value = "BBox";
cursor.value = "copy";
// const scale = ref(props.scale);
const icon = ref("fa-object-group");
const scaleFactor = 3;
const bbox = ref(null);
const selection = ref(null);

const localCurrentAnnotation=ref(null);
const localCurrentCategory=ref(null);

const polygon = ref({
  path: null,
  guidance: true,
  pathOptions: {
    strokeColor: "black",
    strokeWidth: 1,
  },
});

const color = ref({
  blackOrWhite: true,
  auto: true,
  radius: 10,
  circle: null,
});

const actionTypes = Object.freeze({
  ADD_POINTS: "Added Points",
  CLOSED_POLYGON: "Closed Polygon",
  DELETE_POLYGON: "Delete Polygon",
});

const actionPoints = ref(0);

const localImageRaster = ref(null);

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

watch(
  () => getCurrentCategory(),
  (value) => {
      localCurrentCategory.value=value;
  }
);

const exportBBox = () => {
  return {
    completeDistance: polygon.value.completeDistance,
    minDistance: polygon.value.minDistance,
    blackOrWhite: color.value.blackOrWhite,
    auto: color.value.auto,
    radius: color.value.radius,
  };
};

const setPreferences = (pref) => {
  color.value.blackOrWhite = pref.blackOrWhite || color.value.blackOrWhite;
  color.value.auto = pref.auto || color.value.auto;
  color.value.radius = pref.radius || color.value.radius;
};

const createBBox = (event) => {
  polygon.value.path = new paper.Path(polygon.value.pathOptions);
  bbox.value = new BBox(event.point);
  bbox.value.getPoints().forEach((point) => polygon.value.path.add(point));
};

const modifyBBox = (event) => {
  polygon.value.path = new paper.Path(polygon.value.pathOptions);
  bbox.value.modifyPoint(event.point);
  bbox.value.getPoints().forEach((point) => polygon.value.path.add(point));
};

const deleteBbox = () => {
  if (polygon.value.path == null) return;
  polygon.value.path.remove();
  polygon.value.path = null;
  if (color.value.circle == null) return;
  color.value.circle.remove();
  color.value.circle = null;
};

const autoStrokeColor = (point) => {
  if (color.value.circle == null) return;
  if (polygon.value.path == null) return;
  if (!color.value.auto) return;
  color.value.circle.position = point;
  // let raster = $parent.image.raster;
  let raster = localImageRaster.value;
  let averageColor = raster.getAverageColor(color.value.circle);

  if (averageColor) {
    polygon.value.pathOptions.strokeColor = invertColor(
      averageColor.toCSS(true),
      color.value.blackOrWhite
    );
  }
};

const checkAnnotationExist = computed(() => {
  return (
  !!localCurrentAnnotation.value &&
  !!localCurrentAnnotation.value.annotation.paper_object.length
  /*
    !!$parent.currentAnnotation &&
    !!$parent.currentAnnotation.annotation.paper_object.length*/
  );
});


const onMouseDown = (event) => {
  if (polygon.value.path === null && checkAnnotationExist) {
    localCurrentCategory.value.createAnnotation();
    // $parent.currentCategory.createAnnotation();
  }
  if (polygon.value.path === null) {
    createBBox(event);
    return;
  }
  removeLastBBox();
  modifyBBox(event);
  if (completeBBox()) return;
};

const onMouseMove = (event) => {
  if (polygon.value.path === null) return;
  if (polygon.value.path.segments.length === 0) return;
  autoStrokeColor(event.point);
  removeLastBBox();
  modifyBBox(event);
};


const undoPoints = (args) => {
  if (polygon.value.path === null) return;
  let points = args.points;
  let length = polygon.value.path.segments.length;
  polygon.value.path.removeSegments(length - points, length);
};

function completeBBox() {
  if (polygon.value.path == null) return false;
  polygon.value.path.fillColor = "black";
  polygon.value.path.closePath();
  uniteCurrentAnnotation(polygon.value.path, true, true, true);
  // $parent.uniteCurrentAnnotation(polygon.value.path, true, true, true);
  polygon.value.path.remove();
  polygon.value.path = null;
  if (color.value.circle) {
    color.value.circle.remove();
    color.value.circle = null;
  }
  // removeUndos(actionTypes.ADD_POINTS);
  // store.commit('removeUndos', actionTypes.ADD_POINTS);
  procStore.removeUndos(actionTypes.ADD_POINTS);
  return true;
};

function removeLastBBox() {
  polygon.value.path.removeSegments();
};

const isDisabled = computed(() => {
  return state.isDisabled;
});

const isActive = computed(() => {
  return state.isActive;
});

watch(
 () => scale.value, 
 (newScale) => {
  polygon.value.pathOptions.strokeWidth = newScale * scaleFactor;
  if (polygon.value.path != null) {
    polygon.value.path.strokeWidth = newScale * scaleFactor;
  }
});

watch(
  () => polygon.value.pathOptions.strokeColor,
  (newColor) => {
    if (polygon.value.path == null) return;
    polygon.value.path.strokeColor = newColor;
  }
);

watch(
  () => color.value.auto, 
  (value) => {
  if (value && polygon.value.path) {
    color.value.circle = new paper.Path.Rectangle(
      new paper.Point(0, 0),
      new paper.Size(10, 10)
    );
  }

  if (!value && color.value.circle) {
    color.value.circle.remove();
    color.value.circle = null;
  }
});

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
    // state.tool.onMouseDrag = onMouseDrag;
    state.tool.onMouseMove = onMouseMove;
    // state.tool.onMouseUp = onMouseUp;
})

defineExpose({exportBBox, deleteBbox, setPreferences, bbox, name, color, polygon});

</script>
