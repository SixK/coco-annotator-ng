<template>
  <div style="display: block; height: inherit">
    <aside
      v-show="panels.show.left"
      class="left-panel shadow-lg"
    >
      <div v-show="mode == 'segment'">
        <hr>

        <SelectTool
          ref="select"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />
        <hr>

        <BBoxTool
          ref="bbox"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />

        <PolygonTool
          ref="polygon"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />

        <MagicWandTool
          ref="magicwand"
          v-model="activeTool"
          :width="image.raster.width"
          :height="image.raster.height"
          :image-data="image.data"
          @setcursor="setCursor"
        />

        <BrushTool
          ref="brush"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />
        <EraserTool
          ref="eraser"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />

        <KeypointTool
          ref="keypoint"
          v-model="activeTool"
          @setcursor="setCursor"
        />
        <DEXTRTool
          ref="dextr"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />
        <SamTool
          ref="sam"
          v-model="activeTool"
          :scale="image.scale"
          @setcursor="setCursor"
        />
      </div>
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
            :key="category.id + '-category-'+image.id"
            :simplify="simplify"
            :categorysearch="search"
            :category="category"
            :all-categories="categories"
            :opacity="shapeOpacity"
            :ref="setCategoryRef"
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
          <div v-if="bbox != null">
            <BBoxPanel :bbox="bbox" />
          </div>
          <div v-if="polygon != null">
            <PolygonPanel :polygon="polygon" />
          </div>

          <div v-if="select != null">
            <SelectPanel :select="select" />
          </div>

          <div v-if="magicwand != null">
            <MagicWandPanel :magicwand="magicwand" />
          </div>

          <div v-if="brush != null">
            <BrushPanel :brush="brush" />
          </div>

          <div v-if="eraser != null">
            <EraserPanel :eraser="eraser" />
          </div>

          <div v-if="keypoint != null">
            <KeypointPanel
              :key="updateKeypointPanel"
              :keypoint="keypoint"
              :current-annotation="currentAnnotation"
            />
          </div>
          <div v-if="dextr != null">
            <DEXTRPanel :dextr="dextr" />
          </div>
          <div v-if="sam != null">
            <SamPanel :sam="sam" />
          </div>
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
            ref="refcanvas"
            id="editor"
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
        class="close"
        data-bs-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import paper from "paper";
import axios from "axios";

import FileTitle from "@/components/annotator/FileTitle";
import Category from "@/components/annotator/Category";
import CLabel from "@/components/annotator/Label";
import Annotations from "@/models/annotations";

import PolygonTool from "@/components/annotator/tools/PolygonTool";
import BBoxTool from "@/components/annotator/tools/BBoxTool";
import SelectTool from "@/components/annotator/tools/SelectTool";
import MagicWandTool from "@/components/annotator/tools/MagicWandTool";
import EraserTool from "@/components/annotator/tools/EraserTool";
import BrushTool from "@/components/annotator/tools/BrushTool";
import KeypointTool from "@/components/annotator/tools/KeypointTool";
import DEXTRTool from "@/components/annotator/tools/DEXTRTool";
import SamTool from "@/components/annotator/tools/SamTool";

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

import PolygonPanel from "@/components/annotator/panels/PolygonPanel";
import BBoxPanel from "@/components/annotator/panels/BBoxPanel";
import SelectPanel from "@/components/annotator/panels/SelectPanel";
import MagicWandPanel from "@/components/annotator/panels/MagicWandPanel";
import BrushPanel from "@/components/annotator/panels/BrushPanel";
import EraserPanel from "@/components/annotator/panels/EraserPanel";
import KeypointPanel from "@/components/annotator/panels/KeypointPanel";
import DEXTRPanel from "@/components/annotator/panels/DEXTRPanel";
import SamPanel from "@/components/annotator/panels/SamPanel";


import { getCurrentInstance } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

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

/*
import { useStore } from 'vuex';
const store = useStore();
*/


import { toRaw, onBeforeUpdate, onUpdated, nextTick, markRaw, toRef, ref, computed, watch, inject, onMounted, provide } from 'vue';

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
const bbox = ref(null);
const polygon = ref(null);
const eraser = ref(null);
const brush = ref(null);
const magicwand = ref(null);
const select = ref(null);
const settings = ref(null);
const keypoint  = ref(null);
// const category = ref(null);
const annotation = ref(null);
const filetitle = ref(null);
const dextr = ref(null);
const sam = ref(null);

