
export default function useAnnotatorMoves(current, currentAnnotation, currentAnnotationFromList, currentCategory, currentCategoryFromList, currentKeypoint, categories, currentAnnotationLength) {

const incrementCategory = () => {
    if (current.value.category >= categories.value.length - 1) {
      current.value.category = -1;
    } else {
      current.value.category += 1;
    }
};

const decrementCategory = () => {
    if (current.value.category <= 0) {
        current.value.category = categories.value.length - 1;
    } else {
        current.value.category -= 1;
    }
    
    handleCategoryAnnotations();
};

const handleCategoryAnnotations = () => {
    if (!currentCategoryFromList.value) return;
        
    const annotationCount = currentCategoryFromList.value.category.annotations.length;
    if (annotationCount > 0) {
        current.value.annotation = annotationCount - 1;
    }

    if (currentCategoryFromList.value.showAnnotations) {
        const keypointCount = currentAnnotationFromList.value.keypointLabels.length;
        if (keypointCount > 0) {
            current.value.keypoint = 0;
            currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
        }
    }
};

/* end new decrementCategory */

const incrementAnnotation = () => {
    if (current.value.annotation === currentCategoryFromList.value.category.annotations.length - 1 ||
              currentCategoryFromList.value.showAnnotations == false) {
        incrementCategory();
        current.value.annotation = -1;
    } else {
        current.value.annotation += 1;
        current.value.keypoint = -1;
    }
};

/**/
const decrementAnnotation = () => {
  const { annotation } = current.value;
  const { annotations } = currentCategoryFromList.value.category;
  const annotationCount = annotations.length;

  // Handle case when annotation is -1
  if (annotation === -1 && annotationCount > 0) {
    current.value.annotation = annotationCount - 1;
    return;
  }

  if (annotation === 0 || annotationCount === 0 
       || !currentCategoryFromList.value.showAnnotations) {
    decrementCategory();
    return;
  }

  current.value.annotation -= 1;

  // Handle keypoints
  if (currentAnnotationFromList.value?.showKeypoints) {
    current.value.keypoint = 0;
    currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
  } else {
    console.log('move dec cas2');
    current.value.keypoint = -1;
  }
};
/**/


const incrementKeypoint = () => {
    const keypointCount = currentAnnotationFromList.value.keypointLabels.length;
    if (current.value.keypoint === keypointCount - 1) {
      incrementAnnotation();
    } else {
      current.value.keypoint += 1;
      currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
    }
  };

const decrementKeypoint = () => {
    if (current.value.keypoint <= 0) {
      decrementAnnotation();
    } else {
      current.value.keypoint -= 1;
      if(current.value.keypoint >= 0 ) {
          currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
      }
    }
};

const moveUp = () => {
  if (currentCategoryFromList.value == null) {
    decrementCategory();
    return;
  }

  if (currentAnnotationFromList.value == null) {
    if (current.value.annotation === -1) {
      decrementAnnotation();
    } else {
      decrementCategory();
    }
    return;
  }

  if (currentKeypoint.value != null || 
      (currentAnnotationFromList.value.showKeypoints && current.value.keypoint >0)) {
    decrementKeypoint();
  } else {
    decrementAnnotation();
  }
};

const moveDown = () => {
  if (currentCategoryFromList.value == null) {
    incrementCategory();
    return;
  }

  if (currentAnnotationFromList.value == null) {
    if (current.value.annotation === -1) {
      incrementAnnotation();
    } else {
      incrementCategory();
    }
    return;
  }

  if (currentKeypoint.value != null || 
      (currentAnnotationFromList.value.showKeypoints )) {
    incrementKeypoint();
  } else {
    incrementAnnotation();
  }
};

const stepIn = () => {
  if (currentCategoryFromList.value == null) return;

  const { isVisible, showAnnotations } = currentCategoryFromList.value;
  const annotationExists = currentAnnotationFromList.value != null;
  const hasKeypointLabels = annotationExists && 
                                                        currentAnnotationFromList.value.keypointLabels && 
                                                        currentAnnotationFromList.value.keypointLabels.length > 0;

  if (!isVisible && annotationExists) {
    currentCategoryFromList.value.isVisible = true;
    current.value.annotation = 0;
    currentAnnotationFromList.value.showKeypoints = false;
    current.value.keypoint = -1;
  } else if (!showAnnotations && currentAnnotationLength.value > 0) {
    currentCategoryFromList.value.showAnnotations = true;
    current.value.annotation = 0;
    currentAnnotationFromList.value.showKeypoints = false;
    current.value.keypoint = -1;
  } else if (hasKeypointLabels && !currentAnnotationFromList.value.showKeypoints) {
    currentAnnotationFromList.value.showKeypoints = true;
    current.value.keypoint = 0;
    currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
  }
};

const stepOut = () => {
    if (currentCategoryFromList.value == null) return;

    if (
      currentAnnotationFromList.value != null &&
      currentAnnotationFromList.value.showKeypoints
    ) {
      currentAnnotationFromList.value.showKeypoints = false;
      current.value.keypoint = -1;
    } else if (currentCategoryFromList.value.showAnnotations) {
      currentCategoryFromList.value.showAnnotations = false;
      current.value.annotation = -1;
    } else if (currentCategoryFromList.value.isVisible) {
      currentCategoryFromList.value.isVisible = false;
    }
};


return { moveUp, moveDown, stepIn, stepOut };
};
