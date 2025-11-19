import { computed } from 'vue';

export default function useCurrentEntities(current, getCategory, getCategoryByIndex) {
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
    return getCategory(current.value.category);
  });

  const currentAnnotationFromList = computed(() => {
    if (currentCategoryFromList.value == null) {
      return null;
    }

    return currentCategoryFromList.value.getAnnotationFromIndex(current.value.annotation);
  });

  const currentAnnotation = computed(() => {
    if (currentCategory.value == null) {
      return null;
    }
    return currentCategory.value.getAnnotation(current.value.annotation);
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
    currentAnnotationLength,
    currentKeypointLength,
    updateCurrentAnnotation
  };
}
