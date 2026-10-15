import { useProcStore } from "@/store/index";

/**
 * Manages the global "process" list shown while an async task runs.
 *
 * `withProcess(label, fn)` registers `label` before running `fn` and always
 * removes it afterwards, whether `fn` resolved or rejected. Errors are
 * re-thrown so callers keep their own `.catch(...)` semantics.
 *
 * @param {import('pinia').Store} [procStore] defaults to the global proc store
 * @returns {{ withProcess: <T>(label: string, fn: () => Promise<T> | T) => Promise<T> }}
 */
export function useProcess(procStore = useProcStore()) {
  const withProcess = async (label, fn) => {
    procStore.addProcess(label);
    try {
      return await fn();
    } finally {
      procStore.removeProcess(label);
    }
  };

  return { withProcess };
}
