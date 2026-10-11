<template>
  <div>
    <PanelInputNumber
      v-model:value="zim.settings.padding"
      name="Padding"
      min="0"
      max="1000"
      step="2"
    />
    <PanelInputNumber
      v-model:value="zim.settings.threshold"
      name="Threshold"
      min="0"
      max="100"
      step="5"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from "@/components/PanelInputNumber";

const zim = defineModel('zim', { type: Object, required: true });

</script>
