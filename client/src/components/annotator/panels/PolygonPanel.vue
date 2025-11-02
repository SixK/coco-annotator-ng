<template>
  <div v-show="showme">
    <PanelButton
      name="Close Polygon"
      @click="polygon.complete"
    />
    <PanelButton
      name="Delete Polygon"
      @click="polygon.deletePolygon"
    />
    <PanelToggle
      v-model:show-text="polygon.polygon.guidance"
      name="Guidance"
    />
    <PanelToggle
      v-model:show-text="polygon.color.auto"
      name="Auto Select Color"
    />
    <PanelToggle
      v-show="polygon.color.auto"
      v-model:show-text="polygon.color.blackOrWhite"
      name="Only Black or White"
    />
    <PanelInputString
      v-model:input-string="polygon.polygon.pathOptions.strokeColor"
      name="Stroke Color"
    />
    <PanelInputNumber
      v-model:value="polygon.polygon.completeDistance"
      name="Auto Complete Distance"
      min="0"
      max="1000"
      step="5"
      @update="polygon.polygon.completeDistance = $event"
    />
    <PanelInputNumber
      v-model:value="polygon.polygon.minDistance"
      name="Min Distance"
      min="0"
      max="500"
      step="2"
      @update="polygon.polygon.minDistance = $event"
    />
  </div>
</template>

<script setup>
import PanelButton from "@/components/PanelButton";
import PanelToggle from "@/components/PanelToggle";
import PanelInputString from "@/components/PanelInputString";
import PanelInputNumber from "@/components/PanelInputNumber";
import { ref, inject, watchEffect } from 'vue';

const polygon = defineModel('polygon', { type: Object, required: true });

const showme = ref(false);
const getActiveTool = inject('getActiveTool');

watchEffect(() => {
    showme.value = polygon.value.name === getActiveTool();
});

</script>
