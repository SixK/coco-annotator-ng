<template>
  <div class="input-group tool-input-group">
    <div class="input-group-prepend tool-option-pre">
      <span class="input-group-text tool-option-font">{{ name }}</span>
    </div>
    <input
      v-model.number="value"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      class="form-control tool-option-input"
    >
  </div>
</template>

<script setup>

// `value` is the only two-way binding (every parent uses `v-model:value`);
// name/max/min/step are read-only configuration → plain props (Vue 3.5
// reactive props destructure, so the template keeps reading them live).
const { name, max, min, step } = defineProps({
  name: { type: String, required: true },
  max: { type: String, default: '10' },
  min: { type: String, default: '1' },
  step: { type: String, default: '1' },
});

const value = defineModel('value', { type: Number, required: true });

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
