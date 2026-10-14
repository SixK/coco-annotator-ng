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
        :scale="scale"
        :all-categories="getCategoriesList"
        :isHoverCategory="isHover"
        @click="onAnnotationClick(listIndex)"
        @keypoint-click="onKeypointClick(listIndex, $event)"
        @keypoints-complete="$emit('keypointsComplete')"
        @deleted="annotationDeleted(listIndex)"
        @patch-annotation="onAnnotationPatch(listIndex, $event)"
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
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              {{ category.name }}
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

import { useToolStore } from '@/store/toolStore';
import Annotations from "@/models/annotations";
import Annotation from "@/components/annotator/Annotation";
import KeypointsDefinition from "@/components/KeypointsDefinition";

import { nextTick } from 'vue';

import { getCurrentInstance, provide, inject, watch,  
                 ref, computed, onMounted, onUnmounted, toRef, onBeforeUpdate, useTemplateRef } from 'vue';

const socket = inject('socket');

const emit = defineEmits(['click', 'keypointsComplete', 'patch-category', 'patch-annotation', 'add-annotation', 'remove-annotation']);

// const { getImageId, scrollToElement, selectLastEditorTool } = inject('annotator');
const { getImageId, scrollToElement } = inject('annotator');
const toolStore = useToolStore();


const {
  category,
  index,
  current,
  hover,
  opacity,
  scale,
  categorysearch,
  simplify,
  allCategories,
} = defineProps({
  category: { type: Object, required: true },
  index: { type: Number, required: true },
  current: { type: Object, required: true },
  hover: { type: Object, required: true },
  opacity: { type: Number, required: true },
  scale: { type: Number, default: 1 },
  categorysearch: { type: String, required: true },
  simplify: { type: Number, default: 1 },
  allCategories: { type: Array, required: true },
});


const group = ref(null);
const supercategory = ref(category.supercategory);
const color = ref(category.color);

const keypoint = toRef({
      labels: [...category.keypoint_labels],
      edges: [...category.keypoint_edges],
      colors: [...category.keypoint_colors],
});

const selectedAnnotation = ref(-1);
const showAnnotations = ref(false);
const isVisible = ref(false);
const search = ref("");
const isMounted = ref(false);

const keypoints = useTemplateRef('keypoints');
let categorySettingsModal = null;

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
    return index;
};


const showCategory = computed(() => {
  const search = categorysearch.toLowerCase();
  if (search.length === 0) return true;
  return category.name.toLowerCase().includes(search);
});

const getCategoriesList = computed(() => {
  return allCategories.map((category) => ({
    value: category.id,
    text: category.name,
  }));
});

const categoryIsCurrent = computed(() => {
  return current.category === index;
});

const isHover = computed(() => {
  return hover.category === index;
});

const backgroundColor = computed(() => {
  if (isHover.value && !showAnnotations.value) {
    return "#646c82";
  }
  return "inherit";
});

const borderColor = computed(() => {
  if (categoryIsCurrent.value) return "rgba(255, 255, 255, 0.25)";
  return "#404552";
});

