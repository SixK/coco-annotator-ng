<template>
  <button
    class="btn btn-outline-light tool-input-button"
    @click="$emit('click')"
  >
    {{ name }}
  </button>
</template>
<script setup>
/*
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});*/
const name = defineModel('name', { type: String, required: true });

const emit = defineEmits(['click'])
</script>

<style scoped>
.tool-input-button {
  height: 20px;
  border-color: #4b5162;
  padding: 0 0 0 11px;
  font-size: 12px;
  width: 100%;
}

.tool-input-button:hover {
  border-color: lightgray;
  background-color: white;
}
</style>
