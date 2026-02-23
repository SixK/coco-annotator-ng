<template>
  <div>
    <PanelInputNumber
      v-model:value="brush.brush.pathOptions.radius"
      name="Radius"
      min="0"
      max="1000"
      step="5"
      @update="brush.brush.pathOptions.radius = $event"
    />
    <PanelInputString
      v-model:input-string="brush.brush.pathOptions.strokeColor"
      name="Stroke Color"
    />
  </div>
</template>

<script setup>
import PanelInputString from "@/components/PanelInputString";
import PanelInputNumber from "@/components/PanelInputNumber";

const brush = defineModel('brush', { type: Object, required: true });

</script>
