<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>

<script setup>
import paper from "paper";
import UndoAction from "@/undo";
import { invertColor } from "@/libs/colors";
import { useTools } from "@/composables/toolBar/tools";
import { ref, computed, watch, inject, onMounted, provide } from 'vue'

const uniteCurrentAnnotation = inject('uniteCurrentAnnotation');
const save = inject('save');
const getImageRaster = inject('getImageRaster');

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

const scale = defineModel('scale', { type: Number, default: 1 });

name.value = "Polygon";
cursor.value = "copy";
const icon = ref("fa-pencil");
const scaleFactor = 3;


const polygon = ref({
  completeDistance: 5,
  minDistance: 2,
  path: null,
  guidance: true,
  simplify: 1,
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

const exportPolygon = () => {
  return {
    guidance: polygon.value.guidance,
    completeDistance: polygon.value.completeDistance,
    minDistance: polygon.value.minDistance,
    blackOrWhite: color.value.blackOrWhite,
    auto: color.value.auto,
    radius: color.value.radius,
  }
}

const setPreferences = (pref) => {
  polygon.value.guidance = pref.guidance || polygon.value.guidance
  polygon.value.completeDistance =
    pref.completeDistance || polygon.value.completeDistance
  polygon.value.minDistance = pref.minDistance || polygon.value.minDistance
  color.value.blackOrWhite = pref.blackOrWhite || color.value.blackOrWhite
  color.value.auto = pref.auto || color.value.auto
  color.value.radius = pref.radius || color.value.radius
}

const createPolygon = () => {
  if (color.value.auto) {
    color.value.circle = new paper.Path.Circle(
      new paper.Point(0, 0),
      color.value.radius
    );
  }
  polygon.value.path = new paper.Path(polygon.value.pathOptions);
};

const deletePolygon = () => {
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
  let avgcolor = raster.getAverageColor(color.value.circle);
  if (avgcolor) {
    polygon.value.pathOptions.strokeColor = invertColor(
      avgcolor.toCSS(true),
      color.value.blackOrWhite
    );
  }
};

const onMouseDrag = (event) => {
  if (polygon.value.path == null) return;
  actionPoints.value++;

  autoStrokeColor(event.point);
  polygon.value.path.add(event.point);
  autoComplete(30);
};

const onMouseDown = (event) => {
  let wasNull = false;
  if (polygon.value.path == null) {
    wasNull = true;
    createPolygon();
  }
  actionPoints.value = 1;
  polygon.value.path.add(event.point);
  if (autoComplete(3)) return;
  if (polygon.value.guidance && wasNull) polygon.value.path.add(event.point);
};

const onMouseUp = () => {
  if (polygon.value.path == null) return;
  let action = new UndoAction({
    name: name,
    action: actionTypes.ADD_POINTS,
    func: undoPoints,
    args: {
      points: actionPoints.value,
    },
  });
  // addUndo(action);
  // store.commit('addUndo', action);
  procStore.addUndo(action);
};

const onMouseMove = (event) => {
  if (polygon.value.path == null) return;
  if (polygon.value.path.segments.length === 0) return;
  autoStrokeColor(event.point);
  if (!polygon.value.guidance) return;
  removeLastPoint();
  polygon.value.path.add(event.point);
};
/**
 * Undo points
 */
const undoPoints = (args) => {
  if (polygon.value.path == null) return;
  let points = args.points;
  let length = polygon.value.path.segments.length;
  if (polygon.value.guidance) {
    length -= 1;
  }
  polygon.value.path.removeSegments(length - points, length);
};

const autoComplete = (minCompleteLength) => {
  if (polygon.value.path == null) return false;
  if (polygon.value.path.segments.length < minCompleteLength) return false;
  let last = polygon.value.path.lastSegment.point;
  let first = polygon.value.path.firstSegment.point;
  let completeDistance = polygon.value.completeDistance;
  if (last.isClose(first, completeDistance)) {
    return complete();
  }
  return false;
};

const complete = () => {
  if (polygon.value.path == null) return false;
  removeLastPoint();
  polygon.value.path.fillColor = "black";
  polygon.value.path.closePath();
  // $parent.uniteCurrentAnnotation(polygon.value.path);
  uniteCurrentAnnotation(polygon.value.path);
  polygon.value.path.remove();
  polygon.value.path = null;
  if (color.value.circle) {
    color.value.circle.remove();
    color.value.circle = null;
  }
  // removeUndos(actionTypes.ADD_POINTS);
  // store.commit('removeUndos', actionTypes.ADD_POINTS);
  procStore.removeUndos(actionTypes.ADD_POINTS);
  save();
  return true;
};

const removeLastPoint = () => { 
    polygon.value.path.removeSegment(polygon.value.path.segments.length - 1);
};

// need to understand why this scale is not triggered !?
watch(
   () => scale.value, 
   (newScale) => {
  polygon.value.pathOptions.strokeWidth = newScale * scaleFactor;
  if (polygon.value.path != null) {
    polygon.value.path.strokeWidth = newScale * scaleFactor;
  }
});


watch(
  () => polygon.value.guidance,
  (guidance) => {
      if (polygon.value.path == null) return;

      if (!guidance && polygon.value.path.length > 1) {
        removeLastPoint();
      }
    }
);
    
watch(
  () => polygon.value.minDistance,
  (newDistance) => {
      state.tool.minDistance = newDistance;
  }
);

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
    color.value.circle = new paper.Path.Circle(
      new paper.Point(0, 0),
      color.value.radius
    );
  }

  if (!value && color.value.circle) {
    color.value.circle.remove();
    color.value.circle = null;
  }
});

onMounted(() => {
    state.tool.minDistance = polygon.value.minDistance;
    state.tool.onMouseDown = onMouseDown;
    state.tool.onMouseDrag = onMouseDrag;
    state.tool.onMouseMove = onMouseMove;
    state.tool.onMouseUp = onMouseUp;
})

defineExpose({exportPolygon, deletePolygon, setPreferences, polygon, name, color, complete});

</script>
