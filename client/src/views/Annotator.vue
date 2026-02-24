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
          />
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
            ref="categorylist"
            :key="category.id + '-category-'+image.id"
            :simplify="simplify"
            :categorysearch="search"
            :category="category"
            :all-categories="categories"
            :opacity="shapeOpacity"
            :hover="hover"
            :index="index"
            :current="current"
            :scale="image.scale"
            @click="onCategoryClick"
            @keypoints-complete="toolStore.onKeypointsComplete"
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
          {{ toolStore.activeTool }}
        </h6>

        <div v-if="currentPanel" class="tool-section" style="max-height:30%; color:lightgray">
          <component
            :is="currentPanel"
            v-bind="panelProps"
          />
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
// import Annotations from "@/models/annotations";

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


import { onBeforeUpdate, onUpdated, nextTick, toRef, ref, computed, watch, inject, onMounted, onUnmounted, provide, watchEffect } from 'vue';


import { getCurrentInstance } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

import useCanvas from '@/composables/useCanvas';
import useShortcuts from "@/composables/shortcuts";
import useAxiosRequest from "@/composables/axiosRequest";
const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();
import useDataHandling from '@/composables/useDataHandling';

import useAnnotatorImage from '@/composables/useAnnotatorImage';
import useAnnotatorState from '@/composables/useAnnotatorState';
import useAnnotatorData from '@/composables/useAnnotatorData';
import useAnnotatorMoves from '@/composables/useAnnotatorMoves';
import useCurrentEntities from '@/composables/useCurrentEntities';
import useToolPanel from '@/composables/useToolPanel';
import useAnnotations from '@/composables/useAnnotations';

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

import { useToolStore } from '@/store/toolStore';
const toolStore = useToolStore();

const socket = inject('socket')

const props = defineProps({
  identifier: {
    type: [Number, String],
    required: true
  }
});

const filetitle = ref(null);
const { image, getImageId, nextImage,  previousImage } = useAnnotatorImage(filetitle);
// bind all components
const settings = ref(null);
const { state, refsForTemplate, helpers, _, user } = useAnnotatorState(image);
/* expose some tool getters (wrap refs from ToolsPanel) */
const toolspanel = refsForTemplate.toolspanel;
const getTool = name => toolspanel.value?.[name];

/* unpack what we need directly for template access */
const { categories, dataset, loading, 
              panels, mode, current, hover, annotating, 
              search, shapeOpacity, simplify, 
              cursor, categorylist } =  refsForTemplate;

const { currentPanel, panelProps, toolInst } = useToolPanel(toolspanel)


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
} = useCanvas(image, current, procStore);

const { getData, fetchData, showAll, hideAll } = useAnnotatorData({ state, axios, router, axiosReqestError, toolspanel, settings, categorylist, image, updateImageName, procStore });

console.log('image:', image.value.url);

const refcanvas = ref(null);
const annotation = ref(null);
const pinching = ref({
      old_zoom: 1
});
const category = ref(null);

console.log('refsForTemplate.settings:', refsForTemplate.settings, settings.value);

const { save } = useDataHandling(image, categories, dataset, 
                                  categorylist, refsForTemplate.toolspanel,
                                  settings, procStore, mode, current, refsForTemplate.zoom);

const getHover = () => {
    return hover.value;
};

const handleFetchError = () => {
  axiosReqestError(
    "Could not find requested image",
    "Redirecting to previous page."
  );
  router.go(-1);
};
/* end - getData */


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

      let tool=null;
      if (label) {
        label.selected = true;
        tool = getTool('select');
        toolStore.setActiveTool('Select');
      } else {
        currentAnnotationFromList.value.keypoint.next.label = indexLabel;
        tool = getTool('keypoint');
        toolStore.setActiveTool('Keypoint');
      }
      tool.click();
};

const getCategoryByIndex = (index) => {
  return (categorylist.value?.length > index && index >= 0) ? categorylist.value[index] : null;
}

const {
    activateTools,
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
  } = useCurrentEntities(current, getCategoryByIndex);

const onCategoryClick = (indices) => {
    // delegate to helper to keep template lightweight
    // console.log('onCategoryClick:', indices);
    helpers.onCategoryClick(indices);
    
    if (indices.hasOwnProperty('keypoint')) {
        handleLabeledKeypointSelection(indices);
    }
};

const setCursor = (newCursor) => {
        // wait for next Dom update before changing cursor
        // or vue 3 don't see cursor has changed
        nextTick(() => {
              cursor.value = newCursor;
        });
};

const {
  findCategoryByName,
  addAnnotation,
  createAnnotation,
  deleteAnnotation,
  deleteKeypoint,
  updateAnnotationCategory,
  selectAnnotation,
  scrollToElement,
} = useAnnotations({
        image,
        categories,
        categorylist,
        current,
        axiosReqestError,
        procStore,
        router,
        currentCategoryFromList,
        currentAnnotationFromList,
});


const removeFromAnnotatingList = () => {
  if (user.value == null) return;
  const index = annotating.value.indexOf(user.value.username);
  //Remove self from list
  if (index > -1) {
    annotating.value.splice(index, 1);
  }
}



const {moveUp, moveDown, stepIn, stepOut} = useAnnotatorMoves(current, currentAnnotation, currentAnnotationFromList, currentCategory, currentCategoryFromList, currentKeypoint, categories, currentAnnotationLength)


const clampIndex = (val, max) => (val < 0 ? -1 : val >= max ? max - 1 : val)
watchEffect(() => {
  current.value.category   = clampIndex(current.value.category,   categories.value.length);
  current.value.annotation = clampIndex(current.value.annotation, currentCategoryFromList.value?.category.annotations.length || 0);
  current.value.keypoint   = clampIndex(current.value.keypoint,   currentAnnotationFromList?.value?.keypointLabels.length || 0);
})

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

onBeforeRouteLeave(async (to, from) => {
  current.value.annotation = -1;
  socket.io.emit("annotating", { image_id: image.value.id, active: false });
  await save(); // navigation proceeds after this resolves
  // If you want to cancel: throw or return false
});


onMounted(() => {
    // can't call this command like this, but work without !??
    // paper = new paper.PaperScope();
    image.value.id = parseInt(props.identifier);
    image.value.url = "/api/image/" + image.value.id;

    console.log('state:', state, image);
    procStore.setDataset(null);

    initCanvas("Initializing canvas");
    getData();

    console.log('socket:', socket, getCurrentInstance());
    socket.emit("annotating", {image_id: image.value.id, active: true });
    getCurrentInstance().ctx.sockets.subscribe('annotating', onAnnotating);
});

onUnmounted(() => {
  socket.emit("annotating", { image_id: image.value.id, active: false });
  getCurrentInstance().ctx.sockets.unsubscribe('annotating', onAnnotating);
});


const ctx = {
 setCursor, updateCurrentAnnotation, save, getData, activateTools, current, 
 uniteCurrentAnnotation, getCurrentAnnotation, getCurrentCategory, getImageRaster, 
 getCategoryByIndex, getPaper, getHover, getImageId, addAnnotation, showAll, hideAll, fit, scrollToElement,
 updateAnnotationCategory,
}

provide('annotator', ctx)
provide('imageRaster', image.value.raster);

const {commands, undo, annotator} = useShortcuts(moveUp, moveDown, stepIn, stepOut, 
                                                                                                      createAnnotation, deleteAnnotation,
                                                                                                      toolStore.setActiveTool, nextImage, previousImage,
                                                                                                      fit, save, getTool);

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
