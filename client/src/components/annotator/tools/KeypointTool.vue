<template>
  <div>
    <i v-tooltip.right="tooltip" class='fa fa-x' :class="icon" :style="{ color: iconColor }" @click="click"></i>
    <br>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, watchEffect, onMounted, provide } from 'vue'
import { useTools } from "@/composables/toolBar/tools";

const getCurrentAnnotation = inject('getCurrentAnnotation');


const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

const isDisabled = computed(() => {
  return state.isDisabled;
});

const isActive = computed(() => {
  return state.isActive;
});

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

name.value = "Keypoints";
cursor.value = "cell";
const scale = ref(props.scale);
const icon = ref("fa-map-marker");
const localCurrentAnnotation=ref('');

watch(
  () => getCurrentAnnotation(),
  (value) => {
      localCurrentAnnotation.value=value;
  }
);

const onMouseDown = (event) => {
  if(state.isActive)  localCurrentAnnotation.value.addKeypoint(event.point);
};

onMounted(() => {
    state.tool.onMouseDown = onMouseDown;
});

defineExpose({click, name, isActive});


</script>
