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
  name: "ZIM",
  icon: "fa-crosshairs",
  endpoint: "/api/model/zim",
  defaultSettings: { padding: 50, threshold: 80 },
});

defineExpose({ points, settings, name });
</script>