const updateKeypointPanel = ref(1);

const activeTool = ref("Select");
// const paper = ref(null);
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

const text = ref({
      topLeft: null,
      topRight: null
});
const categories = ref([]);
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

const category = ref(null)
const categorylist = ref([])

const setCategoryRef = el => {
      if (el) {
         categorylist.value.push(el);
      }
}


// should try toRef on activeTool, this function could probably be removed 
const setActiveTool = (tool) => {
    activeTool.value = tool;
};

const getActiveTool = () => {
    return activeTool.value;
};

const getImageId = () => {
    return image.value.id;
};
  
const getHover = () => {
    return hover.value;
};
  
const getPaper = () => {
    return paper;
};
  
const save = (callback) => {
      let process = "Saving";
      // this.addProcess(process);
      // store.commit('addProcess', process);
      procStore.addProcess(process);
      
      
      let data = {
        mode: mode.value,
        user: {
          bbox: bbox.value.exportBBox(),
          polygon: polygon.value.exportPolygon(),
          eraser: eraser.value.exportEraser(),
          brush: brush.value.exportBrush(),
          magicwand: magicwand.value.exportWand(),
          select: select.value.exportSelect(),
          settings: settings.value.exportSettings(),
        },
        dataset: dataset.value,
        image: {
          id: image.value.id,
          metadata: settings.value.exportMetadata(),
          settings: {
            selectedLayers: current.value
          },
          category_ids: []
        },
        settings: {
          activeTool: activeTool.value,
          zoom: zoom.value,
          tools: {}
        },
        categories: []
      };

      if (categorylist.value != null && mode.value === "segment") {
        image.value.categoryIds = [];
        categorylist.value.forEach((cat) => {
          let categoryData = cat.exportCategory();
          data.categories.push(categoryData);

          if (categoryData.annotations.length > 0) {
            let categoryIds = image.value.categoryIds;
            if (categoryIds.indexOf(categoryData.id) === -1) {
              categoryIds.push(categoryData.id);
            }
          }
        });
      }

      data.image.category_ids = image.value.categoryIds;

      axios
        .post("/api/annotator/data", JSON.stringify(data))
        .then(() => {
          //TODO: updateUser
          if (callback != null) callback();
        })
        .finally(() => {
            // store.commit('removeProcess', process);
            procStore.removeProcess(process);
        });
};

const onpinchstart = (e) => {
      e.preventDefault();
      if (!doneLoading.value) return;
      let view = paper.view;
      pinching.value.old_zoom = paper.view.zoom;
      return false;
};

const onpinch = (e) => {
      e.preventDefault();
      if (!doneLoading.value) return;
      let view = paper.view;
      let viewPosition = view.viewToProject(
        new paper.Point(e.center.x, e.center.y)
      );
      let curr_zoom = e.scale * pinching.value.old_zoom;
      let beta = paper.view.zoom / curr_zoom;
      let pc = viewPosition.subtract(paper.view.center);
      let a = viewPosition
        .subtract(pc.multiply(beta))
        .subtract(paper.view.center);
      let transform = { zoom: curr_zoom, offset: a };
      if (transform.zoom < 10 && transform.zoom > 0.01) {
        image.value.scale = 1 / transform.zoom;
        paper.view.zoom = transform.zoom;
        paper.view.center = view.center.add(transform.offset);
      }
      return false;
};

const onWheel = (e) => {
  e.preventDefault();
  if (!doneLoading.value) return;
  let view = paper.view;
  if (e.ctrlKey) {
    // Pan up and down
    let delta = new paper.Point(0, 0.5 * e.deltaY);
    paper.view.setCenter(view.center.add(delta));
  } else if (e.shiftKey) {
    // Pan left and right
    let delta = new paper.Point(0.5 * e.deltaY, 0);
    paper.view.setCenter(view.center.add(delta));
  } else {
    let viewPosition = view.viewToProject(
      new paper.Point(e.offsetX, e.offsetY)
    );
    let transform = changeZoom(e.deltaY, viewPosition);
    if (transform.zoom < 10 && transform.zoom > 0.01) {
      image.value.scale = 1 / transform.zoom;
      paper.view.zoom = transform.zoom;
      paper.view.center = view.center.add(transform.offset);
    }
  }
  return false;
};

