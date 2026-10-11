<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useButton } from "@/composables/toolBar/button";

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

const { iconColor, click } = useButton();

const icon = ref("fa-undo");
const undoList = computed(() => procStore.undo);
// Was a ref kept in sync by `watch(undoList.value, () => …, { immediate: true })`.
// `undoList.value` is only a deep-reactive array by accident of Pinia; a plain
// array there would have been parsed as a multi-source array and never fired.
// As a computed it can never go stale.
const disabled = computed(() => undoList.value.length === 0);

const name = computed(() => {
  const length = undoList.value.length;
  if (length == 0) {
    return "Nothing to undo";
  }

  const last = undoList.value[length - 1];
  return "Undo (Last Action: " + last.name + " " + last.action + ")";
});
const execute = () => {
  procStore.doUndo();
};
  
</script>
