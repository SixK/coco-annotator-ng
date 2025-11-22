import { defineStore } from 'pinia';
import { ref } from 'vue'

export const useAnnotationStore = defineStore('annotation', () => {
  const currentAnnotation = ref(null);   // starts empty

  function setAnnotation(ann) {
    currentAnnotation.value = ann;
  };

  return { currentAnnotation, setAnnotation };
})
