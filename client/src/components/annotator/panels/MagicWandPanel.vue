<template>
  <div v-show="showme">
    <PanelInputNumber
      v-model:value="magicwand.wand.threshold"
      name="Threshold"
      min="0"
      max="1000"
      step="5"
      @update="magicwand.wand.threshold = $event"
    />
    <PanelInputNumber
      v-model:value="magicwand.wand.blur"
      name="Blur"
      min="0"
      max="1000"
      step="5"
      @update="magicwand.wand.blur = $event"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from '@/components/PanelInputNumber';
import { ref, inject, watchEffect } from 'vue';

const magicwand = defineModel('magicwand', { type: Object, required: true });

const showme = ref(false);
const { getActiveTool } = inject('annotator');

watchEffect(() => {
    showme.value = magicwand.value.name === getActiveTool();
});

</script>
