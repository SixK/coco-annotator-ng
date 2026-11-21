// Builds the payload sent to the API when an annotation is saved. Extracted
// from `components/annotator/Annotation.vue` (lot G, step 2) to keep the
// component focused on rendering/editing.

export default function useAnnotationExport({
  annotation,
  compoundPath,
  keypoints,
  color,
  metadata,
  name,
  sessions,
  isCurrent,
  // `keypointLabels` is a prop and may change over time, so it is read through
  // a getter instead of being captured once at setup time.
  getKeypointLabels,
  createCompoundPath,
  simplifyPath,
}) {
  const ensureCompoundPathExists = () => {
    if (compoundPath.value == null) {
      createCompoundPath();
    }
  };

  const prepareMetadata = () => {
    const localMetadata = metadata.value.exportMetadata();
    if (name.value.length > 0) {
      localMetadata.name = name.value;
    }
    return localMetadata;
  };

  const createBaseAnnotationData = (localMetadata) => {
    return {
      id: annotation.id,
      isbbox: annotation.isbbox,
      color: color.value,
      metadata: localMetadata,
    };
  };

  const simplifyAndPrepareCompoundPath = (annotationData) => {
    simplifyPath();
    compoundPath.value.fullySelected = false;

    const json = compoundPath.value.exportJSON({
      asString: false,
      precision: 1,
    });

    if (annotation.paper_object !== json) {
      annotationData.compoundPath = json;
    }
  };

  const addKeypointsToAnnotationData = (annotationData) => {
    if (!keypoints.value.isEmpty()) {
      annotationData.keypoints = keypoints.value.exportJSON(
        getKeypointLabels(),
        annotation.width,
        annotation.height
      );
    }
  };

  const restoreCompoundPathState = () => {
    compoundPath.value.fullySelected = isCurrent.value;
  };

  const exportSessions = (annotationData) => {
    annotationData.sessions = sessions.value;
    sessions.value = [];
  };

  const exportAnnotation = () => {
    ensureCompoundPathExists();
    const localMetadata = prepareMetadata();
    const annotationData = createBaseAnnotationData(localMetadata);

    simplifyAndPrepareCompoundPath(annotationData);
    addKeypointsToAnnotationData(annotationData);
    restoreCompoundPathState();

    exportSessions(annotationData);

    return annotationData;
  };

  return { exportAnnotation, ensureCompoundPathExists };
}
