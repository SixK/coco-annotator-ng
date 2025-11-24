<template>
  <div
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <li
      v-show="showSideMenu"
      class="list-group-item btn btn-link btn-sm text-left"
      :style="{ 'background-color': backgroundColor, color: 'white' }"
    >
      <div @click="isVisible = !isVisible">
        <i
          v-if="isVisible"
          class="fa fa-eye annotation-icon"
          :style="{ float: 'left', 'padding-right': '10px', color: color }"
        />
        <i
          v-else
          class="fa fa-eye-slash annotation-icon"
          style="float: left; padding-right: 10px; color: gray"
        />
      </div>

      <button
        class="btn btn-sm btn-link collapsed text-left annotation-text"
        :style="{
          float: 'left',
          width: '70%',
          color: isVisible ? 'white' : 'gray',
        }"
        aria-expanded="false"
        :aria-controls="'collapse_keypoints' + annotation.id"
        @click="onAnnotationClick(!showKeypoints)"
      >
        <template v-if="name.length === 0">
          {{ index + 1 }}
        </template>
        <template v-else>
          {{ name }}
        </template>
        {{ annotation.name }}
        <i
          v-if="isEmpty"
          style="padding-left: 5px; color: lightgray"
        >(Empty)</i>
        <i
          v-else
          style="padding-left: 5px; color: lightgray"
        >(id: {{ annotation.id }})</i>
      </button>

      <i
        class="fa fa-gear annotation-icon"
        style="float: right"
        data-bs-toggle="modal"
        :data-bs-target="'#annotationSettings' + annotation.id"
      />
      <i
        class="fa fa-trash-o annotation-icon"
        style="float: right"
        @click="deleteAnnotation(index)"
      />
    </li>

    <ul
      v-show="showKeypoints"
      ref="collapse_keypoints"
      class="list-group keypoint-list"
    >
      <li
        v-for="(kp, index) in keypointListView"
        :key="index"
        :style="{ 'background-color': kp.backgroundColor }"
        class="list-group-item text-left keypoint-item"
      >
        <div>
          <i
            class="fa fa-map-marker keypoint-icon"
            :style="{ color: kp.iconColor }"
          />
        </div>
        <a
          :style="{
            float: 'left',
            width: '70%',
            color: 'white'
          }"
          @click="onAnnotationKeypointClick(index)"
        >
          <span> {{ kp.label }} </span>
        </a>
        <i
          v-if="kp.visibility !== 0"
          class="fa fa-gear annotation-icon"
          style="float: right; color: lightgray"
          data-bs-toggle="modal"
          :data-bs-target="'#keypointSettings' + annotation.id"
          @click="onAnnotationKeypointSettingsClick(index)"
        />
        <i
          v-if="kp.visibility !== 0"
          class="fa fa-trash-o annotation-icon"
          style="float: right; color: lightgray"
          @click="onDeleteKeypointClick(index)"
        />
      </li>
    </ul>

    <div
      :id="'keypointSettings' + annotation.id"
      class="modal fade"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              {{ getKeypointLabel(currentKeypoint) }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Visibility</label>
                <div class="col-sm-8">
                  <select
                    v-model="keypoint.visibility"
                    class="form-control"
                  >
                    <option
                      v-for="(desc, label) in visibilityOptions"
                      :key="label"
                      :value="label"
                      :selected="keypoint.visibility == label"
                    >
                      {{ desc }}
                    </option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      :id="'annotationSettings' + annotation.id"
      class="modal fade"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              {{ index + 1 }}
              <i style="color: darkgray">(id: {{ annotation.id }})</i>
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Color</label>
                <div class="col-sm-8">
                  <input
                    v-model="color"
                    type="color"
                    class="form-control"
                  >
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Name</label>
                <div class="col-sm-8">
                  <input
                    v-model="name"
                    class="form-control"
                  >
                </div>
              </div>
              <div class="form-group row">
                <label class="col-sm-3 col-form-label">Category</label>
                <div class="col-sm-8">
                  <select
                    class="form-control"
                    @change="setCategory"
                  >
                    <option
                      v-for="option in allCategories"
                      :key="option.text"
                      :selected="annotation.category_id === option.value"
                    >
                      {{ option.text }}
                    </option>
                  </select>
                </div>
              </div>
              <MetaData
                ref="metadata"
                :metadata="annotation.metadata"
                exclude="name"
              />
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="deleteAnnotation(index)"
            >
              Delete
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import paper from "paper";
import axios from "axios";
import simplifyjs from "simplify-js";
import { Modal } from "bootstrap";

import { Keypoint, Keypoints, VisibilityOptions } from "@/libs/keypoints";
import UndoAction from "@/undo";

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

import MetaData from "@/components/MetaData";

import { nextTick, getCurrentInstance, watchEffect, inject, watch, 
                  reactive, ref, computed, onMounted, onUnmounted, toRef } from 'vue';

const { removeKeypointEdge,  addKeypointEdge, categoryIsCurrent, getCategoryIndex, 
               getShowAnnotations, resetCategorySettings } = inject('category');

const { updateAnnotationCategory } = inject('annotator');

const emit = defineEmits(['set-color', 'keypointsComplete', 'keypoint-click', 'click', 'deleted']);

const props = defineProps({
    keypointEdges: {
      type: Array,
      required: true
    },
});

const socket = inject('socket');

const annotation = defineModel('annotation', { type: Object, required: true });
const showAnnotations = defineModel('showAnnotations', { type: Boolean, required: true });
const isHoverCategory = defineModel('isHoverCategory', { type: Boolean, required: true });
const category = defineModel('category', { type: Object, required: true });
const index = defineModel('index', { type: Number, required: true });
const current = defineModel('current', { type: Number, required: true });
const hover = defineModel('hover', { type: Number, required: true });
const opacity = defineModel('opacity', { type: Number, required: true });
const scale = defineModel('scale', { type: Number, default: 1 });
const search = defineModel('search', { type: String, default: "" });
const simplify = defineModel('simplify', { type: Number, default: 1 });
// const keypointEdges = defineModel('keypointEdges', { type: Array, required: true });
const keypointLabels = defineModel('keypointLabels', { type: Array, required: true });
const keypointColors = defineModel('keypointColors', { type: Array, required: true });
const activeTool = defineModel('activeTool', { type: String, required: true });
const allCategories = defineModel('allCategories', { type: Array, default: () => [] });

const keypointEdges = toRef(props.keypointEdges);
const keypointsCompleted = ref(false);

const isVisible = ref(true);
const showKeypoints = ref(false);
const color = ref(annotation.value.color);
const compoundPath = ref(null);
const keypoints = ref(null);
const metadata = ref([]);
const isEmpty = ref(true);
const name = ref("");
const uuid = ref("");
const pervious = ref([]);
const count = ref(0);
const currentKeypoint = ref(null);
const keypoint = toRef({
    tag: [],
    visibility: 0,
    next: {
        label: -1,
        visibility: 2
    }
});
const sessions = ref([]);
const session = ref({
    start: Date.now(),
    tools: [],
    milliseconds: 0
});
// const tagRecomputeCounter = ref(0);
const visibilityOptions = ref(VisibilityOptions);

let annotationSettingsModal = null;
let keypointSettingsModal = null;



const initAnnotation = () => {
    const metaName = annotation.value.metadata.name;

    if (metaName) {
        name.value = metaName;
        delete annotation.value.metadata["name"];
    }

    if (compoundPath.value !== null) {
        compoundPath.value.remove();
        compoundPath.value = null;
    }

    createCompoundPath(annotation.value.paper_object, annotation.value.segmentation);
};


/* createCompoundPath */
const createCompoundPath = (json = null, segments = null) => {
  // Validate inputs
  const isValidJson = json !== null && json.length === 2;
  const isValidSegments = segments !== null && segments.length > 0;

  if (!isValidJson) json = null;
  if (!isValidSegments) segments = null;

  // Clear existing compound path and keypoints
  clearExistingPaths();

  // Create new compound path
  compoundPath.value = createNewCompoundPath();

  // Initialize keypoints
  initializeKeypoints();

  // Load annotation keypoints
  loadAnnotationKeypoints();

  // Populate compound path based on input type
  if (json !== null) {
    importJsonToCompoundPath(json);
  } else if (segments !== null) {
    loadSegmentsToCompoundPath(segments);
  }

  // Set metadata and styles for the compound path
  configureCompoundPath();
};

// Helper Functions

const clearExistingPaths = () => {
  if (compoundPath.value) compoundPath.value.remove();
  if (keypoints.value != null) {
    keypoints.value._keypoints.forEach((keypoint) => {
        keypoints.value.deleteKeypoint(keypoint);
    });
    keypoints.value.remove();
  }
};

const createNewCompoundPath = () => {
  const path = new paper.CompoundPath();
  path.onDoubleClick = handleDoubleClick;
  return path;
};

const handleDoubleClick = () => {
  if (activeTool.value !== 'Select') return;
  annotationSettingsModal.show();
};

const initializeKeypoints = () => {
  keypoints.value = new Keypoints(
    keypointEdges.value,
    keypointLabels.value,
    keypointColors.value,
    {
      annotationId: annotation.value.id,
      categoryName: category.value.name,
    }
  );

  keypoints.value.radius = scale.value * 6;
  keypoints.value.lineWidth = scale.value * 2;
};

const loadAnnotationKeypoints = () => {
  const { width, height } = annotation.value;
  const annotationKeypoints = annotation.value.keypoints;

  if (annotationKeypoints) {
    for (let i = 0; i < annotationKeypoints.length; i += 3) {
      const x = annotationKeypoints[i] - width / 2;
      const y = annotationKeypoints[i + 1] - height / 2;
      const v = annotationKeypoints[i + 2];

      if (x === 0 && y === 0 && v === 0) continue;

      addKeypoint(new paper.Point(x, y), v, i / 3 + 1);
    }
  }
};

const importJsonToCompoundPath = (json) => {
  compoundPath.value.importJSON(json);
};

const loadSegmentsToCompoundPath = (segments) => {
  const { width, height } = annotation.value;
  const center = new paper.Point(width / 2, height / 2);

  segments.forEach((polygon) => {
    const path = new paper.Path();

    for (let j = 0; j < polygon.length; j += 2) {
      const point = new paper.Point(polygon[j], polygon[j + 1]);
      path.add(point.subtract(center));
    }

    path.closePath();
    compoundPath.value.addChild(path);
  });
};

const configureCompoundPath = () => {
  updateCompoundPathData(compoundPath.value);

  compoundPath.value.fullySelected = isCurrent.value;
  compoundPath.value.opacity = opacity.value;

  setColor();

  compoundPath.value.onClick = () => {
    emit('click', index.value);
  };
};
/* end - createCompoundPath */

const deleteAnnotation = (id) => {
  axios.delete("/api/annotation/" + annotation.value.id).then(() => {
    socket.io.emit("annotation", {
      action: "delete",
      annotation: annotation.value,
    });
    deleteAnnot(id);
    emit("deleted", id);
  });
};

const deleteAnnot = (id) => {
  // we delete annotation on category component to avoid index desynchro between category.annotations and 
  // category.value.annotations.splice(id, 1);
  clearExistingPaths();
};

const onAnnotationClick = (newshowKeypoints) => {
  if (keypointLabels.value.length) {
    showKeypoints.value = newshowKeypoints;
  }
  if (isVisible.value) {
    emit('click', index.value);
  }
};

const onAnnotationKeypointClick = (labelIndex) => {
  if (isKeypointLabeled(labelIndex)) {
    keypoint.value.tag = [String(labelIndex + 1)];
    currentKeypoint.value = keypoints.value._labelled[keypoint.value.tag];
  }
  if (isVisible.value) {
    emit("keypoint-click", labelIndex);
  }
};

const onAnnotationKeypointSettingsClick = (labelIndex) => {
      keypoint.value.tag = [String(labelIndex + 1)];
      const indexLabel = parseInt(String(keypoint.value.tag));
      if (keypoints.value && indexLabel in keypoints.value._labelled) {
        const labelled = keypoints.value._labelled[indexLabel];
        currentKeypoint.value = labelled;
      }
      keypoint.value.visibility = getKeypointVisibility(labelIndex);
};

const onDeleteKeypointClick = (labelIndex) => {
      const label = String(labelIndex + 1);
      if (label in keypoints.value._labelled) {
        deleteKeypoint(keypoints.value._labelled[label]);
      }
};

const onMouseEnter = () => {
      if (compoundPath.value == null) return;
      compoundPath.value.selected = true;
};

const onMouseLeave = () => {
  if (compoundPath.value == null) return;
  compoundPath.value.selected = false;
};

const getCompoundPath = () => {
  if (compoundPath.value == null) {
    createCompoundPath();
  }
  return compoundPath.value;
};

const createUndoAction = (actionName) => {
      if (compoundPath.value == null) {
        createCompoundPath();
      }

      const copy = compoundPath.value.clone();
      copy.fullySelected = false;
      copy.visible = false;
      copy.onDoubleClick = compoundPath.value.onDoubleClick;
      copy.onClick = compoundPath.value.onClick;
      pervious.value.push(copy);

      const action = new UndoAction({
        name: `Annotation ${annotation.value.id}`,
        action: actionName,
        func: undoCompound,
        args: {},
      });

      procStore.addUndo(action);
};

/*  simplifyPath */
const simplifyPath = () => {
    if (shouldDeleteAnnotation()) {
        deleteAnnotation(index.value);
        return;
    }

    const newCompoundPath = cloneAndFlattenCompoundPath();
    updateCompoundPathData(newCompoundPath);

    const newChildren = createSimplifiedChildren(newCompoundPath);
    updateCompoundPathChildren(newCompoundPath, newChildren);

    finalizeCompoundPath(newCompoundPath);
};

// Helper Functions

const shouldDeleteAnnotation = () => {
    return compoundPath.value?.isEmpty() &&
                  keypoints.value.isEmpty();
};

const cloneAndFlattenCompoundPath = () => {
    let newCompoundPath = compoundPath.value.clone();
    newCompoundPath.flatten(1);

    if (newCompoundPath instanceof paper.Path) {
        newCompoundPath = new paper.CompoundPath(newCompoundPath);
    }

    return newCompoundPath;
};

const updateCompoundPathData = (newCompoundPath) => {
    newCompoundPath.data.annotationId = index.value;
    newCompoundPath.data.categoryId = categoryIndex.value;
};

const createSimplifiedChildren = (newCompoundPath) => {
    const newChildren = [];
    newCompoundPath.children.forEach(path => {
        const points = path.segments.map(seg => ({ x: seg.point.x, y: seg.point.y }));
        const simplifiedPoints = simplifyjs(points, simplify.value, true);
        const newPath = new paper.Path(simplifiedPoints);
        newPath.closePath();
        newChildren.push(newPath);
    });
    return newChildren;
};

const updateCompoundPathChildren = (newCompoundPath, newChildren) => {
    newCompoundPath.removeChildren();
    newCompoundPath.addChildren(newChildren);
};

const finalizeCompoundPath = (newCompoundPath) => {
    newCompoundPath.fullySelected = isCurrent.value;

    compoundPath.value.remove();
    compoundPath.value = newCompoundPath;

    keypoints.value.bringToFront();
    emitModify();
};
/* end - simplifyPath */


const undoCompound = () => {
  if (pervious.value.length === 0) return;
  compoundPath.value.remove();
  compoundPath.value = pervious.value.pop();
  compoundPath.value.fullySelected = isCurrent.value;
};

/* addKeypoint */
const addKeypoint = (point, visibility, label) => {
  // Early exit if the point already exists and no label is provided
  
  if (keypointsCompleted.value === true) {
      console.log('keypoints completed, do nothing...');
      return;
  }
  if(keypointLabels.value.length == 0) return;
  if (label == null && keypoints.value.contains(point)) return;
   
   console.log('keypoint:', keypoint.value);

  // Set default visibility and label if not provided
  visibility = visibility || parseInt(keypoint.value.next.visibility);
  label = label || parseInt(keypoint.value.next.label);

  if (label == -1 ) label = 1; // fix case adding keypoint without selecting a keypoint first.

  console.log('addKeypoint:', point, visibility, label);

  // Create a new keypoint
  const newKeypoint = createKeypoint(point, visibility, label);

  // Add the new keypoint to the keypoints collection
  keypoints.value.addKeypoint(newKeypoint);

  // Update the isEmpty state
  updateIsEmptyState();

  // Update the next available label
  updateNextLabel(label);
};

// Helper Functions

const createKeypoint = (point, visibility, label) => {
  return new Keypoint(point.x, point.y, {
    visibility: visibility || 0,
    indexLabel: label || 1,
    fillColor: keypointColors[label - 1],
    radius: scale.value * 6,
    onClick: handleKeypointClick,
    onDoubleClick: handleKeypointDoubleClick,
    onMouseDrag: handleKeypointMouseDrag,
  });
};

const handleKeypointClick = (event) => {
  if (!['Select', 'Keypoint'].includes(activeTool.value)) return;

  const targetKeypoint = event.target.keypoint;

  // Remove if already selected
  if (targetKeypoint === currentKeypoint.value) {
    currentKeypoint.value = null;
    return;
  }

  onAnnotationClick(true);
  onAnnotationKeypointClick(targetKeypoint.indexLabel - 1);

  if (currentKeypoint.value) {
    const i1 = currentKeypoint.value.indexLabel;
    const i2 = targetKeypoint.indexLabel;

    if (keypoints.value && i1 > 0 && i2 > 0) {
      const edge = [i1, i2];
      if (!keypoints.value.getLine(edge)) {
        addKeypointEdge(edge);
      } else {
        removeKeypointEdge(edge);
      }
    }
  }

  currentKeypoint.value = targetKeypoint;
};

const handleKeypointDoubleClick = (event) => {
  if (!categoryIsCurrent.value) return;
  if (!['Select', 'Keypoint'].includes(activeTool.value)) return;

  currentKeypoint.value = event.target.keypoint;

  const indexLabel = currentKeypoint.value.indexLabel;
  keypoint.value.tag = indexLabel === -1 ? [] : [indexLabel.toString()];
  keypoint.value.visibility = currentKeypoint.value.visibility;

  keypointSettingsModal.show();
};

const handleKeypointMouseDrag = (event) => {
  if (!['Select', 'Keypoint'].includes(activeTool.value)) return;

  const targetKeypoint = event.target.keypoint;
  keypoints.value.moveKeypoint(event.point, targetKeypoint);
};

const updateIsEmptyState = () => {
  isEmpty.value = compoundPath.value.isEmpty() && keypoints.value.isEmpty();
};

const updateNextLabel = (currentLabel) => {
  const unusedLabels = notUsedKeypointLabels.value;
  delete unusedLabels[String(currentLabel)];

  const unusedLabelKeys = Object.keys(unusedLabels);
  if (unusedLabelKeys.length > 0) {
    let nextLabel = unusedLabelKeys[0];
    for (let ul in unusedLabels) {
      if (ul > currentLabel) {
        nextLabel = ul;
        break;
      }
    }
    keypoint.value.next.label = nextLabel;
    keypointsCompleted.value = false;
  } else {
    keypoint.value.next.label = -1;
    keypointsCompleted.value = true;
    emit("keypointsComplete");
  }
};
/* end - addKeypoint */


const deleteKeypoint = (keypoint) => {
      keypoints.value.deleteKeypoint(keypoint);
};

const setCompound = (compound) => {
  const newCompound = compound;
  newCompound.strokeColor = null;
  newCompound.strokeWidth = 0;
  newCompound.onDoubleClick = compoundPath.value.onDoubleClick;
  newCompound.onClick = compoundPath.value.onClick;
  return newCompound;
}

const unite = (compound, simplify = true, undoable = true, isBBox = false) => {
  if (compoundPath.value == null) createCompoundPath();
  const newCompound = setCompound(compoundPath.value.unite(compound));
  annotation.value.isbbox = isBBox;
  if (undoable) createUndoAction("Unite");
  compoundPath.value.remove();
  compoundPath.value = newCompound;
  keypoints.value.bringToFront();
  if (simplify) simplifyPath();
};

const subtract = (compound, simplify = true, undoable = true) => {
  if (compoundPath.value == null) createCompoundPath();
  const newCompound = compoundPath.value.subtract(compound);
  newCompound.onDoubleClick = compoundPath.value.onDoubleClick;
  if (undoable) createUndoAction("Subtract");
  compoundPath.value.remove();
  compoundPath.value = newCompound;
  keypoints.value.bringToFront();
  if (simplify) simplifyPath();
};

const setColor = () => {
  if (compoundPath.value == null) return;
  
  // getShowAnnotations() is workaround to get showAnnotations, 
  // value is not propagating when changing in category 
  // and I don't understand why
  // if (!showAnnotations.value) {
  if (!getShowAnnotations()) {
    emit('set-color');
    return;
  }
  compoundPath.value.opacity = opacity.value;
  compoundPath.value.fillColor = color.value;
  keypoints.value.color = darkHSL.value;
};

const setCategory = (event) => {
      const newCategoryName = event.target.value;
      const newAnnotation = annotation.value;
      const oldCategory = category.value;
      updateAnnotationCategory(
        newAnnotation,
        oldCategory,
        newCategoryName
      );
      annotationSettingsModal.hide();
};


/* exportAnnotation */
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

// Helper Functions

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
    id: annotation.value.id,
    isbbox: annotation.value.isbbox,
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

  if (annotation.value.paper_object !== json) {
    annotationData.compoundPath = json;
  }
};

