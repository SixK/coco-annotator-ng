<template>
  <div>
    <div style="padding-top: 55px" />
    <div
      class="album py-5 bg-light shadow-sm"
      style="overflow: auto; height: calc(100vh - 55px)"
    >
      <div class="container">
        <h2 class="text-center">
          Tasks
        </h2>
        <p class="text-center">
          <b>{{ total }}</b> tasks are running
        </p>

        <hr>

        <TaskGroup
          v-for="group in groups"
          :key="group"
          :name="group"
          :tasks="groupping[group]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import TaskGroup from "@/components/tasks/TaskGroup";
import Tasks from "@/models/tasks";
import { ref, computed, watch, inject, onMounted, provide } from 'vue';

import { useRoute } from 'vue-router';

import { useStores } from "@/composables/useStores"
const { auth, proc } = useStores();

const route = useRoute();

const total = ref(0);
const tasks = ref([]);

const updatePage = () => {
  let process = "Loading tasks";
  proc.addProcess(process);

  Tasks.all().then(response => {
        tasks.value = response.data;
        if (taskToShow.value !== null) {
          showTask(taskToShow.value);
        }
  }).finally (() => {
      proc.removeProcess(process);
  });
};

const showTask = (taskId) => {
  if (taskId == null) return;
  const task = tasks.value.find((t) => t.id == taskId);
  if (task == null) return;
  task.show = true;
};

const taskToShow = computed(() => {
      let taskId = route.query.id;
      if (taskId == null) return null;
      return parseInt(taskId);
});

const user = computed(() => {
      return auth.user;
});

const groups = computed(() => {
      return Object.keys(groupping.value);
});

const groupping = computed(() => {
    const groupping = {};

    tasks.value.forEach((task) => {
        if (task.hasOwnProperty("group")) {
              const group = task.group;
              if (!groupping.hasOwnProperty(group)) groupping[group] = [];
              groupping[group].push(task);
        }
    });
    return groupping;
});

watch(
  () => taskToShow,
  () => {
      showTask()
  }
);

onMounted(() => {
  updatePage();
});

provide('tasksUpdatePage', updatePage);


</script>

<style scoped>
.help-icon {
  color: darkblue;
  font-size: 20px;
  display: inline;
}
</style>
