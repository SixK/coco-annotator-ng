<template>
  <div v-show="showme">
    <PanelInputNumber
      v-model:value="zim.settings.padding"
      name="Padding"
      min="0"
      max="1000"
      step="2"
      @update="zim.settings.padding = $event"
    />
    <PanelInputNumber
      v-model:value="zim.settings.threshold"
      name="Threshold"
      min="0"
      max="100"
      step="5"
      @update="zim.settings.threshold = $event"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from "@/components/PanelInputNumber";
import { ref, inject, watchEffect } from 'vue';

const zim = defineModel('zim', { type: Object, required: true });

const showme = ref('false');
const getActiveTool = inject('getActiveTool');

watchEffect(() => {
    showme.value = zim.value.name === getActiveTool();
});

</script>
