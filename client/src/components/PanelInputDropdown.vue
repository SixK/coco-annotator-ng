<template>
  <div class="input-group tool-input-group">
    <div class="input-group-prepend tool-option-pre">
      <span class="input-group-text tool-option-font">{{ name }}</span>
    </div>
    <select
      v-model="value"
      class="form-control tool-option-input"
    >
      <option
        v-for="option in options"
        :key="option.key"
        :value="option.key"
        :selected="option.selected"
      >
        {{ option.value }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const name = defineModel('name', { type: String, required: true });
const value = defineModel('value', { type: [Number, Array, Object, String], required: true });
const values = defineModel('values', { type: Object, required: true });


const options = computed(() => {
  let array = [];
  Object.keys(values.value).forEach((k) => {
    array.push({
      key: k,
      value: values.value[k],
      selected: value.value == k,
    });
  });
  return array;
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
  font-size: 12px;
  height: 20px;
}
</style>