const darkHSL = computed(() => {
  const localcolor = new paper.Color(color.value);
  const h = Math.round(localcolor.hue);
  const l = Math.round(localcolor.lightness * 50);
  const s = Math.round(localcolor.saturation * 100);
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
  color, 
  () => {
      setColor();
});

watch(
  isVisible, 
  (newVisible) => {
      const annotations = annotationlist.value
      if (annotations == null) return;

      annotations.forEach((a) => {
        a.keypoints.visible = newVisible;
        a.isVisible = newVisible;
      });
      setColor();
});

watch(
  showAnnotations, 
  (showing) => {
      if (!showing) {
        emit("click", {
          annotation: -1,
          keypoint: -1,
          category: index,
        });
      }
      setColor();
});

// Was `watch(category.value, …)`: the source object was captured once at setup,
// so replacing the whole category never re-bound it. Watching the model ref with
// `{ deep: true }` keeps the original deep triggering *and* follows swaps.
watch(
  () => category,
  () => {
      initCategory();
  },
  { deep: true }
);

/*
watch(
  category, 
  () => {
      initCategory();
});
*/

const show = (index) => {
  if (search.value.length === 0) return true;
  return filterFound.value.indexOf(index) > -1;
};


const resetCategorySettings = () => {
  supercategory.value = category.supercategory;
  color.value = category.color;

  keypoint.value = {
    labels: [...category.keypoint_labels],
    edges: [...category.keypoint_edges],
    colors: [...category.keypoint_colors],
  };
};

const onUpdateClick = () => {
  emit('patch-category', index, {
    keypoint_labels: [...keypoint.value.labels],
    keypoint_edges: [...keypoint.value.edges],
    keypoint_colors: [...keypoint.value.colors],
    supercategory: supercategory.value,
  });
};

const createAnnotation = () => {
      const annotationId = category.annotations.length;
      Annotations.create({
        image_id: getImageId(),
        category_id: category.id,
      }).then((response) => {
       socket.io.emit("annotation", {
          action: "create",
          category_id: category.id,
          annotation: response.data
        });

        category.annotations.push(response.data);

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

const addKeypointEdge = (edge) => {
  keypoint.value.edges.push(edge);
};

const removeKeypointEdge = (edge) => {
  const index = keypoint.value.edges.findIndex((e) => {
    const i1 = Math.min(edge[0], edge[1]) == Math.min(e[0], e[1]);
    const i2 = Math.max(edge[0], edge[1]) == Math.max(e[0], e[1]);
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
    if (categoryIsCurrent.value) {
      emit('click', {
        annotation: selectedAnnotation.value,
        category: index,
        keypoint: -1,
      });
    }
  }
};

const onKeypointClick = (annotationIndex, keypointIndex) => {
  const indices = {
    annotation: annotationIndex,
    category: index,
    keypoint: keypointIndex,
  };
  selectedAnnotation.value = annotationIndex;
  showAnnotations.value = true;
  emit('click', indices);
}

const onAnnotationClick = (clicked_index) => {
  const indices = {
    annotation: clicked_index,
    category: index,
    keypoint: -1
  };

  selectedAnnotation.value = clicked_index;
  showAnnotations.value = true;
  emit('click', indices);
}

const onClick = () => {
      const indices = {
        annotation: selectedAnnotation.value,
        category: index,
        keypoint: -1
      };

      emit('click', indices);
      if (category.annotations.length === 0) return;
      showAnnotations.value = !showAnnotations.value;
      
      if (showAnnotations.value && !isVisible.value) {
        isVisible.value = true;
      }
};

const initCategory = () => {
      setColor();
};

const getAnnotationFromIndex = (index) => {
      const ref = annotationlist.value;
      if (ref == null) return null;
      return annotationlist.value[index];
};


const setColor = () => {
    const annotations = annotationlist.value;
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

    const indices = {
      annotation: selectedAnnotation.value,
      category: index,
      keypoint: -1,
    };
    emit('remove-annotation', index, indexDeleted);
    emit("click", indices);
    if (category.annotations.length === 0) isVisible.value = false;
};

const onAnnotationPatch = (annIndex, patch) => {
  emit('patch-annotation', index, annIndex, patch);
};


// probably need to use something like $socket.on with vue3...
const onAnnotation = (data) => {
      const action = data.action;
      const annot = data.annotation;
      if (annot.image_id != getImageId()) return;
      if (annot.category_id != category.id) return;
      const found = category.annotations.findIndex(
        (a) => a.id == annot.id
      );

      if (found == -1) {
        if (action == "create") {
          emit('add-annotation', index, annot);
        }
      }
};


onBeforeUpdate(() => {
      annotationlist.value = [];
});

onMounted( () => {
    initCategory();
    getCurrentInstance().ctx.sockets.subscribe('annotation', onAnnotation);
    isMounted.value = true;
    const categoryTag = document.getElementById(`categorySettings${category.id}`);
    categorySettingsModal = new Modal(categoryTag, { });
});

onUnmounted(() => {
    getCurrentInstance().ctx.sockets.unsubscribe('annotation');

    categorySettingsModal.hide();
});
    

defineExpose({category, setColor, getAnnotationFromIndex,
                              showAnnotations, exportCategory, 
                              createAnnotation, selectedAnnotation,
                              isVisible,  isHover, color, supercategory, search,
                              categoryIsCurrent, addKeypointEdge, removeKeypointEdge,
                              index, name});

const ctx = { addKeypointEdge, removeKeypointEdge, categoryIsCurrent, getCategoryIndex,
                         resetCategorySettings, getShowAnnotations, getAnnotationFromIndex };
provide('category', ctx);

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

::placeholder {
  /* Most modern browsers support this now. */
  color: lightgray;
}
</style>
