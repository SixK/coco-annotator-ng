import { ref, watch, onUnmounted } from "vue";

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
  let resetTimer = null;

  watch(
    () => task.value.progress,
    (progress) => {
      if (progress < 100) return;
      resetTimer = setTimeout(() => {
        task.value.progress = 0;
        task.value.id = null;
        if (typeof onComplete === 'function') onComplete();
      }, 1000);
    }
  );

  // Clear the pending reset timer on unmount so a navigation while the task
  // is finishing cannot fire `onComplete` / mutate state afterwards.
  onUnmounted(() => {
    if (resetTimer) clearTimeout(resetTimer);
  });

  return task;
}