const addKeypointsToAnnotationData = (annotationData) => {
  if (!keypoints.value.isEmpty()) {
    annotationData.keypoints = keypoints.value.exportJSON(
      keypointLabels.value,
      annotation.value.width,
      annotation.value.height
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
/* end - exportAnnotation */

const emitModify = () => {
  const uuid = Math.random().toString(36).replace(/[^a-z]+/g, "");
  annotation.value.paper_object = compoundPath.value.exportJSON({ asString: false, precision: 1 });
  socket.io.emit("annotation", {
    uuid: uuid,
    action: "modify",
    annotation: annotation.value
  });
};

const getKeypointLabel = (keypoint) => {
  return keypoint && keypoint.keypoints.labels[keypoint.indexLabel - 1];
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
    if (isHover.value && isHoverCategory.value) return "#646c82";
    // if (keypoint.tag == index + 1) return "#4b624c";
    let activeIndex = keypoint.value.next.label;

    if (activeTool.value === "Select") {
      activeIndex = keypoint.value.tag[0];
    }
    if (isCurrent.value && activeIndex == index + 1) return "rgb(30, 86, 36)";
    return "#383c4a";
};


const categoryIndex = computed(() => {
      return getCategoryIndex();
});

/*
const isCurrent = computed(() => {
  if (index.value === current.value && categoryIsCurrent.value) {
    // if (compoundPath != null) compoundPath.bringToFront();
    // need NextTick to avoid infinite loop this seem's to generate infinite loop
    // not sure about what bringToFront() do, seem's to change nothing 
    // but it could be done elsewhere
    if (keypoints.value != null) nextTick(() => {keypoints.value.bringToFront()});
    // if (keypoints.value != null) keypoints.value.bringToFront();
    return true;
  }
  return false;
});
*/

const isCurrent = computed(() => {
    return index.value === current.value && categoryIsCurrent.value;
});

watch(isCurrent, (isNowCurrent) => {
  if (isNowCurrent && keypoints.value) {
      keypoints.value?.bringToFront();
    /* nextTick(() => {
        keypoints.value?.bringToFront();
      }); */
  }
});

const keypointListView = computed(() => {
  const listView = [];
  for (let i = 0; i < keypointLabels.value.length; ++i) {
    const visibility = getKeypointVisibility(i);
    let iconColor = "rgb(40, 42, 49)";

    if (visibility == 1) {
      iconColor = "lightgray";
    } else if (visibility == 2) {
      iconColor = keypointColors.value[i];
    }
    listView.push({
      label: keypointLabels.value[i],
      visibility,
      iconColor,
      backgroundColor: getKeypointBackgroundColor(i),
    });
  }
  return listView;
});

const isHover = computed(() => {
  return index.value === hover.value;
});

const backgroundColor = computed(() => {
      if (isHover.value && isHoverCategory.value) return "#646c82";
      if (isCurrent.value) return "#4b624c";
      return "inherit";
});

const showSideMenu = computed(() => {
      const localsearch = search.value.toLowerCase();
      if (localsearch.length === 0) return true;
      if (localsearch === String(annotation.value.id)) return true;
      if (localsearch === String(index.value + 1)) return true;
      return name.value.toLowerCase().includes(search.value);
});

const darkHSL = computed(() => {
      const tmpcolor = new paper.Color(color.value);
      const h = Math.round(tmpcolor.hue);
      const l = Math.round(tmpcolor.lightness * 50);
      const s = Math.round(tmpcolor.saturation * 100);
      return "hsl(" + h + "," + s + "%," + l + "%)";
});

const notUsedKeypointLabels = computed(() => {
  // tagRecomputeCounter;
  const tags = {};
  for (let i = 0; i < keypointLabels.value.length; i++) {
    // Include it tags if it is the current keypoint or not in use.
    if (keypoints.value && !keypoints.value._labelled[i + 1]) {
      tags[i + 1] = keypointLabels.value[i];
    }
  }
  return tags;
});

watch(
  () => activeTool.value,
  (tool) => {
    if (!isCurrent.value) return;

    session.value.tools.push(tool);

    if (tool === "Keypoint") {
      handleKeypointsTool(tool);
    }
  }
);

// called on KeypointTool click
function handleKeypointsTool(tool) {
  if (!showKeypoints.value) {
    showKeypoints.value = true;
  }

  const labelIndex = findLabelIndex();
  if (labelIndex > -1) {
    keypoint.value.tag = [String(labelIndex +  1)];
    currentKeypoint.value = keypoints.value._labelled[keypoint.value.tag];
    emit("keypoint-click", labelIndex);
  }
}

function findLabelIndex() {
  let labelIndex = -1;
  for (let i =  0; i < keypointLabels.value.length; ++i) {
    if (isKeypointLabeled(i)) {
      if (labelIndex <  0) {
        labelIndex = i;
      }
    } else {
      labelIndex = i;
      break;
    }
  }
  return labelIndex;
}


watch(
    () => opacity.value, 
    (newOpacity) => {
    compoundPath.value.opacity = newOpacity;
});


watch(
    () => color.value, 
    () => {
    setColor();
});

watch(
    () => isVisible.value, 
    (newVisible) => {
    if (compoundPath.value == null) return;
    compoundPath.value.visible = newVisible;
    keypoints.value.visible = newVisible;
});

watch(
    () => compoundPath.value, 
    () => {
    if (compoundPath.value == null) return;
    compoundPath.value.visible = isVisible.value;
    setColor();
    updateIsEmptyState();
}
);

watch(
    () => keypoints.value, 
    () => {
    updateIsEmptyState();
});


watch(
  () => isCurrent.value, 
  (newcurrent, wasCurrent) => {
  if (newcurrent) {
    // Start new session
    session.value.start = Date.now();
    session.value.tools = [activeTool.value];
  } else {
    currentKeypoint.value = null;
  }
  if (wasCurrent) {
    // Close session
    session.value.milliseconds = Date.now() - session.value.start;
    sessions.value.push(session.value);
  }
  if (compoundPath.value == null) return;
  compoundPath.value.fullySelected = newcurrent;
});

watch(
  () => currentKeypoint.value, 
  (point, old) => {
  if (old) old.selected = false;
  if (point) point.selected = true;
});

watch(
  () => keypoint.value.tag, 
  (newVal) => {
  const id = newVal.length === 0 ? -1 : newVal[0];
  if (id !== -1) {
    currentKeypoint.value = keypoints.value._labelled[id];
  }
  // tagRecomputeCounter.value++;
});

watch(
  () => keypoint.value.visibility, 
  (newVal) => {
  if (!currentKeypoint.value) return;
  currentKeypoint.value.visibility = newVal;
});

watch(
  () => keypointEdges.value, 
  (newEdges) => {
  keypoints.value.color = darkHSL.value;
  newEdges.forEach((e) => keypoints.value.addEdge(e));
});

watch(
  () => scale.value, 
  (newScale) => {
  if (!keypoints.value) return;
  keypoints.value.radius = newScale * 6;
  keypoints.value.lineWidth = newScale * 2;
}, { immediate: true });

const onAnnotation = (data) => {
  const localannotation = data.annotation;
  if (uuid.value === data.uuid) return;
  if (localannotation.id !== annotation.value.id) return;
  if (data.action === 'modify') {
    createCompoundPath(localannotation.paper_object, localannotation.segmentation);
  }
  if (data.action === 'delete') {
    deleteAnnotation(index.value);
  }
};

onMounted( () => {
    initAnnotation();

    const keypointTag = document.getElementById(`keypointSettings${annotation.value.id}`);
    keypointSettingsModal = new Modal(keypointTag, { });

    const modalTag = document.getElementById(`annotationSettings${annotation.value.id}`);
    annotationSettingsModal = new Modal(modalTag, { });

    // seem's to not work. should probably trigger category resetCategorySettings on @hidden when editing an annotation
    // maybe we should directly invoke method?
    modalTag.addEventListener('hidden.bs.modal', () => {
        currentKeypoint.value = null;
        resetCategorySettings();
    });

    getCurrentInstance().ctx.sockets.subscribe('annotation', onAnnotation);
});

onUnmounted(() => {
    getCurrentInstance().ctx.sockets.unsubscribe('annotation');

    annotationSettingsModal.hide();
    keypointSettingsModal.hide();
});

defineExpose({annotation, keypoint, notUsedKeypointLabels, onAnnotationKeypointClick,
                              unite, createUndoAction, keypoints, keypointLabels,
                              subtract, simplifyPath, exportAnnotation,
                              compoundPath, setColor, isVisible, showKeypoints, 
                              color, metadata, isEmpty, name, uuid, pervious,
                              count, currentKeypoint, sessions, session, 
                              addKeypoint, getKeypointVisibility,
                              deleteKeypoint, deleteAnnotation, deleteAnnot});

</script>

<style scoped>
.list-group-item {
  height: 22px;
  font-size: 13px;
  padding: 2px;
  background-color: #4b5162;
}

.annotation-text {
  padding: 0;
  padding-bottom: 4px;
  margin: 0;
  line-height: 1;
}

.keypoint-list {
  float: left;
  width: 100%;
  overflow: hidden;
}

.keypoint-item {
  background-color: #383c4a;
  cursor: pointer;
}

.annotation-icon {
  margin: 0;
  padding: 3px;
}
.keypoint-icon {
  margin: 0;
  padding: 3px;
  float: left;
  padding-right: 10px;
  padding-left: 6px;
}
</style>
