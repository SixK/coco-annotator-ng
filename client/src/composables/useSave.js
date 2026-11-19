import { useRouter } from "vue-router";

/**
 * Save the current annotations, then force a full page reload.
 *
 * `save()` (provided by the annotator) already awaits axios, but the page still
 * has to be reloaded to pick up everything the server changed (task progress,
 * annotation ids, ...). The 200 ms delay is a deliberate workaround kept from
 * the original implementation — do not "fix" it here without reworking the
 * whole save flow.
 *
 * Replaces the two identical copies that lived in `SaveButton.vue` (click on
 * the save icon) and `shortcuts.js` (Ctrl+S).
 *
 * @returns {(save: () => Promise) => Promise<void>}
 */
export function useSaveAndReload() {
  const router = useRouter();

  return async function saveAndReload(save) {
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
  };
}
