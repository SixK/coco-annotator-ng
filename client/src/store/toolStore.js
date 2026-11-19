// stores/toolStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// localStorage key holding the last editor tool. The store is its only owner:
// every read/write goes through `getPersistedTool()` / `persistTool()`, and the
// key string never appears outside this file (it used to be written from both
// here and composables/toolBar/tools.js, which could desynchronise).
const EDITOR_TOOL_KEY = 'editorTool'

export const useToolStore = defineStore('tool', () => {
  // State
  const activeTool = ref('Select')
  const previousTool = ref(null)
  
  // Getters
  const currentTool = computed(() => activeTool.value)
  const isToolActive = (toolName) => activeTool.value === toolName
  
  // Persistence
  function persistTool(tool) {
    localStorage.setItem(EDITOR_TOOL_KEY, tool)
  }

  function getPersistedTool() {
    return localStorage.getItem(EDITOR_TOOL_KEY) || 'Select'
  }

  // Actions
  function setActiveTool(tool) {
    previousTool.value = activeTool.value
    activeTool.value = tool
    // Persist to localStorage
    persistTool(tool)
  }
  
  function getActiveTool() {
    return activeTool.value
  }
  
  function selectLastEditorTool() {
    const savedTool = getPersistedTool()
    activeTool.value = savedTool
    return savedTool
  }
  
   function onKeypointsComplete() {
      // keep minimal logic here
      if (activeTool.value === 'Keypoint') {
        // switch to select if appropriate
        activeTool.value = 'Select';
      }
    }

  return {
    activeTool,
    previousTool,
    currentTool,
    isToolActive,
    setActiveTool,
    getActiveTool,
    getPersistedTool,
    selectLastEditorTool,
    onKeypointsComplete
  }
})
