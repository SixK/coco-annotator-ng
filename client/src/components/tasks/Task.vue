<template>
  <div
    :id="'task-' + task.id"
    class="card text-left"
    :style="{ 'background-color': highlight ? 'lightgreen' : 'white' }"
  >
    <div
      class="card-body title"
      @click="showLogs = !showLogs"
    >
      <span class="text-muted">{{ task.id }}.</span> {{ task.name }}

      <!--<span class="time text-muted">(Running for {{ time }})</span>-->

      <div style="float: right">
        <span
          v-show="errors > 0"
          class="badge badge-danger"
          @click.stop="onlyErrors = !onlyErrors"
        >
          {{ errors }} error<span v-show="errors > 1">s</span>
        </span>

        <span
          v-show="warnings > 0"
          class="badge badge-warning"
          @click.stop="onlyWarnings = !onlyWarnings"
        >
          {{ warnings }} warning<span v-show="warnings > 1">s</span>
        </span>
      </div>
    </div>

    <div
      v-show="showLogs"
      class="card-body"
    >
      <div class="logs">
        <p
          v-for="(line, index) in displayLogs.slice().reverse()"
          :key="index"
          class="log"
          :style="{ color: textColor(line) }"
        >
          {{ line }}
        </p>
      </div>
      <button
        v-show="completed"
        class="btn btn-danger btn-block btn-sm delete"
        @click="deleteTask"
      >
        Delete
      </button>
    </div>

    <div class="progress">
      <div
        class="progress-bar"
        :class="{ 'bg-success': completed }"
        :style="{ width: task.progress + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import Tasks from "@/models/tasks";
import { getCurrentInstance, toRef, ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';

const tasksUpdatePage = inject('tasksUpdatePage');

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const task = toRef(props, 'task');
const logs = ref(["Loading logs"]);
const showLogs = ref(false);
const highlight = ref(false);
const onlyErrors = ref(false);
const onlyWarnings = ref(false);

const warnings = computed(() => {
      let warnings = task.value.warnings;

      if (warnings == null) return 0;

      return warnings;
});

const errors = computed(() => {
      let errors = task.value.errors;

      if (errors == null) return 0;

      return errors;
});

const displayLogs = computed(() => {
      let local_logs = logs.value;

      if (onlyErrors.value)
        return local_logs.filter((t) => t.includes("[ERROR]"));

      if (onlyWarnings.value)
        return local_logs.filter((t) => t.includes("[WARNING]"));
      return local_logs;
});

const completed = computed(() => {
      return task.value.completed || task.value.progress >= 100;
});

watch(
  () => showLogs.value, 
  () => {
    getLogs();
});

watch(
  () => completed, 
  (value) => {
    if (showLogs.value) {
      getLogs();
    }
});

const textColor = (text) => {
  if (text.includes("[ERROR]")) return "red";
  if (text.includes("[WARNING]")) return "yellow";
  return "white";
};

const deleteTask = () => {
  Tasks.delete(task.value.id).finally(() => {
    // $parent.$parent.updatePage();
    tasksUpdatePage();
  });
};

const getLogs = () => {
  Tasks.getLogs(task.value.id).then((response) => {
    logs.value = response.data.logs;
  });
};

const onTaskProgress = (data) => {
      console.log('received task progress!!!');
      if (data.id !== task.value.id) return;

      task.value.progress = data.progress;
      task.value.warnings = data.warnings;
      task.value.errors = data.errors;
};

onMounted( () => {
    // app.__vue_app__._instance.ctx.sockets.subscribe('taskProgress', onTaskProgress);
    getCurrentInstance().ctx.sockets.subscribe('taskProgress', onTaskProgress);

    
    let show = task.value.show;
    if (show !== null) {
        showLogs.value = show;
        if (show) {
          setTimeout(() => {
            highlight.value = true;
            // let el = document.querySelector('.task');
            let el = document.querySelector('#task-' + task.value.id);
            // console.log('element:', el);
            if (el) {
                el.scrollIntoView({
                  behavior: 'smooth',
                });
                setTimeout(() => (highlight.value = false), 1000);
            }
          }, 200);
        }
    }
});

onUnmounted(() => {
    // app.__vue_app__._instance.ctx.sockets.unsubscribe('taskProgress');
    getCurrentInstance().ctx.sockets.unsubscribe('taskProgress');
});

defineExpose({logs, showLogs, highlight, onlyErrors, onlyWarnings});

</script>

<style scoped>
.card {
  border: none;
  border-radius: 0;
  transition: background-color 500ms linear;
}

.progress {
  height: 3px;
}
.card-body {
  padding: 5px;
  margin: 0;
}

.badge {
  margin-left: 2px;
}

.time {
  font-size: 12px;
}

.logs {
  background-color: #4b5162;
  border-radius: 5px;
  max-height: 250px;
  overflow-y: auto;

  -webkit-box-shadow: inset 0px 0px 30px 2px rgba(0, 0, 0, 0.2);
  -moz-box-shadow: inset 0px 0px 30px 2px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0px 0px 30px 2px rgba(0, 0, 0, 0.2);
  font-family: "Courier New", Courier, monospace;
}

.log {
  color: white;
  font-size: 13px;
  margin: 0;
  padding: 0 5px;
}

.delete {
  margin: 2px 0;
}

.title {
  padding: 3px 15px;
  cursor: pointer;
}
</style>