const fit = () => {
  const canvas = document.getElementById("editor");
  // const canvas = refcanvas.value;
  const parentX = image.value.raster.width;
  const parentY = image.value.raster.height;

  paper.view.zoom = Math.min(
    (canvas.width / parentX) * 0.95,
    (canvas.height / parentY) * 0.8
  );
  image.value.scale = 1 / paper.view.zoom;
  paper.view.setCenter(0, 0);
};

const changeZoom = (delta, p) => {
  const oldZoom = paper.view.zoom;
  const c = paper.view.center;
  const factor = 1 + zoom.value;
  const newZoom = delta < 0 ? oldZoom * factor : oldZoom / factor;
  const beta = oldZoom / newZoom;
  const pc = p.subtract(c);
  const a = p.subtract(pc.multiply(beta)).subtract(c);
  return { zoom: newZoom, offset: a };
};

const initCanvas = () => {
      let process = "Initializing canvas";
      // this.addProcess(process);
      // store.commit('addProcess', process);
      procStore.addProcess(process);
      

      loading.value.image = true;

      let canvas = document.getElementById("editor");
      // let canvas = refcanvas.value;
      
      paper.setup(canvas);
      paper.view.viewSize = [
        paper.view.size.width,
        window.innerHeight
      ];
      paper.activate();

      image.value.raster = new paper.Raster(image.value.url);
      image.value.raster.onLoad = () => {
        let width = image.value.raster.width;
        let height = image.value.raster.height;

        image.value.raster.sendToBack();
        fit();
        image.value.ratio = (width * height) / 1000000;
        // this.removeProcess(process);
        // store.commit('removeProcess', process);
        procStore.removeProcess(process);

        let tempCtx = document.createElement("canvas").getContext("2d");
        tempCtx.canvas.width = width;
        tempCtx.canvas.height = height;
        tempCtx.drawImage(image.value.raster.image, 0, 0);

        image.value.data = tempCtx.getImageData(0, 0, width, height);
        let fontSize = width * 0.025;

        let positionTopLeft = new paper.Point(
          -width / 2,
          -height / 2 - fontSize * 0.5
        );
        text.value.topLeft = new paper.PointText(positionTopLeft);
        text.value.topLeft.fontSize = fontSize;
        text.value.topLeft.fillColor = "white";
        text.value.topLeft.content = image.value.filename;

        let positionTopRight = new paper.Point(
          width / 2,
          -height / 2 - fontSize * 0.4
        );
        text.value.topRight = new paper.PointText(positionTopRight);
        text.value.topRight.justification = "right";
        text.value.topRight.fontSize = fontSize;
        text.value.topRight.fillColor = "white";
        text.value.topRight.content = width + "x" + height;

        loading.value.image = false;
      };
};

const setPreferences = (preferences) => {
      bbox.value.setPreferences(preferences.bbox || preferences.polygon || {});
      polygon.value.setPreferences(preferences.polygon || {});
      select.value.setPreferences(preferences.select || {});
      magicwand.value.setPreferences(preferences.magicwand || {});
      brush.value.setPreferences(preferences.brush || {});
      eraser.value.setPreferences(preferences.eraser || {});
      
      settings.value.setPreferences(preferences.settings || {});
};

const updateCurrentAnnotation = (value) => {
    current.value.annotation = -1;
};

const getData = (callback) => {
      let process = "Loading annotation data";
      // this.addProcess(process);
       // store.commit('addProcess', process);
       procStore.addProcess(process);

      loading.value.data = true;
      axios
        .get("/api/annotator/data/" + image.value.id)
        .then((response) => {
          let data = response.data;

          loading.value.data = false;
          // Set image data
          image.value.metadata = data.image.metadata || {};
          image.value.filename = data.image.file_name;
          image.value.next = data.image.next;
          image.value.previous = data.image.previous;
          image.value.categoryIds = data.image.category_ids || [];

          annotating.value = data.image.annotating || [];

          // Set other data
          dataset.value = data.dataset;
          categories.value = data.categories;

          // Update status
          // setDataset(dataset.value);
          // store.commit('setDataset', dataset.value);
          procStore.setDataset(dataset.value);


          let preferences = data.preferences;
          setPreferences(preferences);

          if (text.value.topLeft != null) {
            text.value.topLeft.content = image.value.filename;
          }

          nextTick(() => {
            showAll();
          });

          if (callback != null) callback();
        })
        .catch(() => {     
              axiosReqestError(
                "Could not find requested image",
                "Redirecting to previous page."
              );
              router.go(-1);
        })
        .finally(() => {
            procStore.removeProcess(process);
            // store.commit('removeProcess', process);
        });
};

