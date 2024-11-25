<template>
  <div
    v-show="showCategory"
    class="card"
    :style="{
      'background-color': backgroundColor,
      'border-color': borderColor
    }"
  >
    <div
      :id="'heading' + category.id"
      class="card-header"
    >
      <div :style="{ color: isVisible ? 'white' : 'gray' }">
        <div @click="onEyeClick">
          <i
            v-if="isVisible"
            class="fa fa-eye category-icon"
            :style="{ color: showAnnotations ? 'white' : color }"
            aria-hidden="true"
          />
          <i
            v-else
            class="fa fa-eye-slash category-icon"
            aria-hidden="true"
          />
        </div>

        <button
          class="btn btn-link btn-sm collapsed category-text"
          style="color: inherit"
          aria-expanded="false"
          :aria-controls="'collapse' + category.id"
          @click="onClick"
        >
          {{ category.name }} ({{ category.annotations.length }})
        </button>

        <i
          class="fa fa-gear category-icon"
          data-bs-toggle="modal"
          :data-bs-target="'#categorySettings' + category.id"
          style="float: right; color: white"
          aria-hidden="true"
        />

        <i
          class="fa fa-plus category-icon"
          style="float: right; color: white; padding-right: 0"
          aria-hidden="true"
          @click="createAnnotation"
        />
      </div>
    </div>

    <ul
      v-show="showAnnotations"
      ref="collapse"
      class="list-group"
    >
      <li
        v-show="category.annotations.length > 0"
        class="list-group-item btn btn-link btn-sm text-left"
        :style="{ 'background-color': backgroundColor, color: 'white' }"
      >
        <input
          v-model="search"
          class="annotation-search"
          placeholder="Search"
          :disabled="category.annotations.length < 2"
        >
      </li>

      <Annotation
        v-for="(annotation, listIndex) in category.annotations"
        :ref="setAnnotationRef"
        :key="annotation.id"
        :category="category"
        :search="search"
        :simplify="simplify"
        :annotation="annotation"
        :show-annotations="showAnnotations"
        :current="current.annotation"
        :opacity="opacity"
        :index="listIndex"
        :keypoint-edges="keypoint.edges"
        :keypoint-labels="keypoint.labels"
        :keypoint-colors="keypoint.colors"
        :hover="hover.annotation"
        :active-tool="activeTool"
        :scale="scale"
        :all-categories="getCategoriesList"
        :isHoverCategory="isHover"
        @click="onAnnotationClick(listIndex)"
        @keypoint-click="onKeypointClick(listIndex, $event)"
        @keypoints-complete="$emit('keypointsComplete')"
        @deleted="annotationDeleted(listIndex)"
        @set-color="setColor"
      />
    </ul>

    <div
      :id="'categorySettings' + category.id"
      ref="category_settings"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      @hidden="resetCategorySettings"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ category.name }}
            </h5>
            <button
              type="button"
              class="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label>Supercategory</label>
                <input
                  type="text"
                  class="form-control"
                  :value="supercategory"
                  @input="supercategory = $event.target.value"
                >
              </div>

              <div class="form-group row">
                <label class="col-sm-2 col-form-label">Color</label>
                <div class="col-sm-9">
                  <input
                    v-model="color"
                    type="color"
                    class="form-control"
                  >
                </div>
              </div>

              <div class="form-group">
                <KeypointsDefinition
                  ref="keypoints"
                  v-model:keypoints-def="keypoint"
                  element-id="keypointLabels"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-success"
              :disabled="!isFormValid"
              :class="{ disabled: !isFormValid }"
              data-bs-dismiss="modal"
              @click="onUpdateClick"
            >
              Update
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
import { Modal } from "bootstrap";

import Annotations from "@/models/annotations";
import Annotation from "@/components/annotator/Annotation";
import KeypointsDefinition from "@/components/KeypointsDefinition";

import { nextTick } from 'vue';

import { getCurrentInstance, provide, inject, watch, reactive, 
                 ref, computed, onMounted, onUnmounted, onUpdated,toRef, onBeforeUpdate } from 'vue';

const socket = inject('socket');

const emit = defineEmits(['click', 'keypointsComplete']);

