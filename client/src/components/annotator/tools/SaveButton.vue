<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";
import { useSaveAndReload } from "@/composables/useSave";

const { iconColor, click } = useButton();

const { save } = inject('annotator');

const saveAndReload = useSaveAndReload();

const name =  ref("Save");
const icon = ref("fa-save");

const execute = () => saveAndReload(save);

</script>
