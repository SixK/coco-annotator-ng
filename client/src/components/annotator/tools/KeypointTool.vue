<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>

<script setup>
import { ref, computed, inject, watchEffect, onMounted, provide } from 'vue'
import { useTools } from "@/composables/toolBar/tools";

const { getCurrentAnnotation } = inject('annotator');


const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();


const isActive = computed(() => {
  return state.isActive;
});

const { scale } = defineProps({ scale: { type: Number, default: 1 } });

name.value = "Keypoint";
cursor.value = "cell";
const icon = ref("fa-map-marker");
const localCurrentAnnotation = computed(() => getCurrentAnnotation());


const onMouseDown = (event) => {
  if(state.isActive)  localCurrentAnnotation.value.addKeypoint(event.point);
};

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
});

defineExpose({click, name, isActive});


</script>