const getImageId = inject('getImageId');
const scrollElement = inject('scrollElement');
const selectLastEditorTool = inject('selectLastEditorTool');

const category = defineModel('category', { type: Object, required: true });
const index = defineModel('index', { type: Number, required: true });
const current = defineModel('current', { type: Object, required: true });
const hover = defineModel('hover', { type: Object, required: true });
const opacity = defineModel('opacity', { type: Number, required: true });
const scale = defineModel('scale', { type: Number, default: 1 });
const categorysearch = defineModel('categorysearch', { type: String, required: true });
const simplify = defineModel('simplify', { type: Number, default: 1 });
const activeTool = defineModel('activeTool', { type: String, required: true });
const allCategories = defineModel('allCategories', { type: Array, required: true });


const group = ref(null);
const supercategory = ref(category.value.supercategory);
const color = ref(category.value.color);

const keypoint = toRef({
      labels: [...category.value.keypoint_labels],
      edges: [...category.value.keypoint_edges],
      colors: [...category.value.keypoint_colors],
});

const selectedAnnotation = ref(-1);
const showAnnotations = ref(false);
const isVisible = ref(false);
const search = ref("");
const isMounted = ref(false);

const keypoints = ref(null);
let categorySettingsModal = null;

const annotation = ref(null);
const annotationlist = ref([]);
const setAnnotationRef = el => {
      if (el) {
        annotationlist.value.push(el);
      }
}

const getShowAnnotations  = () => {
    return showAnnotations.value;
};


const getCategoryIndex  = () => {
    return index.value;
};


const showCategory = computed(() => {
  let search = categorysearch.value.toLowerCase();
  if (search.length === 0) return true;
  return category.value.name.toLowerCase().includes(search);
});

const getCategoriesList = computed(() => {
  return allCategories.value.map((category) => ({
    value: category.id,
    text: category.name,
  }));
});

const isCurrent = computed(() => {
  return current.value.category === index.value;
});

const isHover = computed(() => {
  return hover.value.category === index.value;
});

const backgroundColor = computed(() => {
  if (isHover.value && !showAnnotations.value) {
    return "#646c82";
  }
  return "inherit";
});

const borderColor = computed(() => {
  if (isCurrent.value) return "rgba(255, 255, 255, 0.25)";
  return "#404552";
});

const darkHSL = computed(() => {
  let localcolor = new paper.Color(color.value);
  let h = Math.round(localcolor.hue);
  let l = Math.round(localcolor.lightness * 50);
  let s = Math.round(localcolor.saturation * 100);
  return "hsl(" + h + "," + s + "%," + l + "%)";
});

const isFormValid = computed(() => {
  return (
    isMounted.value &&
    keypoints.value &&
    keypoints.value.valid
    // $refs &&
    // $refs.keypoints &&
    // $refs.keypoints.valid
  );
});

watch(
  () => color.value, 
  () => {
      setColor();
});

watch(
  () => opacity.value, 
  (newopacity) => {
      let annotations = annotationlist.value
      if (annotations.value == null) return;
      annotations.value.forEach((a) => (a.compoundPath.opacity = newopacity));
});

watch(
  () => isVisible.value, 
  (newVisible) => {
      let annotations = annotationlist.value
      if (annotations == null) return;

      annotations.forEach((a) => {
        a.keypoints.visible = newVisible;
        a.isVisible = newVisible;
      });
      setColor();
});

watch(
  () => showAnnotations.value, 
  (showing) => {
      if (!showing) {
        emit("click", {
          annotation: -1,
          keypoint: -1,
          category: index.value,
        });
      }
      setColor();
});

watch(
  category.value, 
  () => {
      initCategory();
});


const show = (index) => {
  if (search.value.length === 0) return true;
  return filterFound.value.indexOf(index) > -1;
};


const resetCategorySettings = () => {
  supercategory.value = category.value.supercategory;
  color.value = category.value.color;

  keypoint.value = {
    labels: [...category.value.keypoint_labels],
    edges: [...category.value.keypoint_edges],
    colors: [...category.value.keypoint_colors],
  };
};

const onUpdateClick = () => {
  console.log("onUpdateClick:", keypoint.value.labels, keypoint.value.edges, keypoint.value.colors);
  category.value.keypoint_labels = [...keypoint.value.labels];
  category.value.keypoint_edges = [...keypoint.value.edges];
  category.value.keypoint_colors = [...keypoint.value.colors];
  category.value.supercategory = supercategory.value;
};

