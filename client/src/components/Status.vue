<template>
  <div
    class="form-inline my-2 my-lg-0"
    style="margin-right: 10px"
  >
    <div
      class="my-sm-0 btn-sm disabled"
      :class="buttonType"
      style="border: none"
    >
      <i
        v-if="allLoaded"
        class="fa fa-check fa-x status-icon"
        style="float: left"
      />
      <i
        v-else
        class="fa fa-spinner fa-pulse fa-x fa-fw status-icon"
      />
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

const lastProcess = ref('');

const buttonType = computed(() => {
  return procStore.process.length === 0 ? 'btn-outline-success' : 'btn-outline-danger';
});

const process = computed(() => { 
            console.log(procStore.process.length);
            return procStore.process;});

const message = computed(() => {
  if (process.value.length > 1) {
    return 'Multiple tasks running ...';
  }
  if (process.value.length === 1) {
    return process.value[0];
  }
  if (lastProcess.value === '') {
    return 'Done';
  }
  return (
    'Done ' +
    lastProcess.value.charAt(0).toLowerCase() +
    lastProcess.value.slice(1)
  );
});
const allLoaded = computed(() => process.value.length === 0);
watchEffect(() => {
  if (process.value.length === 1) {
    lastProcess.value = process.value[0];
  }
});
</script>

<style scoped>
.status-icon {
  margin: 3px 5px 0 0;
  float: left;
}
</style>
