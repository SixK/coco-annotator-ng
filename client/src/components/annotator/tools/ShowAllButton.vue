<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import { ref, computed, watch, inject, onMounted, provide } from 'vue'
import { useButton } from "@/composables/toolBar/button";

const { iconColor, click } = useButton();

const { showAll } = inject('annotator');

const name =  ref("Show All");
const icon = ref("fa-eye");

const execute = () => {
    showAll();
}

</script>
