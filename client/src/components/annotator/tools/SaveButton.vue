<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute, disabled)" />
    <br>
  </div>
</template>
<script setup>
import { ref, inject } from 'vue'
import { useButton } from "@/composables/toolBar/button";
import { useRouter } from 'vue-router';
const router = useRouter();

const { iconColor, click } = useButton();

const save = inject('save');

const name =  ref("Save");
const icon = ref("fa-save");

const execute = () => {
    save();
    // Hack to force reload the page
    // Cause keypoints points modifications are not propagated to annotation.keypoints
    // but modifications are saved
    setTimeout(() => {
        router.go(0);
    }, 200); // need to wait axios has finished :(
}

</script>
