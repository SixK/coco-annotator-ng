<template>
  <div class="input-group tool-input-group">
    <div class="input-group-prepend tool-option-pre">
      <span class="input-group-text tool-option-font">{{ name }}</span>
    </div>
    <input
      v-model="inputString"
      class="form-control tool-option-input"
      @keyup.enter="submit"
    >
  </div>
</template>
<script setup>

const { name } = defineProps({ name: { type: String, required: true } });
const inputString = defineModel('inputString', { type: String, required: true });

const emit = defineEmits(['submit']);

const submit = () => {
  emit('submit');
};

</script>

<style scoped>
.tool-input-group {
  padding-top: 3px;
}

.tool-option-pre {
  background-color: var(--app-surface-dark);
}

.tool-option-font {
  border-color: var(--app-surface);
  background-color: var(--app-surface-dark);
  color: white;
  font-size: 12px;
  height: 20px;
}

.tool-option-input {
  display: table-cell;
  border-color: var(--app-surface);
  color: white;
  padding: 0 0 0 3px;
  background-color: var(--app-surface-dark);
  font-size: 12px;
  height: 20px;
}
</style>
