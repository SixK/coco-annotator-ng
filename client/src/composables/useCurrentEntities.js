import { computed } from 'vue';
import { useAnnotationStore } from '@/store/annotation';

export default function useCurrentEntities(current, getCategory, getCategoryByIndex) {
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

  const currentCategory = computed(() => {
    return getCategoryByIndex(current.value.category);
  });

  const currentAnnotationFromList = computed(() => {
    if (currentCategoryFromList.value == null) {
      store.setAnnotation(null);
      return null;
    }
    store.setAnnotation(currentCategoryFromList.value.getAnnotationFromIndex(current.value.annotation));
    return currentCategoryFromList.value.getAnnotationFromIndex(current.value.annotation);
  });

  const getCurrentAnnotationRef = () => {
      return currentAnnotation.value;
  }

  const currentAnnotation = computed(() => {
    if (currentCategory.value == null) {
      store.setAnnotation(null);
      return null;
    }
    store.setAnnotation(currentCategory.value.getAnnotationFromIndex(current.value.annotation));
    return currentCategory.value.getAnnotationFromIndex(current.value.annotation);
  });

  const currentKeypoint = computed(() => {
    if (currentCategory.value == null) {
      return null;
    }
    if (
      currentAnnotation.value == null ||
      !currentAnnotation.value.keypointLabels ||
      currentAnnotation.value.keypointLabels.length === 0 ||
      !currentAnnotation.value.showKeypoints
    ) {
      return null;
    }
    if (current.value.keypoint === -1) {
      return null;
    }
    return {
      label: [String(current.value.keypoint + 1)],
      visibility: currentAnnotation.value.getKeypointVisibility(current.value.keypoint),
    };
  });

  const currentAnnotationLength = computed(() => {
    return currentCategoryFromList.value.category.annotations.length||0;
  });

  const currentKeypointLength = computed(() => {
    return currentAnnotationFromList.value.annotation.keypoints.length||0;
  });

  return {
    currentCategory,
    currentAnnotation,
    currentKeypoint,
    currentCategoryFromList,
    currentAnnotationFromList,
    uniteCurrentAnnotation,
    subtractCurrentAnnotation,
    getCurrentCategory,
    getCurrentAnnotation,
    getCurrentAnnotationRef,
    currentAnnotationLength,
    currentKeypointLength,
    updateCurrentAnnotation
  };
}