const onCategoryClick = (indices) => {
      current.value.annotation = indices.annotation;
      current.value.category = indices.category;
      if (!indices.hasOwnProperty("keypoint")) {
        indices.keypoint = -1;
      }
      if (indices.keypoint !== -1) {
        current.value.keypoint = indices.keypoint;
        let ann =
          currentCategoryFromList.value.category.annotations[current.value.annotation];
          
        let kpTool = keypoint.value;
        let selectTool = select.value;
        let cat = categorylist.value[current.value.category];

        // let annot = cat.$refs.annotation[current.value.annotation];
        let annot = cat.category.annotations[current.value.annotation]
        if (currentAnnotationFromList.value) {
            // keypoints._labelled seem's only visible on currentAnnotation
            annot = currentAnnotationFromList.value;
        }

        // let annotation = category.$refs.annotation[this.current.annotation];
        // let annot = annotation.value[current.value.annotation];
        annot.showKeypoints = true;
        let keypoints = annot.keypoints;
        if (keypoints._labelled && keypoints._labelled[indices.keypoint + 1]) {
          let indexLabel = String(current.value.keypoint + 1);
              let keypoint = keypoints._labelled[indexLabel];
              keypoint.selected = true;
              activeTool.value = selectTool;
              activeTool.value.click();
        } else {
          currentAnnotationFromList.value.keypoint.next.label = String(
            indices.keypoint + 1
          );
          activeTool.value = kpTool;
          activeTool.value.click();
        }
      }
};

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
            activeTool.value = select.value;
            activeTool.value.click();
        }
};

const getCategoryByIndex = (index) => {
      if (index == null) return null;
      if (index < 0) return null;
      
      let cat = categorylist.value;
      // let cat = backup.value;

      if (cat == null) return null;
      
      if (cat.length < 1 || index >= cat.length) return null;

      return cat[index];
      // return backup.value[index];
};

const getCategory = (index) => {
      if (index == null) return null;
      if (index < 0) return null;

      let cat = category.value;
      // let cat = backup.value;

      if (cat == null) return null;
      if (cat.length < 1 || index >= cat.length) return null;

      return cat[index];
      // return backup.value[index];
};

const uniteCurrentAnnotation = (compound, simplify = true, undoable = true, isBBox = false) => {
  if (currentAnnotationFromList.value == null) return;
  currentAnnotationFromList.value.unite(compound, simplify, undoable, isBBox);
};

const subtractCurrentAnnotation = (compound, simplify = true, undoable = true) => {
  if (currentCategoryFromList.value == null) return;
  currentAnnotationFromList.value.subtract(compound, simplify, undoable);
};

const selectLastEditorTool = () => {
  activeTool.value = localStorage.getItem("editorTool") || "Select";
};

const getImageRaster = () => {
  return image.value.raster;
};

const getCurrentCategory = () => {
    console.log('getCurrentCategory called');
  return currentCategoryFromList.value;
};

const getCurrentAnnotation = () => {
        console.log('getCurrentAnnotation called');
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
  console.log('annotator compute currentAnnotationFromList:', currentCategoryFromList.value);

  if (currentCategoryFromList.value == null) {
    return null;
  }

  console.log(' compute current annotationList annotation2:', currentCategoryFromList.value.getAnnotationFromIndex(current.value.annotation));
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
      if (currentKeypoint.value) {
        currentAnnotation.value.onAnnotationKeypointClick(current.value.keypoint);
      }
    }
};

const decrementCategory = () => {
    if (current.value.category === -1) {
      current.value.category = categories.value.length - 1;
      let annotationCount = currentCategoryFromList.value.category.annotations.length;
      if (annotationCount > 0) {
        current.value.annotation = annotationCount - 1;
      }
    } else {
      current.value.category -= 1;
    }
};

