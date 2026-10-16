import { useProcStore } from "@/store/index";

/**
 * Manages the global "process" list shown while an async task runs.
 *
 * `withProcess(label, fn)` registers `label` before running `fn` and always
 * removes it afterwards, whether `fn` resolved or rejected. It returns the
 * promise of `fn`, and errors are re-thrown so callers keep their own
 * `.catch(...)` semantics.
 *
 * @param {import('pinia').Store} [procStore] defaults to the global proc store
 * @returns {{ withProcess: <T>(label: string, fn: () => Promise<T> | T) => Promise<T> }}
 */
export function useProcess(procStore = useProcStore()) {
  const withProcess = (label, fn) => {
    procStore.addProcess(label);
    try {
      // `fn` runs right away, like the code it replaces; a synchronous throw is
      // turned into a rejected promise so `.catch` still applies.
      return Promise.resolve(fn()).finally(() => procStore.removeProcess(label));
    } catch (error) {
      procStore.removeProcess(label);
      return Promise.reject(error);
    }
  };

  return { withProcess };
}
