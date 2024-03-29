import { defineStore } from 'pinia';

import { ref } from 'vue';

export const useProcStore = defineStore('proc', () => {
  const process = ref([]);
  const undo = ref([]);
  const dataset = ref('');

  function setDataset(newDataset) {
    dataset.value = newDataset;
  }

  function addProcess(newProcess) {
    process.value.push(newProcess);
  }

  function removeProcess(processToRemove) {
    const index = process.value.indexOf(processToRemove);
    if (index > -1) {
      process.value.splice(index, 1);
    }
  }

  function resetUndo() {
    undo.value.splice(0);
  }

  function addUndo(action) {
    undo.value.push(action);
  }

  function doUndo() {
    const action = undo.value.pop();
    if (action != null) {
      action.undo();
    }
  }

  function removeUndos(actionToRemove) {
    undo.value = undo.value.filter((undoAction) => undoAction.action !== actionToRemove);
  }

  return {
    process,
    undo,
    dataset,
    setDataset,
    addProcess,
    removeProcess,
    resetUndo,
    addUndo,
    doUndo,
    removeUndos,
  };
});
