<template>
  <div class="tool-option-input tool-option-font">
    <p>{{ name }}</p>
  </div>
</template>
<script setup>

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.tool-option-font {
  border-color: #4b5162;
  background-color: #383c4a;
  color: white;
  font-size: 12px;
  height: 20px;
  padding: 2px 0 0 0;
}
</style>
