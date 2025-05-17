<template>
  <div style="display: block; height: inherit">
    <aside
      v-show="panels.show.left"
      class="left-panel shadow-lg"
    >
      <ToolsPanel
        ref="toolspanel"
        :image="image"
        :categories="categories"
        :mode="mode"
        @setcursor="setCursor"
      />

      <hr>

      <AnnotateButton :annotate-url="dataset.annotate_url" />

      <div v-show="mode == 'segment'">
        <CopyAnnotationsButton
          :categories="categories"
          :imageId="parseInt(props.identifier)"
          :next="image.next"
          :previous="image.previous"
        />
        <ShowAllButton />
        <HideAllButton />
      </div>
      <hr>
      <CenterButton />
      <UndoButton />

      <hr>

      <DownloadButton :image="image" />
      <SaveButton />
      <ModeButton v-model:mode="mode" />
      <SettingsButton
        ref="settings"
        :metadata="image.metadata"
        :commands="commands"
      />

      <hr>
      <DeleteButton :image="image" />
    </aside>

    <aside
      v-show="panels.show.right"
      class="right-panel shadow-lg"
    >
      <hr>
      <FileTitle
        ref="filetitle"
        :previousimage="image.previous"
        :nextimage="image.next"
        :filename="image.filename"
      />

      <div v-if="categories.length > 5">
        <div style="padding: 0px 5px">
          <input
            v-model="search"
            class="search"
            placeholder="Category Search"
          >
        </div>
      </div>

      <div
        class="sidebar-section"
        :style="{ 'max-height': mode == 'label' ? '100%' : '57%' }"
      >
        <p
          v-if="categories.length == 0"
          style="color: lightgray; font-size: 12px"
        >
          No categories have been enabled for this image.
        </p>

        <div
          v-show="mode == 'segment'"
          style="overflow: auto; max-height: 100%"
        >
          <Category
            v-for="(category, index) in categories"
            :ref="setCategoryRef"
            :key="category.id + '-category-'+image.id"
            :simplify="simplify"
            :categorysearch="search"
            :category="category"
            :all-categories="categories"
            :opacity="shapeOpacity"
            :hover="hover"
            :index="index"
            :current="current"
            :active-tool="activeTool"
            :scale="image.scale"
            @click="onCategoryClick"
            @keypoints-complete="onKeypointsComplete"
          />
        </div>

        <div
          v-show="mode == 'label'"
          style="overflow: auto; max-height: 100%"
        >
          <CLabel
            v-for="category in categories"
            :key="category.id + '-label-'+image.id"
            v-model="image.categoryIds"
            :category="category"
            :categoryIds="image.categoryIds"
            :search="search"
          />
        </div>
      </div>

      <div v-show="mode == 'segment'">
        <hr>
        <h6 class="sidebar-title text-center">
          {{ activeTool }}
        </h6>

        <div
          class="tool-section"
          style="max-height: 30%; color: lightgray"
        >
          <div v-if="bboxTool() != null">
            <BBoxPanel :bbox="bboxTool()" />
          </div>
          <div v-if="polygonTool() != null">
            <PolygonPanel :polygon="polygonTool()" />
          </div>

          <div v-if="selectTool() != null">
            <SelectPanel :select="selectTool()" />
          </div>

          <div v-if="magicwandTool() != null">
            <MagicWandPanel :magicwand="magicwandTool()" />
          </div>

          <div v-if="brushTool() != null">
            <BrushPanel :brush="brushTool()" />
          </div>

          <div v-if="eraserTool() != null">
            <EraserPanel :eraser="eraserTool()" />
          </div>

          <div v-if="keypointTool() != null">
            <KeypointPanel
              :keypoint="keypointTool()"
              :current-annotation="currentAnnotation"
            />
          </div>
          <div v-if="dextrTool() != null">
            <DEXTRPanel :dextr="dextrTool()" />
          </div>
          <!--
          <div v-if="sam != null">
            <SamPanel :sam="sam" />
          </div> 
          -->
          <div v-if="sam2Tool() != null">
            <Sam2Panel :sam2="sam2Tool()" />
          </div>
          <!--
          <div v-if="zim != null">
            <ZimPanel :zim="zim" />
          </div>
          -->
        </div>
      </div>
    </aside>

    <div
      class="middle-panel"
      :style="{ cursor: cursor }"
    >
      <!-- <v-touch
        @pinch="onpinch"
        @pinchstart="onpinchstart"
      > -->
      <div
        id="frame"
        class="frame"
        @wheel="onWheel"
      >
        <canvas
          id="editor"
          ref="refcanvas"
          :image="image"
          class="canvas"
          resize
        />
      </div>
    <!-- </v-touch> -->
    </div>

    <div
      v-show="annotating.length > 0"
      class="fixed-bottom alert alert-warning alert-dismissible fade show"
    >
      <span>
        This image is being annotated by <b>{{ annotating.join(", ") }}</b>.
      </span>

      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      >
      </button>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";

