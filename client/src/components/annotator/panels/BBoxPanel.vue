<template>
  <div>
    <PanelButton
      name="Delete BBox"
      @click="bbox.deleteBbox"
    />
    <PanelToggle
      v-model:show-text="bbox.color.auto"
      name="Auto Select Color"
    />
    <PanelToggle
      v-show="bbox.color.auto"
      v-model:show-text="bbox.color.blackOrWhite"
      name="Only Black or White"
    />
    <PanelInputString
      v-model:input-string="bbox.polygon.pathOptions.strokeColor"
      name="Stroke Color"
    />
  </div>
</template>

<script setup>
import PanelButton from "@/components/PanelButton";
import PanelToggle from "@/components/PanelToggle";
import PanelInputString from "@/components/PanelInputString";

const bbox = defineModel('bbox', { type: Object, required: true });

</script>
