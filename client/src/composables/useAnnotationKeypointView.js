// Read-only helpers driving the keypoint list of an annotation
// (`components/annotator/Annotation.vue`). Extracted in lot G, step 3.
//
// Props (`keypointLabels`, `keypointColors`, `isHoverCategory`) and the active
// tool change over time, so they are read through getters; the rest are refs
// owned by the component.

import { computed } from "vue";

import { SURFACE_DARK, SURFACE_HOVER } from "@/libs/theme";

export default function useAnnotationKeypointView({
  keypoints,
  keypoint,
  isHover,
  isCurrent,
  getKeypointLabels,
  getKeypointColors,
  getIsHoverCategory,
  getActiveTool,
}) {
  const getKeypointLabel = (kp) => {
    return kp && kp.keypoints.labels[kp.indexLabel - 1];
  };

  const isKeypointSelected = (tag, index) => {
    return tag == (index + 1);
  };

  const isKeypointLabeled = (index) => {
    return keypoints.value && !!keypoints.value._labelled[index + 1];
  };

  const getKeypointVisibility = (index) => {
    let visibility = 0;
    if (keypoints.value?._labelled) {
      const labelled = keypoints.value._labelled[index + 1];
      if (labelled) {
        visibility = labelled.visibility;
      }
    }
    return visibility;
  };

  const getKeypointBackgroundColor = (index) => {
    if (isHover.value && getIsHoverCategory()) return SURFACE_HOVER;
    // if (keypoint.tag == index + 1) return "#4b624c";
    let activeIndex = keypoint.value.next.label;

    if (getActiveTool() === "Select") {
      activeIndex = keypoint.value.tag[0];
    }
    if (isCurrent.value && activeIndex == index + 1) return "rgb(30, 86, 36)";
    return SURFACE_DARK;
  };

  const getKeypointIconColor = (visibility, index) => {
    switch (visibility) {
      case 2: return getKeypointColors()[index];
      case 1: return "lightgray";
      default: return "rgb(40, 42, 49)";
    }
  };

  const keypointListView = computed(() =>
    getKeypointLabels().map((label, i) => ({
      label,
      visibility: getKeypointVisibility(i),
      placed: isKeypointLabeled(i),
      iconColor: getKeypointIconColor(getKeypointVisibility(i), i),
      backgroundColor: getKeypointBackgroundColor(i),
    }))
  );

  return {
    getKeypointLabel,
    isKeypointSelected,
    isKeypointLabeled,
    getKeypointVisibility,
    getKeypointBackgroundColor,
    getKeypointIconColor,
    keypointListView,
  };
}