import FileTitle from "@/components/annotator/FileTitle";
import Category from "@/components/annotator/Category";
import CLabel from "@/components/annotator/Label";
import Annotations from "@/models/annotations";

import CopyAnnotationsButton from "@/components/annotator/tools/CopyAnnotationsButton";
import CenterButton from "@/components/annotator/tools/CenterButton";
import DownloadButton from "@/components/annotator/tools/DownloadButton";
import SaveButton from "@/components/annotator/tools/SaveButton";
import SettingsButton from "@/components/annotator/tools/SettingsButton";
import ModeButton from "@/components/annotator/tools/ModeButton";
import DeleteButton from "@/components/annotator/tools/DeleteButton";
import UndoButton from "@/components/annotator/tools/UndoButton";
import ShowAllButton from "@/components/annotator/tools/ShowAllButton";
import HideAllButton from "@/components/annotator/tools/HideAllButton";
import AnnotateButton from "@/components/annotator/tools/AnnotateButton";

import ToolsPanel from "@/components/annotator/panels/ToolsPanel.vue";

import PolygonPanel from "@/components/annotator/panels/PolygonPanel";
import BBoxPanel from "@/components/annotator/panels/BBoxPanel";
import SelectPanel from "@/components/annotator/panels/SelectPanel";
import MagicWandPanel from "@/components/annotator/panels/MagicWandPanel";
import BrushPanel from "@/components/annotator/panels/BrushPanel";
import EraserPanel from "@/components/annotator/panels/EraserPanel";
import KeypointPanel from "@/components/annotator/panels/KeypointPanel";
import DEXTRPanel from "@/components/annotator/panels/DEXTRPanel";
import SamPanel from "@/components/annotator/panels/SamPanel";
import Sam2Panel from "@/components/annotator/panels/Sam2Panel";
import ZimPanel from "@/components/annotator/panels/ZimPanel";


import { getCurrentInstance } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

import useCanvas from '@/composables/useCanvas';
import useShortcuts from "@/composables/shortcuts";
import useAxiosRequest from "@/composables/axiosRequest";
const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();

import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();
import { useProcStore } from "@/store/index";
const procStore = useProcStore();
import { useInfoStore } from "@/store/info";
const infoStore = useInfoStore();

const socket = inject('socket')

import { onBeforeUpdate, onUpdated, nextTick, toRef, ref, computed, watch, inject, onMounted, provide } from 'vue';

const props = defineProps({
  identifier: {
    type: [Number, String],
    required: true
  }
});

const annotations = ref(null);
const backup = ref(null);
const refcanvas = ref(null);

// bind all components
const settings = ref(null);
const toolspanel  = ref(null);

const bboxTool = () => toolspanel.value?.bbox;
const polygonTool = () => toolspanel.value?.polygon;
const eraserTool = () => toolspanel.value?.eraser;
const brushTool = () => toolspanel.value?.brush;
const magicwandTool = () => toolspanel.value?.magicwand;
const selectTool = () => toolspanel.value?.select;
const keypointTool = () => toolspanel.value?.keypoint;
const dextrTool = () => toolspanel.value?.dextr;
const sam2Tool = () => toolspanel.value?.sam2;

// const category = ref(null);
const annotation = ref(null);
const filetitle = ref(null);

const updateKeypointPanel = ref(1);

const activeTool = ref("Select");
const shapeOpacity = ref(0.6);
const zoom = ref(0.2);
const cursor = ref("move");
const mode = ref("segment");
const simplify = ref(1);
const panels = ref({
      show: {
        left: true,
        right: true
      }
});
const current = ref({
      category: -1,
      annotation: -1,
      keypoint: -1,
});
const hover = ref({
      category: -1,
      annotation: -1,
      keypoint: -1,
});
const image = ref({
      raster: {},
      scale: 0,
      metadata: {},
      ratio: 0,
      rotate: 0,
      id: null,
      url: "",
      dataset: 0,
      previous: null,
      next: null,
      filename: "",
      categoryIds: [],
      data: null
});

