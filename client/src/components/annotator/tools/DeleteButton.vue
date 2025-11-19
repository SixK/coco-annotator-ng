<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import axios from "axios";
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";

const { iconColor, click } = useButton();

const { save } = inject('annotator');

const image = defineModel('image', { type: Object, required: true });

const name =  ref("Delete Image");
const icon = ref("fa-trash-o");

const execute = () => {
    axios.delete("/api/image/" + image.value.id).then(() => {});
}

</script>
