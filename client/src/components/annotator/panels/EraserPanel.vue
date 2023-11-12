<template>
  <div v-show="showme">
    <PanelInputNumber
      v-model:value="eraser.eraser.pathOptions.radius"
      name="Radius"
      min="0"
      max="1000"
      step="5"
      @update="eraser.eraser.pathOptions.radius = $event"
    />
    <PanelInputString
      v-model:input-string="eraser.eraser.pathOptions.strokeColor"
      name="Stroke Color"
    />
  </div>
</template>

<script setup>
import PanelInputString from '@/components/PanelInputString';
import PanelInputNumber from '@/components/PanelInputNumber';
import { ref, inject, watchEffect } from 'vue';

const props = defineProps({
  eraser: {
    type: Object,
    required: true,
  },
});

const eraser = ref(props.eraser);
const showme = ref('false');
const getActiveTool = inject('getActiveTool');

watchEffect(() => {
    showme.value = eraser.value.name === getActiveTool();
});
</script>
