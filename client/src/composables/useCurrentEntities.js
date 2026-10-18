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

  return {
    currentKeypoint,
    currentCategoryFromList,
    currentAnnotationFromList,
    uniteCurrentAnnotation,
    getCurrentCategory,
    getCurrentAnnotation,
    currentAnnotationLength,
    updateCurrentAnnotation
  };
}
