<template>
  <div style="margin: 10px">
    <div class="card">
      <div
        class="card-header text-left"
        @click="showTasks = !showTasks"
      >
        {{ name }}

        <span style="float: right; color: lightgray">
          {{ runningTasks.length }} of {{ tasks.length }} task<span
            v-show="tasks.length != 1"
          >s</span>
          running
        </span>
      </div>

      <div
        v-show="showTasks"
        class="card-body"
      >
        <AppTask
          v-for="(task, index) in tasks"
          :key="index"
          :task="task"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTask from "@/components/tasks/Task";
import { toRef, ref, computed } from 'vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const showTasks = ref(true)
const tasks = toRef(props, 'tasks');
const name = toRef(props, 'name');

const runningTasks = computed(() => {
  return tasks.value.filter((t) => t.progress < 100);
});

defineExpose({showTasks});

</script>

<style scoped>
.card {
  margin: 0;
  padding: 0;
  cursor: pointer;
}

.card-header {
  color: white;
  background-color: #383c4a;
}

.card-body {
  padding: 0;
  margin: 0;
}
</style>