const incrementAnnotation = () => {
  let annotationCount = currentCategoryFromList.value.category.annotations.length;
  if (current.value.annotation === annotationCount - 1) {
    incrementCategory();
    current.value.annotation = -1;
  } else {
    current.value.annotation += 1;
    if (
      currentAnnotation.value != null &&
      currentAnnotation.value.showKeypoints
    ) {
      current.value.keypoint = 0;
      currentAnnotation.value.onAnnotationKeypointClick(current.value.keypoint);
    } else {
      current.value.keypoint = -1;
    }
  }
};

const decrementAnnotation = () => {
  let annotationCount = currentCategoryFromList.value.category.annotations.length;
  if (current.value.annotation === -1) {
    current.value.annotation = annotationCount - 1;
  } else if (current.value.annotation === 0) {
    decrementCategory();
  } else {
    current.value.annotation -= 1;
    if (
      currentAnnotation.value != null &&
      currentAnnotation.value.showKeypoints
    ) {
      current.value.keypoint =
        currentAnnotation.value.keypointLabels.length - 1;
      currentAnnotation.value.onAnnotationKeypointClick(current.value.keypoint);
    } else {
      current.value.keypoint = -1;
    }
  }
};

const incrementKeypoint = () => {
    let keypointCount = currentAnnotation.value.keypointLabels.length;
    if (current.value.keypoint === keypointCount - 1) {
      incrementAnnotation();
    } else {
      current.value.keypoint += 1;
    }
    if (currentKeypoint.value != null) {
      currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
      // currentAnnotation.value.emit("keypoint-click", current.value.keypoint);
    }
  };

const decrementKeypoint = () => {
    if (current.value.keypoint === 0) {
      decrementAnnotation();
    } else {
      current.value.keypoint -= 1;
    }
    if (currentKeypoint.value != null) {
      currentAnnotationFromList.value.onAnnotationKeypointClick(current.value.keypoint);
      // currentAnnotation.value.emit("keypoint-click", current.value.keypoint);
    }
};

const moveUp = () => {
  if (currentCategoryFromList.value != null) {
    if (currentAnnotationFromList.value != null) {
      if (currentKeypoint.value != null) {
        decrementKeypoint();
      } else if (
        currentAnnotationFromList.value.showKeypoints &&
        current.value.keypoint === -1
      ) {
        decrementKeypoint();
      } else {
        decrementAnnotation();
      }
    } else if (current.value.annotation === -1) {
      decrementAnnotation();
    } else {
      decrementCategory();
    }
  } else {
    decrementCategory();
  }
};

const moveDown = () => {
  if (currentCategoryFromList.value != null) {
    if (currentAnnotationFromList.value != null) {
      if (currentKeypoint.value != null) {
        incrementKeypoint();
      } else if (
        currentAnnotationFromList.value.showKeypoints &&
        current.value.keypoint == -1
      ) {
        incrementKeypoint();
      } else {
        incrementAnnotation();
      }
    } else if (current.value.annotation == -1) {
      incrementAnnotation();
    } else {
      incrementCategory();
    }
  } else {
    incrementCategory();
  }
};

const stepIn = () => {
    console.log('stepIn ...');
      if (currentCategoryFromList.value != null) {
        if (!currentCategoryFromList.value.isVisible && currentAnnotationFromList.value) {
          currentCategoryFromList.value.isVisible = true;
          current.value.annotation = 0;
          currentAnnotationFromList.value.showKeypoints = false;
          current.value.keypoint = -1;
        } else if (
          !currentCategoryFromList.value.showAnnotations &&
          currentAnnotationLength.value > 0
        ) {
          currentCategoryFromList.value.showAnnotations = true;
          current.value.annotation = 0;
          currentAnnotationFromList.value.showKeypoints = false;
          current.value.keypoint = -1;
        } else if (
          currentAnnotationFromList.value != null &&
          !currentAnnotationFromList.value.showKeypoints &&
          currentAnnotationFromList.value.keypointLabels &&
          currentAnnotationFromList.value.keypointLabels.length > 0
        ) {
          currentAnnotationFromList.value.showKeypoints = true;
          current.value.keypoint = 0;
          currentAnnotationFromList.value.onAnnotationKeypointClick(
            current.value.keypoint
          );
        }
      }
};

const stepOut = () => {
  if (currentCategoryFromList.value != null) {
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
  }
};

const createAnnotation = () => {
        if (currentCategory.value) {
          currentCategory.value.createAnnotation();
        }
};

