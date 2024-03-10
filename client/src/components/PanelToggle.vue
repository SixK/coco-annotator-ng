<template>
  <button
    class="btn btn-outline-light tool-input-button"
    :class="{ active: showText }"
    @click="showText =!showText"
  >
    {{ name }}
  </button>
</template>

<script setup>

const name = defineModel('name', { type: String, required: true });
const showText = defineModel('showText', { type: Boolean, required: true });

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
  background-color: transparent;
  color: white;
}
</style>
