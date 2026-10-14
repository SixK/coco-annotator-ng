<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>
<script setup>
import paper from "paper";
import MagicWand from "./magic-wand";
import { ref, computed, inject, onMounted } from 'vue'
import { useTools } from "@/composables/toolBar/tools";

const { getCurrentAnnotation } = inject('annotator');

const { width, height } = defineProps({
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
});
const imageData = defineModel('imageData', { required: true, 
                                                                           validator: prop => typeof prop === "object" || prop === null });


const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

name.value = 'MagicWand';
cursor.value = 'crosshair';

const icon = ref('fa-magic');
const imageInfo = ref({});

const wand = ref({
  threshold: 30,
  blur: 40,
});


const localCurrentAnnotation = computed(() => getCurrentAnnotation());



const exportWand = () => {
  return {
    threshold: wand.value.threshold,
    blur: wand.value.blur,
  };
};

const setPreferences = (pref) => {
  wand.value.threshold = pref.threshold || wand.value.threshold;
  wand.value.blur = pref.blur || wand.value.blur;
};


/**
 * Creates MagicWand selection
 * @param {number} x x position
 * @param {number} y y position
 * @param {number} thr threashold
 * @param {number} rad radius blur
 * @returns {paper.CompoundPath} create selection
 */
const flood = (x, y, thr, rad) => {
  if (imageData.value == null) return;

  const image = {
    data: imageData.value.data,
    width: width,
    height: height,
    bytes: 4,
  };
  let mask = MagicWand.floodFill(image, x, y, thr);
  rad = rad < 1 ? 1 : Math.abs(rad);
  mask = MagicWand.gaussBlurOnlyBorder(mask, rad);
  const contours = MagicWand.traceContours(mask).filter((x) => !x.inner);
  if (contours[0]) {
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    let points = contours[0].points;
    points = points.map((pt) => ({
      x: pt.x + 0.5 - centerX,
      y: pt.y + 0.5 - centerY,
    }));
    const polygon = new paper.Path(points);
    polygon.closed = true;
    return polygon;
  }
  return null;
};

const onMouseDown = (event) => {
      const x = Math.round(width / 2 + event.point.x);
      const y = Math.round(height / 2 + event.point.y);

      // Check if valid coordinates
      if (x > width || y > height || x < 0 || y < 0) {
        return;
      }

      // Create shape and apply to current annotation
      const path = flood(x, y, wand.value.threshold, wand.value.blur);

      if (event.modifiers.shift) {
        // this.$parent.currentAnnotation.subtract(path);
        localCurrentAnnotation.value.subtract(path);
      } else {
        // this.$parent.currentAnnotation.unite(path);
        localCurrentAnnotation.value.unite(path);
      }

      if (path != null) path.remove();
};

const onMouseDrag = (event) => {
      onMouseDown(event);
};

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
    state.tool.onMouseDrag = onMouseDrag;
    // state.tool.onMouseMove = onMouseMove;
    // state.tool.onMouseUp = onMouseUp;
})

defineExpose({exportWand, setPreferences, wand, name});

</script>
