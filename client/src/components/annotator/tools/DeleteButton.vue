<template>
  <div>
    <i v-tooltip.right="name" class='fa fa-x' :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)"></i>
    <br>
  </div>
</template>
<script setup>
import axios from "axios";
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";

const { iconColor, click } = useButton();

const save = inject('save');

const props = defineProps({
  image: {
      type: Object,
      required: true,
    },
});

const name =  ref("Delete Image");
const icon = ref("fa-trash-o");

const execute = () => {
    axios.delete("/api/image/" + props.image.id).then(() => {});
}

</script>
