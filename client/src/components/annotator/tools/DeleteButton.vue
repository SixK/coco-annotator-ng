<template>
  <div>
    <i v-tooltip.right="name" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click(execute)" />
    <br>
  </div>
</template>

<script setup>
import Images from "@/models/images";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useButton } from "@/composables/toolBar/button";
import useAxiosRequest from "@/composables/axiosRequest";

const { iconColor, click } = useButton();
const { axiosRequestError } = useAxiosRequest();
const router = useRouter();

const image = defineModel("image", { type: Object, required: true });

const name = ref("Delete Image");
const icon = ref("fa-trash-o");

const execute = async () => {
  try {
    await Images.delete(image.value.id);
    router.go(-1);
  } catch (error) {
    axiosRequestError("Deleting Image", error);
  }
};
</script>
