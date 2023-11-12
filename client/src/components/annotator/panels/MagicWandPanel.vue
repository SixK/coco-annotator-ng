<template>
  <div v-show="showme">
    <PanelInputNumber
      v-model:value="magicwand.wand.threshold"
      name="Threshold"
      min="0"
      max="1000"
      step="5"
      @update="magicwand.wand.threshold"
    />
    <PanelInputNumber
      v-model:value="magicwand.wand.blur"
      name="Blur"
      min="0"
      max="1000"
      step="5"
      @update="magicwand.wand.blur"
    />
  </div>
</template>

<script setup>
import PanelInputNumber from '@/components/PanelInputNumber';
import { ref, inject, watchEffect } from 'vue';

const props = defineProps({
  magicwand: {
    type: Object,
    required: true,
  },
});

const magicwand = ref(props.magicwand);
const showme = ref('false');
const getActiveTool = inject('getActiveTool');

watchEffect(() => {
    showme.value = magicwand.value.name === getActiveTool();
});

</script>
