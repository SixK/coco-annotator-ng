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

const execute = async () => {
  try {
    if (typeof save === 'function') {
      await save();
    }
    // Force reload after successful save.
    setTimeout(() => {
        router.go(0);
    }, 200); // need to wait axios has finished :(
  } catch (err) {
    console.error('Error saving:', err);
    // Optionally show a notification to user
  }
}

</script>
