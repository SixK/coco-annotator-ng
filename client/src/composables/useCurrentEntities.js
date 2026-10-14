import { computed, watch } from 'vue';
import { useAnnotationStore } from '@/store/annotation';

export default function useCurrentEntities(current, getCategoryByIndex) {
  const store = useAnnotationStore();
  
  const updateCurrentAnnotation = (value) => {
    current.value.annotation = -1;
  };

  const uniteCurrentAnnotation = (compound, simplify = true, undoable = true, isBBox = false) => {
    if (currentAnnotationFromList.value == null) return;
    currentAnnotationFromList.value.unite(compound, simplify, undoable, isBBox);
  };

  const subtractCurrentAnnotation = (compound, simplify = true, undoable = true) => {
    if (currentCategoryFromList.value == null) return;
    currentAnnotationFromList.value.subtract(compound, simplify, undoable);
  };


  const getCurrentCategory = () => {
    return currentCategoryFromList.value;
  };

  const getCurrentAnnotation = () => {
    return currentAnnotationFromList.value;
  };

  const currentCategoryFromList = computed(() => {
    return getCategoryByIndex(current.value.category);
  });

  const currentAnnotationFromList = computed(() => {
    if (currentCategoryFromList.value == null) return null;
    return currentCategoryFromList.value.getAnnotationFromIndex(current.value.annotation);
  });

  watch(currentAnnotationFromList, (annotation) => store.setAnnotation(annotation), { immediate: true });

  const currentKeypoint = computed(() => {
    if (currentCategoryFromList.value == null) {
      return null;
    }
    if (
      currentAnnotationFromList.value == null ||
      !currentAnnotationFromList.value.keypointLabels ||
      currentAnnotationFromList.value.keypointLabels.length === 0 ||
      !currentAnnotationFromList.value.showKeypoints
    ) {
      return null;
    }
    if (current.value.keypoint === -1) {
      return null;
    }
    return {
      label: [String(current.value.keypoint + 1)],
      visibility: currentAnnotationFromList.value.getKeypointVisibility(current.value.keypoint),
    };
  });

  const currentAnnotationLength = computed(() => {
    return currentCategoryFromList.value.category.annotations.length||0;
  });

  const activateTools = computed(() => {
    return current.value.annotation !== -1;
  });

  return {
    activateTools,
    currentKeypoint,
    currentCategoryFromList,
    currentAnnotationFromList,
    uniteCurrentAnnotation,
    subtractCurrentAnnotation,
    getCurrentCategory,
    getCurrentAnnotation,
    currentAnnotationLength,
    updateCurrentAnnotation
  };
}