const categories = toRef([]);
const dataset = ref({
      annotate_url: ""
});
const loading = ref({
      image: true,
      data: true,
      loader: null
});
const search = ref("");
const annotating = ref([]);
const pinching = ref({
      old_zoom: 1
});

const category = ref(null);
const categorylist = ref([]);

const setCategoryRef = el => {
      if (el) {
         categorylist.value.push(el);
      }
}

// need to be declared after image
const {
  getCanvasElement,
  setupPaper,
  onWheel,
  onPinchStart,
  onPinch,
  fit,
  initCanvas,
  getImageRaster,
  updateImageName,
  getPaper
} = useCanvas(image, activeTool, current, procStore);

// should try toRef on activeTool, this function could probably be removed 
const setActiveTool = (tool) => {
    activeTool.value = tool;
};

const getActiveTool = () => {
    return activeTool.value;
};

const selectLastEditorTool = () => {
  activeTool.value = localStorage.getItem("editorTool") || "Select";
};

const getImageId = () => {
    return image.value.id;
};
  
const getHover = () => {
    return hover.value;
};
  

/* save function */
const save = (callback) => {
  const process = "Saving";
  procStore.addProcess(process);

  try {
    const data = prepareSaveData();
    sendDataToServer(data, callback);
  } finally {
    procStore.removeProcess(process);
  }
};

const prepareSaveData = () => {
  const data = {
    mode: mode.value,
    user: exportUserTools(),
    dataset: dataset.value,
    image: exportImageData(),
    settings: exportSettings(),
    categories: []
  };

  if (categorylist.value != null && mode.value === "segment") {
    populateCategories(data);
  }

  return data;
};

const exportUserTools = () => {
  return { ...toolspanel.value.exportUserTools(), 
                   settings: settings.value.exportSettings()
                 } ;
};

const exportImageData = () => ({
  id: image.value.id,
  metadata: settings.value.exportMetadata(),
  settings: {
    selectedLayers: current.value
  },
  category_ids: []
});

const exportSettings = () => ({
  activeTool: activeTool.value,
  zoom: zoom.value,
  tools: {}
});

const populateCategories = (data) => {
  image.value.categoryIds = [];
  categorylist.value.forEach((cat) => {
    const categoryData = cat.exportCategory();
    data.categories.push(categoryData);

    if (categoryData.annotations.length > 0) {
      const categoryIds = image.value.categoryIds;
      if (categoryIds.indexOf(categoryData.id) === -1) {
        categoryIds.push(categoryData.id);
      }
    }
  });

  data.image.category_ids = image.value.categoryIds;
};

const sendDataToServer = (data, callback) => {
  axios
    .post("/api/annotator/data", JSON.stringify(data))
    .then(() => {
      if (callback != null) callback();
    });
};
/* end - save function */

const setPreferences = (preferences) => {
    toolspanel.value.setPreferences(preferences);
    settings.value.setPreferences(preferences.settings || {});
};

const updateCurrentAnnotation = (value) => {
    current.value.annotation = -1;
};

/* getData */
const getData = (callback) => {
  const process = "Loading annotation data";
  procStore.addProcess(process);

  try {
    fetchData()
      .then((data) => {
        updateStateWithData(data);
        handlePreferences(data.preferences);
        updateUI();
        if (callback != null) callback();
      })
      .catch(handleFetchError)
      .finally(() => {
        procStore.removeProcess(process);
      });
  } catch (error) {
    console.error("Unexpected error in getData:", error);
    procStore.removeProcess(process);
  }
};

const fetchData = async () => {
  loading.value.data = true;
  try {
    const response = await axios.get("/api/annotator/data/" + image.value.id);
    return response.data;
  } finally {
    loading.value.data = false;
  }
};

const updateStateWithData = (data) => {
  image.value.metadata = data.image.metadata || {};
  image.value.filename = data.image.file_name;
  image.value.next = data.image.next;
  image.value.previous = data.image.previous;
  image.value.categoryIds = data.image.category_ids || [];
  annotating.value = data.image.annotating || [];
  dataset.value = data.dataset;
  categories.value = data.categories;
  procStore.setDataset(dataset.value);
};

const handlePreferences = (preferences) => {
  setPreferences(preferences);
};

