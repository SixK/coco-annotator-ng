<template>
  <div>
    <i v-tooltip.right="name" class='fa fa-x' :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)"></i>
    <br>
  </div>
</template>
<script setup>
import { ref, computed, watch, inject, onMounted, provide } from 'vue'
import { useButton } from "@/composables/toolBar/button";

const { iconColor, click } = useButton();

const emit = defineEmits(["update:mode"]);


const mode = defineModel('mode', { type: null, required: true });

/*
const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
});
*/

// const mode = ref(props.mode);

const name = ref("Mode: "+mode.value);

const icon = computed(() => {
  if (mode.value === 'segment') return 'fa-pencil-square-o';
  if (mode.value === 'label') return 'fa-tags';
  return '';
});

/*
const toggleMode = () => {
  const newMode = props.mode === 'segment' ? 'label' : 'segment';
  // Emit the update event to sync with the parent component
  emit('update', newMode);
};
*/

watch(
   () => mode.value, 
   (newVal) => {
       console.log('mode: ', newVal);
        name.value = "Mode: " + newVal;
        mode.value = newVal;
    }
);

const next = () => {
  if (mode.value === "segment") return "label";
  return "segment";
};

const execute = () => {
  emit("update:mode", next());
};

</script>