const createAnnotation = () => {
      // let parent = $parent;
      let annotationId = category.value.annotations.length;
      Annotations.create({
        image_id: getImageId(),
        category_id: category.value.id,
      }).then((response) => {
        // workaround to access to $socket
        
        // app.__vue_app__.config.globalProperties.$socket.emit("annotation", {
       socket.io.emit("annotation", {
          action: "create",
          category_id: category.value.id,
          annotation: response.data
        });

        category.value.annotations.push(response.data);

        selectedAnnotation.value = annotationId;
        nextTick(() => {
          selectLastEditorTool();
          emit("click", {
            annotation: annotationId,
            category: index.value,
            keypoint: -1,
          });
        });

        isVisible.value = true;
        showAnnotations.value = true;

        let annotations = annotationlist.value;
        if (annotations == null) return;

        let tmp_annotation = annotations[annotationId - 1];
        
        if (tmp_annotation == null) {
          const element = document.getElementById(`heading' + category.id`);
          // scrollElement($el);
          scrollElement(element);
        } else {
          scrollElement(tmp_annotation.$el);
        }
      });
};

const exportCategory = () => {

    const categoryData = {
      // Category Identification
      id: category.value.id,
      name: category.value.name,
      // Show in side bar
      show: category.value.show,
      // Show groups on canvas
      visualize: isVisible.value,
      color: color.value,
      metadata: [],
      annotations: [],
      supercategory: category.value.supercategory,
      keypoint_labels: category.value.keypoint_labels,
      keypoint_edges: category.value.keypoint_edges,
      keypoint_colors: category.value.keypoint_colors,
    };


    if (annotationlist.value != null) {
      annotationlist.value.forEach((ann) => {
        categoryData.annotations.push(ann.exportAnnotation());
      });
    }


  return categoryData;
};

const addKeypointEdge = (edge) => {
  keypoint.value.edges.push(edge);
};

const removeKeypointEdge = (edge) => {
  let index = keypoint.value.edges.findIndex((e) => {
    let i1 = Math.min(edge[0], edge[1]) == Math.min(e[0], e[1]);
    let i2 = Math.max(edge[0], edge[1]) == Math.max(e[0], e[1]);
    return i1 && i2;
  });

  if (index !== -1) {
    const edge = keypoint.value.edges[index];
    keypoint.value.edges.splice(index, 1);
    const annotations = annotationlist.value;
    if (annotations) {
      annotations.forEach((a) => a.keypoints.removeLine(edge));
    }
  }
};

const onEyeClick = () => {
  isVisible.value = !isVisible.value;
  if (showAnnotations.value && !isVisible.value) {
    showAnnotations.value = false;
  }
  if (showAnnotations.value) {
    if (isCurrent.value) {
      emit('click', {
        annotation: selectedAnnotation.value,
        category: index.value,
        keypoint: -1,
      });
    }
  }
};

const onKeypointClick = (annotationIndex, keypointIndex) => {
  const indices = {
    annotation: annotationIndex,
    category: index.value,
    keypoint: keypointIndex,
  };
  selectedAnnotation.value = annotationIndex;
  showAnnotations.value = true;
  emit('click', indices);
}

const onAnnotationClick = (clicked_index) => {
  const indices = {
    annotation: clicked_index,
    category: index.value,
    keypoint: -1
  };

  selectedAnnotation.value = clicked_index;
  showAnnotations.value = true;
  emit('click', indices);
}

const onClick = () => {
      const indices = {
        annotation: selectedAnnotation.value,
        category: index.value,
        keypoint: -1
      };

      emit('click', indices);
      if (category.value.annotations.length === 0) return;
      showAnnotations.value = !showAnnotations.value;
      
      if (showAnnotations.value && !isVisible.value) {
        isVisible.value = true;
      }
};

const initCategory = () => {
      setColor();
};

const getAnnotation = (index) => {
      let ref = annotation.value;
      if (ref == null) return null;
      return annotation.value[index];
};

const getAnnotationFromIndex = (index) => {
      let ref = annotationlist.value;
      if (ref == null) return null;
      return annotationlist.value[index];
};


