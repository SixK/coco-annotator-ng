<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useButton } from "@/composables/toolBar/button";

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

const { iconColor, click } = useButton();

const icon = ref("fa-undo");
const disabled = ref(true);
const undoList = computed(() => procStore.undo);

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

watch(
  undoList.value,
  () => {
    disabled.value = undoList.value.length === 0;
  },
  { immediate: true }
  );
  
</script>
