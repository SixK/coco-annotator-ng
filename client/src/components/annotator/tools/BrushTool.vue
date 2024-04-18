<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>
<script setup>
import { ref, computed, watch, inject, onMounted, provide} from 'vue'
import { useTools } from "@/composables/toolBar/tools";
import paper from 'paper';

const scale = defineModel('scale', { type: Number, default: 1 });

const uniteCurrentAnnotation = inject('uniteCurrentAnnotation');

const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

name.value = "Brush";
cursor.value = "none";
const icon = ref("fa-paint-brush");
const scaleFactor = 3;

const brush = ref({
  path: null,
  pathOptions: {
    strokeColor: "white",
    strokeWidth: 1,
    radius: 30,
  },
});
const selection = ref(null);

watch(
  () => brush.value.pathOptions.radius,
  () => {
    if (brush.value.path == null) return;
    let position = brush.value.path.position;
    brush.value.path.remove();
    createBrush(position);
  }
);

watch(
  () => brush.value.pathOptions.strokeColor,
  (newColor) => {
    if (brush.value.path == null) return;
    brush.value.path.strokeColor = newColor;
  }
);


watch(
  () => state.isActive,
  (active) => {
    if (brush.value.path != null) {
      brush.value.path.visible = active;
    }
  }
);


watch(
  () => scale.value,
  (newScale) => {
    brush.value.pathOptions.strokeWidth = newScale * scaleFactor;    
    if (brush.value.path != null)
      brush.value.path.strokeWidth = newScale * scaleFactor;
  }
);

const draw = () => {
      let newSelection = selection.value.unite(brush.value.path);

      selection.value.remove();
      selection.value = newSelection;
};
const removeBrush = () => {
  if (brush.value.path != null) {
    brush.value.path.remove();
    brush.value.path = null;
  }
};

const removeSelection = () => {
  if (selection.value != null) {
    selection.value.remove();
    selection.value = null;
  }
};

const moveBrush = (point) => {
  if (brush.value.path == null) createBrush();
  brush.value.path.bringToFront();
  brush.value.path.position = point;
};

const createBrush = (center) => {
  center = center || new paper.Point(0, 0);
  brush.value.path = new paper.Path.Circle({
    strokeColor: brush.value.pathOptions.strokeColor,
    strokeWidth: brush.value.pathOptions.strokeWidth,
    radius: brush.value.pathOptions.radius,
    center: center,
  });
};

const createSelection = () => {
  selection.value = new paper.Path({
    strokeColor: brush.value.pathOptions.strokeColor,
    strokeWidth: brush.value.pathOptions.strokeWidth,
  });
};

const onMouseMove = (event) => {
  moveBrush(event.point);
};

const onMouseDown = () => {
  createSelection();
  draw();
};

const onMouseUp = () => {
  merge();
  removeSelection();
};

const onMouseDrag = (event) => {
  moveBrush(event.point);
  draw();
};

const merge = () => {
  uniteCurrentAnnotation(selection.value);
};
const decreaseRadius = () => {
  if (!state.isActive) return;
  brush.value.pathOptions.radius -= 2;
};
const increaseRadius = () => {
  if (!state.isActive) return;
  brush.value.pathOptions.radius += 2;
};
const exportBrush = () => {
  return {
    strokeColor: brush.value.pathOptions.strokeColor,
    radius: brush.value.pathOptions.radius,
  };
};
const setPreferences = (pref) => {
  brush.value.pathOptions.strokeColor =
    pref.strokeColor || brush.value.pathOptions.strokeColor;
  brush.value.pathOptions.radius =
    pref.radius || brush.value.pathOptions.radius;
};

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
    state.tool.onMouseDrag = onMouseDrag;
    state.tool.onMouseMove = onMouseMove;
    state.tool.onMouseUp = onMouseUp;
})

defineExpose({exportBrush, increaseRadius, decreaseRadius, setPreferences, brush, name});

</script>
