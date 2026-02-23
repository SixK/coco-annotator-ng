<template>
  <div>
    <PanelInputNumber
      v-model:value="sam2.settings.threshold"
      name="Threshold"
      min="0"
      max="100"
      step="0.1"
      @update="sam2.settings.treshold = $event"
    />
    <PanelInputNumber
      v-model:value="sam2.settings.maxhole"
      name="Max Hole Area"
      min="0"
      max="100"
      step="0.1"
      @update="sam2.settings.maxhole = $event"
    />
    <PanelInputNumber
      v-model:value="sam2.settings.maxsprinkle"
      name="Max Sprinkle Area"
      min="0"
      max="100"
      step="0.1"
      @update="sam2.settings.maxsprinkle = $event"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from "@/components/PanelInputNumber";

const sam2 = defineModel('sam2', { type: Object, required: true });

</script>