const updateUI = () => {
  updateImageName(image.value.filename);

  nextTick(() => {
    showAll();
  });
};

const handleFetchError = () => {
  axiosReqestError(
    "Could not find requested image",
    "Redirecting to previous page."
  );
  router.go(-1);
};
/* end - getData */



const onCategoryClick = (indices) => {
      current.value.annotation = indices.annotation;
      current.value.category = indices.category;

      if (indices.hasOwnProperty('keypoint')) {
        current.value.keypoint = indices.keypoint;
        handleLabeledKeypointSelection(indices);
      } else {
        currentAnnotationFromList.value.keypoint.next.label = String(indices.keypoint + 1);
        activeTool.value = keypointTool();
        activeTool.value.click();
      }
};

function handleLabeledKeypointSelection(indices) {
      if(indices.keypoint === -1) return
      
      // keypoints._labelled seem's only visible on currentAnnotation
      if ( !(currentAnnotationFromList.value || currentCategoryFromList.value)) {
          console.log('something is wrong in annotation');
          return
      }
      
      const annot = currentAnnotationFromList.value
                                 || currentCategoryFromList.value.category.annotations[current.value.annotation];
      const keypoints = annot.keypoints;

      if (!keypoints._labelled) return; 
      const indexLabel = String(indices.keypoint + 1);
      const label = keypoints._labelled[indexLabel];

      if (label) {
        label.selected = true;
        activeTool.value = selectTool();
      } else {
        currentAnnotationFromList.value.keypoint.next.label = indexLabel;
        activeTool.value = keypointTool();
      }
      activeTool.value.click();
}

const onKeypointsComplete = () => {
       /********* Remove me when this.currentAnnotation will not be empty at start ********/ 

      if(!currentAnnotationFromList.value) {
          console.log('should remove this condition in onKeypointsComplete()')
           return
       }else {
         currentAnnotationFromList.value.keypoint.next.label = -1;
       }
       /********* Remove me when this.currentAnnotation will not be empty at start ********/
       if ( activeTool.value === 'Keypoints') {
            activeTool.value = selectTool();
            activeTool.value.click();
        }
};

const getCategoryByIndex = (index) => {
      if (index == null) return null;
      if (index < 0) return null;

      const cat = categorylist.value;
      if (cat == null) return null;
      if (cat.length < 1 || index >= cat.length) return null;

      return cat[index];
};

