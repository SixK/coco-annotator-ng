<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, watchEffect, onMounted, provide } from 'vue'
import { useTools } from "@/composables/toolBar/tools";
import paper from 'paper';

const scale = defineModel('scale', { type: Number, default: 1 });

const getCurrentAnnotation = inject('getCurrentAnnotation');

const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

name.value = "Eraser";
cursor.value = "none";
const icon = ref("fa-eraser");
const scaleFactor = 3;
const localCurrentAnnotation=ref('');

const eraser = ref({
  brush: null,
  minimumArea: 10,
  pathOptions: {
    strokeColor: "white",
    strokeWidth: 1,
    radius: 30,
  },
});

watch(
  () => getCurrentAnnotation(),
  (value) => {
      localCurrentAnnotation.value=value;
  }
);

watch(
  () => eraser.value.pathOptions.radius,
  () => {
    if (eraser.value.brush == null) return;
    let position = eraser.value.brush.position;
    eraser.value.brush.remove();
    createBrush(position);
  }
);

watch(
  () => eraser.value.pathOptions.strokeColor,
  (newColor) => {
    if (eraser.value.brush == null) return;
    eraser.value.brush.strokeColor = newColor;
  }
);

watch(
  () => state.isActive,
  (active) => {
    if (eraser.value.brush != null) {
      eraser.value.brush.visible = active;
    }
  }
);

watch(
    () => scale.value, 
    (newScale) => {
      eraser.value.pathOptions.strokeWidth = newScale * scaleFactor;
      if (eraser.value.brush != null)
        eraser.value.brush.strokeWidth = newScale * scaleFactor;
});

const removeBrush = () => {
      if (eraser.value.brush != null) {
        eraser.value.brush.remove();
        eraser.value.brush = null;
      }
};
const moveBrush = (point) => {
      if (eraser.value.brush == null) createBrush();
      eraser.value.brush.bringToFront();
      eraser.value.brush.position = point;
};

const createBrush = (center) => {
  center = center || new paper.Point(0, 0);
  eraser.value.brush = new paper.Path.Circle({
    strokeColor: eraser.value.pathOptions.strokeColor,
    strokeWidth: eraser.value.pathOptions.strokeWidth,
    radius: eraser.value.pathOptions.radius,
    center: center,
  });
};

const onMouseMove = (event) => {
  moveBrush(event.point);
};

const onMouseDrag = (event) => {
  moveBrush(event.point);
  erase();
};

const onMouseDown = () => {
  // $parent.currentAnnotation.createUndoAction('Subtract');
  localCurrentAnnotation.value.createUndoAction('Subtract');
  erase();
};

const onMouseUp = () => {
  // $parent.currentAnnotation.simplifyPath();
  localCurrentAnnotation.value.simplifyPath();
};

const erase = () => {
  // $parent.currentAnnotation.subtract(eraser.value.brush, false, false);
    localCurrentAnnotation.value.subtract(eraser.value.brush, false, false);
};

const decreaseRadius = () => {
      if (!state.isActive) return;
      eraser.value.pathOptions.radius -= 2;
};

const increaseRadius = () => {
      if (!state.isActive) return;
      eraser.value.pathOptions.radius += 2;
};

const exportEraser = () => {
      return {
        strokeColor: eraser.value.pathOptions.strokeColor,
        radius: eraser.value.pathOptions.radius,
      };
};
    
const setPreferences = (pref) => {
      eraser.value.pathOptions.strokeColor =
        pref.strokeColor || eraser.value.pathOptions.strokeColor;
      eraser.value.pathOptions.radius =
        pref.radius || eraser.value.pathOptions.radius;
};

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
    state.tool.onMouseDrag = onMouseDrag;
    state.tool.onMouseMove = onMouseMove;
    state.tool.onMouseUp = onMouseUp;
})

defineExpose({exportEraser, increaseRadius, decreaseRadius, setPreferences, eraser, name});

</script>
