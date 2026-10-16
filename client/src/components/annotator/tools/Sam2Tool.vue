<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>
<script setup>
import { useInteractivePointTool } from "@/composables/useInteractivePointTool";

const { scale } = defineProps({ scale: { type: Number, default: 1 } });

const { click, icon, iconColor, tooltip, name, points, settings } = useInteractivePointTool({
  name: "SAM2",
  icon: "fa-crosshairs",
  endpoint: "/api/model/sam2",
  defaultSettings: { threshold: 0, maxhole: 0, maxsprinkle: 0 },
});

defineExpose({ points, settings, name });
</script>
