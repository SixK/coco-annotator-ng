// Annotation lifecycle for a category: create on the server, export the
// category payload, react to socket events and keep the selection in sync.
// Extracted from `components/annotator/Category.vue` (lot G, step 4).

import { nextTick } from "vue";

import useSocketSubscription from "@/composables/useSocketSubscription";

export default function useCategoryAnnotations({
  category,
  index,
  annotationsModel,
  getImageId,
  socket,
  emit,
  selectedAnnotation,
  toolStore,
  isVisible,
  showAnnotations,
  annotationlist,
  scrollToElement,
  color,
}) {
  const createAnnotation = () => {
    const annotationId = category.annotations.length;
    annotationsModel
      .create({
        image_id: getImageId(),
        category_id: category.id,
      })
      .then((response) => {
        socket.io.emit("annotation", {
          action: "create",
          category_id: category.id,
          annotation: response.data,
        });

        emit("add-annotation", index, response.data);

        selectedAnnotation.value = annotationId;
        nextTick(() => {
          toolStore.selectLastEditorTool();
          emit("click", {
            annotation: annotationId,
            category: index,
            keypoint: -1,
          });
        });

        isVisible.value = true;
        showAnnotations.value = true;

        const annotations = annotationlist.value;
        if (annotations == null) return;

        const tmp_annotation = annotations[annotationId - 1];

        if (tmp_annotation == null) {
          const element = document.getElementById(`heading${category.id}`);
          scrollToElement(element);
        } else {
          scrollToElement(tmp_annotation.$el);
        }
      });
  };

  const exportCategory = () => {
    const categoryData = {
      // Category Identification
      id: category.id,
      name: category.name,
      // Show in side bar
      show: category.show,
      // Show groups on canvas
      visualize: isVisible.value,
      color: color.value,
      metadata: [],
      annotations: [],
      supercategory: category.supercategory,
      keypoint_labels: category.keypoint_labels,
      keypoint_edges: category.keypoint_edges,
      keypoint_colors: category.keypoint_colors,
    };

    if (annotationlist.value != null) {
      annotationlist.value.forEach((ann) => {
        categoryData.annotations.push(ann.exportAnnotation());
      });
    }

    return categoryData;
  };

  const annotationDeleted = (indexDeleted) => {
    if (selectedAnnotation.value >= indexDeleted) {
      selectedAnnotation.value--;
    }

    const indices = {
      annotation: selectedAnnotation.value,
      category: index,
      keypoint: -1,
    };
    emit("remove-annotation", index, indexDeleted);
    emit("click", indices);
    if (category.annotations.length === 0) isVisible.value = false;
  };

  const onAnnotationPatch = (annIndex, patch) => {
    emit("patch-annotation", index, annIndex, patch);
  };

  const onAnnotation = (data) => {
    const action = data.action;
    const annot = data.annotation;
    if (annot.image_id != getImageId()) return;
    if (annot.category_id != category.id) return;
    const found = category.annotations.findIndex((a) => a.id == annot.id);

    if (found == -1) {
      if (action == "create") {
        emit("add-annotation", index, annot);
      }
    }
  };

  useSocketSubscription("annotation", onAnnotation);

  return {
    createAnnotation,
    exportCategory,
    annotationDeleted,
    onAnnotationPatch,
  };
}
