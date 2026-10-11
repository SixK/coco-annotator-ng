<template>
  <div>
    <PanelInputNumber
      v-model:value="sam.settings.padding"
      name="Padding"
      min="0"
      max="1000"
      step="2"
    />
    <PanelInputNumber
      v-model:value="sam.settings.threshold"
      name="Threshold"
      min="0"
      max="100"
      step="5"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from "@/components/PanelInputNumber";

const sam = defineModel('sam', { type: Object, required: true });

</script>
