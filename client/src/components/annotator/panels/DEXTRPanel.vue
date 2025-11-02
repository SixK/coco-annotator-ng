<template>
  <div v-show="showme">
    <PanelInputNumber
      v-model:value="dextr.settings.padding"
      name="Padding"
      min="0"
      max="1000"
      step="2"
      @update="dextr.settings.padding = $event"
    />
    <PanelInputNumber
      v-model:value="dextr.settings.threshold"
      name="Threshold"
      min="0"
      max="100"
      step="5"
      @update="dextr.settings.threshold = $event"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from "@/components/PanelInputNumber";
import { ref, inject, watchEffect } from 'vue';

const dextr = defineModel('dextr', { type: Object, required: true });

const showme = ref(false);
const getActiveTool = inject('getActiveTool');

watchEffect(() => {
    showme.value = dextr.value.name === getActiveTool();
});

</script>
