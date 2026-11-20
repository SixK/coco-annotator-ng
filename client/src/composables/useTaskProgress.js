import { ref, watch } from "vue";

/**
 * State of one long-running dataset task (scan, generate, import, export).
 *
 * The four tasks share the same lifecycle: the view opens the task, the
 * `taskProgress` socket event fills `progress`, and once it reaches 100 % the
 * state is reset 1 s later so the button shows its idle label again.
 * Dataset.vue used to declare that state and the reset watcher four times.
 *
 * @param {Object}        [initial]     extra fields merged into the task state
 * @param {() => void}    [onComplete]  called on the reset tick (e.g. refresh
 *                                      the export list)
 * @returns {import('vue').Ref<{ progress: number, id: number|null }>}
 */
export function useTaskProgress(initial = {}, onComplete = null) {
  const task = ref({ progress: 0, id: null, ...initial });

  watch(
    () => task.value.progress,
    (progress) => {
      if (progress < 100) return;
      setTimeout(() => {
        task.value.progress = 0;
        task.value.id = null;
        if (typeof onComplete === 'function') onComplete();
      }, 1000);
    }
  );

  return task;
}
