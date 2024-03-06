<template>
  <div v-show="showme">
    <PanelInputNumber
      v-model:value="sam.settings.padding"
      name="Padding"
      min="0"
      max="1000"
      step="2"
      @update="sam.settings.padding = $event"
    />
    <PanelInputNumber
      v-model:value="sam.settings.threshold"
      name="Threshold"
      min="0"
      max="100"
      step="5"
      @update="sam.settings.threshold = $event"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from "@/components/PanelInputNumber";
import { ref, inject, watchEffect } from 'vue';

const sam = defineModel('sam', { type: Object, required: true });

const showme = ref('false');
const getActiveTool = inject('getActiveTool');

watchEffect(() => {
    showme.value = sam.value.name === getActiveTool();
});

</script>
