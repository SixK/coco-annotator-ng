<template>
  <div v-show="showme">
    <PanelToggle
      v-model:show-text="select.hover.showText"
      name="Show Hover Text"
    />
  </div>
</template>

<script setup>
import PanelToggle from "@/components/PanelToggle";

const select = defineModel('select', { type: Object, required: true });

</script>
