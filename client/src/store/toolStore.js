// stores/toolStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useToolStore = defineStore('tool', () => {
  // State
  const activeTool = ref('Select')
  const previousTool = ref(null)
  
  // Getters
  const currentTool = computed(() => activeTool.value)
  const isToolActive = (toolName) => activeTool.value === toolName
  
  // Actions
  function setActiveTool(tool) {
    previousTool.value = activeTool.value
    activeTool.value = tool
    // Persist to localStorage
    localStorage.setItem('editorTool', tool)
  }
  
  function getActiveTool() {
    return activeTool.value
  }
  
  function selectLastEditorTool() {
    const savedTool = localStorage.getItem('editorTool') || 'Select'
    activeTool.value = savedTool
    return savedTool
  }
  
  /*
  function restorePreviousTool() {
    if (previousTool.value) {
      activeTool.value = previousTool.value
    }
  }*/
  /*
  function toggleTool(toolA, toolB) {
    activeTool.value = activeTool.value === toolA ? toolB : toolA
    localStorage.setItem('editorTool', activeTool.value)
  }*/

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
    selectLastEditorTool,
    // restorePreviousTool,
    // toggleTool,
    onKeypointsComplete
  }
})
