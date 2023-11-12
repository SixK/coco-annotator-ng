<template>
  <div>
    <i v-tooltip.right="name" class='fa fa-x' :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)"></i>
    <br>
  </div>
</template>
<script setup>
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";

const { iconColor, click } = useButton();

const save = inject('save');

const name =  ref("Save");
const icon = ref("fa-save");

const execute = () => {
    save();
}

</script>