const deleteAnnotation = () => {
    if (currentAnnotation.value) {
        let currentKeypoint = currentAnnotation.value.currentKeypoint;
        if (currentKeypoint) {
            currentAnnotation.value.keypoints.deleteKeypoint(
                        currentKeypoint
            );
            currentAnnotation.value.tagRecomputeCounter++;
            currentAnnotation.value.currentKeypoint = null;
        } else {
            currentAnnotation.value.deleteAnnotation();
        }
    }
};

const doShortcutAction = (action) => {
    switch(action) {
      case "cancelBbox":
            bbox.value.deleteBbox();
      break;
      case "cancelPolygon":
            polygon.value.deletePolygon();
      break;
      case "eraserIncreaseRadius":
            eraser.value.increaseRadius();
      break;
      case "eraserDecreaseRadius":
            eraser.value.decreaseRadius();
      break;
      case "brushIncreaseRadius":
            brush.value.increaseRadius();
      break;
      case "brushDecreaseRadius":
            brush.value.decreaseRadius();
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
      let categoryComponent = categorylist.value.find(
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

      let localcategory = findCategoryByName(categoryName);
      if (localcategory == null) return;

      Annotations.create({
        image_id: image.value.id,
        category_id: localcategory.id,
        segmentation: segments,
        keypoints: keypoints,
        isbbox: isbbox,
      }).then((response) => {
        let localannotation = response.data;
        localcategory.annotations.push(localannotation);
      });
};

const updateAnnotationCategory = (newAnnotation, oldCategory, newCategoryName) => {
  const newCategory = findCategoryByName(newCategoryName);

  if (!newCategory || !annotation.value) return;

  Annotations.update(newAnnotation.id, { category_id: newCategory.id }).then(
    (response) => {
      let newAnnotation = {
        ...response.data,
        ...newAnnotation,
        metadata: response.data.metadata,
        category_id: newCategory.id
      };
      if (newAnnotation) {
        oldCategory.annotations = oldCategory.annotations.filter(
          (a) => a.id !== newAnnotation.id
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
    console.log('currentAnnotationLength computed');
  if (currentCategoryFromList.value == null) return null;
  return currentCategoryFromList.value.category.annotations.length;
});

const currentKeypointLength = computed(() => {
   console.log('currentKeypointLength computed');

  if (currentAnnotationFromList.value == null) return null;
  return currentAnnotationFromList.value.annotation.keypoints.length;
});


const user = computed(() => {
  // return store.getters['user/user'];
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
      if (newCategory != null) {
        if (
          currentAnnotationFromList.value == null ||
          !newCategory.showAnnotations
        ) {
          let element = newCategory.$el;
          scrollElement(element);
        }
      }
});

watch(
  () => currentAnnotationFromList.value, 
  (newElement) => {
      updateKeypointPanel.value = updateKeypointPanel.value + 1;
      if (newElement != null) {
        if (newElement.showAnnotations) {
          let element = newElement.$el;
          scrollElement(element);
        }
      }
});

watch(
  () => current.value.category, 
  (cc) => {
      if (cc < -1) current.value.category = -1;
      let max = categories.value.length;
      if (cc > max) {
        current.value.category = -1;
      }
});

watch(
  () => current.value.annotation, 
  (ca) => {
      if (ca < -1) current.value.annotation = -1;
      if (currentCategoryFromList.value != null) {
        let max = currentAnnotationLength.value;
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
      let max = currentAnnotationLength.value;
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
        let found = annotating.value.indexOf(data.username);
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
      // this.$socket.emit("annotating", {
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


    // setDataset(null);
    // store.commit('setDataset', null);
    procStore.setDataset(null);

    initCanvas();
    getData();

    console.log('socket:', socket, getCurrentInstance());
    // const instance = getCurrentInstance();
    // socket.io.emit("annotating", {image_id: image.value.id, active: true });
    socket.emit("annotating", {image_id: image.value.id, active: true });
    getCurrentInstance().ctx.sockets.subscribe('annotating', onAnnotating);
    
    // app.__vue_app__._instance.ctx.sockets.subscribe('annotating', onAnnotating);
    // app.__vue_app__.config.globalProperties.$socket.emit("annotating", {image_id: image.value.id, active: true });

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

defineExpose({simplify, dataset, bbox, select, category});




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
