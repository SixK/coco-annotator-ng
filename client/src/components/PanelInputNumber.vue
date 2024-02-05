<template>
  <div class="input-group tool-input-group">
    <div class="input-group-prepend tool-option-pre">
      <span class="input-group-text tool-option-font">{{ name }}</span>
    </div>
    <input
      v-model.number="localValue"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      class="form-control tool-option-input"
    >
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const name = defineModel('name', { type: String, required: true });
const value = defineModel('value', { type: Number, required: true });
const max = defineModel('max', { type: String, default: '10' });
const min = defineModel('min', { type: String, default: '1' });
const step = defineModel('step', { type: String, default: '1' });

/*
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  max: {
    type: String,
    default: '10',
  },
  min: {
    type: String,
    default: '1',
  },
  step: {
    type: String,
    default: '1',
  },
});
*/

const emit = defineEmits(['update:value']);
const localValue = ref(value.value);

watch( 
  () => localValue.value, 
  () => {
    emit('update:value', localValue.value);
});
watch(() => value.value, (newValue) => {
  localValue.value = newValue;
});
</script>

<style scoped>
.tool-input-group {
  padding-top: 3px;
}

.tool-option-pre {
  background-color: #383c4a;
}

.tool-option-font {
  border-color: #4b5162;
  background-color: #383c4a;
  color: white;
  font-size: 12px;
  height: 20px;
}

.tool-option-input {
  display: table-cell;
  border-color: #4b5162;
  color: white;
  padding: 0 0 0 3px;
  background-color: #383c4a;
  height: 20px;
  font-size: 12px;
}
</style>
