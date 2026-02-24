// @/composables/useAnnotations.js
import { ref, computed, watch } from 'vue';
import Annotations from "@/models/annotations";

export default function useAnnotations(options = {}) {
  const {
    image,
    categories,
    categorylist,
    current,
    axiosReqestError,
    procStore,
    router,
    currentCategoryFromList,
   currentAnnotationFromList,
  } = options;

  // Core annotation functions
  const findCategoryByName = (categoryName) => {
    const categoryComponent = categorylist.value.find(
      (cat) => cat.category.name.toLowerCase() === categoryName.toLowerCase()
    );
    return categoryComponent?.category || null;
  };

  const addAnnotation = async (categoryName, segments = [], keypoints = [], isbbox = false) => {
    if (keypoints.length === 0 && segments.length === 0) return;

    const category = findCategoryByName(categoryName);
    if (!category) {
      console.warn(`Category ${categoryName} not found`);
      return;
    }

    try {
      annotationState.value.isCreating = true;
      const response = await Annotations.create({
        image_id: image.value.id,
        category_id: category.id,
        segmentation: segments,
        keypoints,
        isbbox,
      });
      
      category.annotations.push(response.data);
      procStore.setTaskProgress(null); // Reset progress
    } catch (error) {
      axiosReqestError("Failed to create annotation", error.message);
    } finally {
      annotationState.value.isCreating = false;
    }
  };

  const createAnnotation = () => {
    if (currentCategoryFromList.value) {
      currentCategoryFromList.value.createAnnotation();
    }
  };

  const deleteKeypoint = (annotation, keypoint) => {
    if (!annotation || !keypoint) return;

    annotation.keypoints.deleteKeypoint(keypoint);
    annotation.currentKeypoint = null;
  };

  const deleteAnnotation = () => {
    const annotation = currentAnnotationFromList.value;
    if (!annotation) return;

    const currentKeypoint = annotation.currentKeypoint;
    if (currentKeypoint) {
      deleteKeypoint(annotation, currentKeypoint);
      return;
    }

    annotation.deleteAnnotation();
  };

  const updateAnnotationCategory = async (annotation, oldCategory, newCategoryName) => {
    const newCategory = findCategoryByName(newCategoryName);
    if (!newCategory || !annotation) return;

    try {
      annotationState.value.isUpdating = true;
      
      // Delete from old category
      currentCategoryFromList.value.deleteAnnot(annotation.id);
      
      // Update via API
      const response = await Annotations.update(annotation.id, { 
        category_id: newCategory.id 
      });
      
      // Update local state
      const newAnnotation = {
        ...response.data,
        ...annotation,
        metadata: response.data.metadata,
        category_id: newCategory.id
      };
      
      if (newAnnotation) {
        oldCategory.annotations = oldCategory.annotations.filter(
          a => a.id !== annotation.id
        );
        newCategory.annotations.push(newAnnotation);
      }
    } catch (error) {
      axiosReqestError("Failed to update annotation category", error.message);
    } finally {
      annotationState.value.isUpdating = false;
    }
  };

  // Selection helpers
  const selectAnnotation = (indices) => {
    if (!currentCategoryFromList.value) return;
    
    current.value.category = Math.min(indices.category, categories.value.length - 1);
    current.value.annotation = Math.min(indices.annotation, 
      currentCategoryFromList.value.category.annotations.length - 1);
  };

  // Cleanup watchers
  const stopCategoryWatcher = watch(currentCategoryFromList, (newCategory) => {
    if (!newCategory) return;
    if (currentAnnotationFromList.value == null || !newCategory.showAnnotations) {
      scrollToElement(newCategory.$el);
    }
  });

  const stopAnnotationWatcher = watch(currentAnnotationFromList, (newElement) => {
    if (!newElement?.showAnnotations) return;
    scrollToElement(newElement.$el);
  });

  // Utility
  const scrollToElement = (element) => {
    if (!element) return;
    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };


  // Return public API
  return {
    // State
    //annotationState: readonly(annotationState),
    // currentCategoryFromList,
    //currentAnnotationFromList,
    
    // Methods
    findCategoryByName,
    addAnnotation,
    createAnnotation,
    deleteAnnotation,
    deleteKeypoint,
    updateAnnotationCategory,
    selectAnnotation,
    scrollToElement,
    // cleanup,
  };
}