const setColor = () => {
    let annotations = annotationlist.value;
    if (annotations == null) return;
    if (!isVisible.value) return;

    if (showAnnotations.value) {
      annotations.forEach((a) => a.setColor());
    } else {
      annotations.forEach((a) => {
          if(a.compoundPath!=null) {
                a.compoundPath.fillColor = color.value;
                a.keypoints.color = darkHSL.value;
                a.keypoints.bringToFront();
            }
      });
    }
};

const annotationDeleted = (indexDeleted) => {
    if (selectedAnnotation.value >= indexDeleted) {
      selectedAnnotation.value--;
    }

    let indices = {
      annotation: selectedAnnotation.value,
      category: index.value,
      keypoint: -1,
    };
    // We delete here instead of deleting in annotation component
    // to avoid index desynchro - dunno how to handle better in vue3 ?
    category.value.annotations.splice(indexDeleted, 1);
    emit("click", indices);
    if (category.value.annotations.length === 0) isVisible.value = false;
};


// probably need to use something like $socket.on with vue3...
const onAnnotation = (data) => {
      let action = data.action;
      let annot = data.annotation;
      if (annot.image_id != getImageId()) return;
      if (annot.category_id != category.value.id) return;
      let found = category.value.annotations.findIndex(
        (a) => a.id == annot.id
      );

      if (found == -1) {
        if (action == "create") {
          // emit('annotation', annotation);
              category.value.annotations.push(annotation);
        }
      }
};


onBeforeUpdate(() => {
      annotationlist.value = [];
});

onMounted( () => {
    initCategory();
    // app.__vue_app__.config.globalProperties.$socket.on('annotation', onAnnotation);
     // app.__vue_app__._instance.ctx.sockets.subscribe('annotation', onAnnotation);
     getCurrentInstance().ctx.sockets.subscribe('annotation', onAnnotation);
     isMounted.value = true;
    let categoryTag = document.getElementById(`categorySettings${category.value.id}`);
    console.log('CategoryTag:', categoryTag);
    categorySettingsModal = new Modal(categoryTag, { });
});

onUnmounted(() => {
    // app.__vue_app__.config.globalProperties.$socket.off('annotation', onAnnotation);
    // app.__vue_app__._instance.ctx.sockets.unsubscribe('annotation');
    getCurrentInstance().ctx.sockets.unsubscribe('annotation');

    categorySettingsModal.hide();
});
    

defineExpose({category, setColor, getAnnotation, getAnnotationFromIndex,
                              showAnnotations, exportCategory, 
                              createAnnotation, selectedAnnotation,
                              isVisible,  isHover, color, supercategory, search,
                              isCurrent, addKeypointEdge, removeKeypointEdge,
                              index, name});

provide('addKeypointEdge', addKeypointEdge);
provide('removeKeypointEdge', removeKeypointEdge);
provide('isCurrent', isCurrent);
provide('getCategoryIndex', getCategoryIndex);
provide('resetCategorySettings', resetCategorySettings);
provide('getShowAnnotations', getShowAnnotations);
provide('getAnnotationFromIndex', getAnnotationFromIndex);

</script>

<style scoped>
.list-group-item {
  height: 22px;
  font-size: 13px;
  padding: 2px;
  background-color: #4b5162;
}

.category-icon {
  display: block;
  float: left;
  margin: 0;
  padding: 5px 10px 5px 10px;
}

.btn-link {
  margin: 0;
  padding: 0;
}
.annotation-icon {
  margin: 0;
  padding: 3px;
}

.card-header {
  display: block;
  margin: 0;
  padding: 0;
}

.card {
  background-color: #404552;
}

.annotation-search {
  width: 100%;
  height: 18px;
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  text-align: center;
  border-radius: 4px;
}

::-webkit-input-placeholder {
  /* WebKit, Blink, Edge */
  color: lightgray;
}
:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: lightgray;
  opacity: 1;
}
::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: lightgray;
  opacity: 1;
}
:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: lightgray;
}
::-ms-input-placeholder {
  /* Microsoft Edge */
  color: lightgray;
}
::placeholder {
  /* Most modern browsers support this now. */
  color: lightgray;
}
</style>
