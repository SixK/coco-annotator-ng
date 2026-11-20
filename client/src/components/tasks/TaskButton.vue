<template>
  <button
    type="button"
    class="btn btn-block"
    :class="`btn-${variant}`"
    v-bind="modalAttributes"
    @click="$emit('click')"
  >
    <div
      v-if="task.id != null"
      class="progress"
    >
      <div
        class="progress-bar"
        :class="`bg-${variant}`"
        :style="{ width: `${task.progress}%` }"
      >
        {{ progressLabel }}
      </div>
    </div>
    <div v-else>
      {{ label }}
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

/**
 * One of the four long-running dataset action buttons (Generate / Scan /
 * Import / Export). It shows `label` while idle and a progress bar with
 * `progressLabel` once the backend returned a task id.
 */
const props = defineProps({
  task: { type: Object, required: true },
  variant: { type: String, required: true },
  label: { type: String, required: true },
  progressLabel: { type: String, required: true },
  modalTarget: { type: String, default: null },
});

defineEmits(['click']);

const modalAttributes = computed(() =>
  props.modalTarget
    ? { 'data-bs-toggle': 'modal', 'data-bs-target': props.modalTarget }
    : {}
);
</script>
