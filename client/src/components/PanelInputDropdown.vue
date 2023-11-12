<template>
  <div class="input-group tool-input-group">
    <div class="input-group-prepend tool-option-pre">
      <span class="input-group-text tool-option-font">{{ name }}</span>
    </div>
    <select
      v-model="localValue"
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


const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, Array, Object, String],
    required: true,
  },
  values: {
    type: Object,
    required: true,
  },
});


const emits = defineEmits(['update:value']);
const localValue = ref(props.value);

const options = computed(() => {
 console.log('inputdropdown:', props.values);
  let array = [];
  Object.keys(props.values).forEach((k) => {
    array.push({
      key: k,
      value: props.values[k],
      selected: localValue.value == k,
    });
  });
  return array;
});
watch(
  () => localValue.value, 
  () => {
    console.log('localValue changed:',  localValue.value);
    emits('update:value', localValue.value);
});
watch(
  () => props.value, 
  (newValue) => {
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
  font-size: 12px;
  height: 20px;
}
</style>