const getCategory = (index) => {
      if (index == null) return null;
      if (index < 0) return null;

      const cat = category.value;
      if (cat == null) return null;
      if (cat.length < 1 || index >= cat.length) return null;

      return cat[index];
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

const setCursor = (newCursor) => {
        // wait for next Dom update before changing cursor
        // or vue 3 don't see cursor has changed
        nextTick(() => {
              cursor.value = newCursor;
        });
};

const currentCategoryFromList = computed(() => {
  return getCategoryByIndex(current.value.category);
});

const currentCategory = computed(() => {
  return getCategory(current.value.category);
});

const currentAnnotationFromList = computed(() => {
  // recursive call in production mode

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
    if (currentCategoryFromList.value) {
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

const createAnnotation = () => {
        if (currentCategoryFromList.value) {
          currentCategoryFromList.value.createAnnotation();
        }
};


const deleteKeypoint = (annotation, keypoint) => {
    if (!annotation || !keypoint) return;

    annotation.keypoints.deleteKeypoint(keypoint);
    annotation.tagRecomputeCounter++;
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

const doShortcutAction = (action) => {
    switch(action) {
      case "cancelBbox":
            bboxTool().deleteBbox();
      break;
      case "cancelPolygon":
            polygonTool().deletePolygon();
      break;
      case "eraserIncreaseRadius":
            eraserTool().increaseRadius();
      break;
      case "eraserDecreaseRadius":
            eraserTool().decreaseRadius();
      break;
      case "brushIncreaseRadius":
            brushTool().increaseRadius();
      break;
      case "brushDecreaseRadius":
            brushTool().decreaseRadius();
      break;
      default:
    }
};

const scrollElement = (element) => {
  if (element != null) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
  }
};

const showAll = () => {
      if (categorylist.value == null) return;

      categorylist.value.forEach((cat) => {
            cat.isVisible = cat.category.annotations.length > 0;
      });
};

const hideAll = () => {
      if (categorylist.value == null) return;

      categorylist.value.forEach((cat) => {
        cat.isVisible = false;
        cat.showAnnotations = false;
      });
};

const findCategoryByName = (categoryName) => {
      const categoryComponent = categorylist.value.find(
        (cat) =>
          cat.category.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (!categoryComponent) return null;
      return categoryComponent.category;
};

const addAnnotation = (categoryName, segments, keypoints, isbbox = false) => {
      segments = segments || [];
      keypoints = keypoints || [];

      if (keypoints.length == 0 && segments.length == 0) return;

      const localcategory = findCategoryByName(categoryName);
      if (localcategory == null) return;

      Annotations.create({
        image_id: image.value.id,
        category_id: localcategory.id,
        segmentation: segments,
        keypoints: keypoints,
        isbbox: isbbox,
      }).then((response) => {
        const localannotation = response.data;
        localcategory.annotations.push(localannotation);
      });
};

const updateAnnotationCategory = (annotation, oldCategory, newCategoryName) => {
  const newCategory = findCategoryByName(newCategoryName);
  
  if (!newCategory || !annotation) return;

  currentAnnotationFromList.value.deleteAnnot(annotation.id);
  Annotations.update(annotation.id, { category_id: newCategory.id }).then(
    (response) => {
      const newAnnotation = {
        ...response.data,
        ...annotation,
        metadata: response.data.metadata,
        category_id: newCategory.id
      };
      if (newAnnotation) {
        oldCategory.annotations = oldCategory.annotations.filter(
          (a) => a.id !== annotation.id
        );
        newCategory.annotations.push(newAnnotation);
      }
    }
  );
};

const removeFromAnnotatingList = () => {
  if (user.value == null) return;
  const index = annotating.value.indexOf(user.value.username);
  //Remove self from list
  if (index > -1) {
    annotating.value.splice(index, 1);
  }
}

const nextImage = () => {
  if (image.value.next != null) filetitle.value.route(image.value.next);
}

const previousImage = () => {
  if (image.value.previous != null) filetitle.value.route(image.value.previous);
}

const activateTools = computed(() => {
  return current.value.annotation !== -1;
});

const doneLoading = computed(() => {
  return !loading.value.image && !loading.value.data;
});

const currentAnnotationLength = computed(() => {
  if (currentCategoryFromList.value == null) return null;
  return currentCategoryFromList.value.category.annotations.length;
});

const currentKeypointLength = computed(() => {

  if (currentAnnotationFromList.value == null) return null;
  return currentAnnotationFromList.value.annotation.keypoints.length;
});


const user = computed(() => {
  return authStore.user;
});


watch(
  () => doneLoading.value, 
  (done) => {
    if (done) {
        if (loading.value.loader) {
          loading.value.loader.hide();
        }
    }
});

watch(
  () => currentCategoryFromList.value, 
  (newCategory) => {
      if (newCategory == null) return;
      if (
          currentAnnotationFromList.value == null ||
          !newCategory.showAnnotations
      ) {
          const element = newCategory.$el;
          scrollElement(element);
      }
});

watch(
  () => currentAnnotationFromList.value, 
  (newElement) => {
      updateKeypointPanel.value = updateKeypointPanel.value + 1;
      if (newElement == null) return;
      if (newElement.showAnnotations) {
          const element = newElement.$el;
          scrollElement(element);
      }
});

watch(
  () => current.value.category, 
  (cc) => {
      if (cc < -1) current.value.category = -1;
      const max = categories.value.length;
      if (cc > max) {
        current.value.category = -1;
      }
});

watch(
  () => current.value.annotation, 
  (ca) => {
      if (ca < -1) current.value.annotation = -1;
      if (currentCategoryFromList.value != null) {
        const max = currentAnnotationLength.value;
        if (ca > max) {
          current.value.annotation = -1;
        }
      }
});

watch(
  ()=> current.value.keypoint, 
  (sk) => {
    updateKeypointPanel.value = updateKeypointPanel.value + 1;
    if (sk < -1) current.value.keypoint = -1;
    if (currentCategoryFromList.value != null) {
      const max = currentAnnotationLength.value;
      if (sk > max) {
        current.value.keypoint = -1;
      }
    }
});

watch(
  () => annotating.value, 
  () => {
    removeFromAnnotatingList();
});

watch(
  () => user.value, 
  () => {
    removeFromAnnotatingList();
});

const onAnnotating = (data) => {
      if (data.image_id !== image.value.id) return;

      if (data.active) {
        const found = annotating.value.indexOf(data.username);
        if (found < 0) {
          annotating.value.push(data.username);
        }
      } else {
        annotating.value.splice(annotating.value.indexOf(data.username), 1);
      }
};


onBeforeRouteLeave((to, from, next) => {
    current.value.annotation = -1;

    nextTick(() => {
      socket.io.emit("annotating", {
        image_id: image.value.id,
        active: false
      });
      save(next);
    });
});


onMounted(() => {
    // can't call this command like this, but work without !??
    // paper = new paper.PaperScope();
    image.value.id = parseInt(props.identifier);
    image.value.url = "/api/image/" + image.value.id;

    procStore.setDataset(null);

    initCanvas("Initializing canvas");
    getData();

    console.log('socket:', socket, getCurrentInstance());
    socket.emit("annotating", {image_id: image.value.id, active: true });
    getCurrentInstance().ctx.sockets.subscribe('annotating', onAnnotating);
});


onBeforeUpdate(() => {
      categorylist.value = [];
});


// Shoudl try to group all methods in a single provide like this :
// provide('annotator', { setCursor, updateCurrentAnnotation, ...,updateAnnotationCategory});
// in each impacted file should be able to inject like this :
// const { setCursor, updateCurrentAnnotation, ... } = inject('annotations');
provide('setCursor', setCursor);
provide('updateCurrentAnnotation', updateCurrentAnnotation);
provide('save', save);
provide('getData', getData);
provide('activateTools', activateTools);
provide('current', current.value);
provide('setActiveTool', setActiveTool);
provide('getActiveTool', getActiveTool);
provide('uniteCurrentAnnotation', uniteCurrentAnnotation);
provide('getCurrentAnnotation', getCurrentAnnotation);
provide('getCurrentCategory', getCurrentCategory);
provide('imageRaster', image.value.raster);
provide('getImageRaster', getImageRaster);
provide('getCategory', getCategory);
provide('getCategoryByIndex', getCategoryByIndex);
provide('getPaper', getPaper);
provide('getHover', getHover);
provide('getImageId', getImageId);
provide('addAnnotation', addAnnotation);
provide('showAll', showAll);
provide('hideAll', hideAll);
provide('fit', fit);
provide('scrollElement', scrollElement);
provide('selectLastEditorTool', selectLastEditorTool);
provide('updateAnnotationCategory', updateAnnotationCategory);


const {commands, undo, annotator} = useShortcuts(moveUp, moveDown, stepIn, stepOut, 
                                                                                                      createAnnotation, deleteAnnotation,
                                                                                                      setActiveTool, nextImage, previousImage,
                                                                                                      fit, save, doShortcutAction);

// defineExpose({simplify, dataset, bbox, select, category});
defineExpose({simplify, dataset, category});



</script>

<style scoped>
.alert {
  bottom: 0;
  width: 50%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* width */
::-webkit-scrollbar {
  width: 7px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: white;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #9feeb0;
}

.left-panel {
  background-color: #4b5162;
  width: 40px;
  padding-top: 40px;
  float: left;
  height: 100%;
  box-shadow: 5px 10px;
}

.right-panel {
  padding-top: 40px;
  background-color: #4b5162;
  width: 250px;
  height: inherit;
  float: right;
}

.middle-panel {
  display: block;
  width: inherit;
  height: inherit;
  background-color: #7c818c;
  overflow: hidden;
  position: relative;
}

.frame {
  margin: 0;
  width: 100%;
  height: 100%;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
}

#image {
  position: absolute;
}

.sidebar-section {
  width: 100%;
  padding-left: 5px;
  padding-right: 5px;
  overflow: auto;
}

.sidebar-title {
  color: white;
}

/* Tool section */
.tool-section {
  margin: 5px;
  border-radius: 5px;
  background-color: #383c4a;
  padding: 0 5px 5px 5px;
  overflow: auto;
}

/* Categories/Annotations section */
.meta-input {
  padding: 3px;
  background-color: inherit;
  width: 100%;
  height: 100%;
  border: none;
}

.meta-item {
  background-color: inherit;
  height: 30px;
  border: none;
}

.status-icon {
  font-size: 150px;
  color: white;
  position: absolute;
  left: calc(50% - 75px);
  top: calc(50% - 75px);
}

.search {
  width: 100%;
  height: 18px;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  text-align: center;
  border-radius: 4px;
}
</style>
