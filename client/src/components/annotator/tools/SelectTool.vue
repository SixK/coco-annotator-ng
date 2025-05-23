<template>
  <div>
    <i v-tooltip.right="tooltip" class="fa fa-x" :class="icon" :style="{ color: iconColor }" @click="click" />
    <br>
  </div>
</template>

<script setup>
import paper from "paper";
import { useTools } from "@/composables/toolBar/tools";

import { useProcStore } from "@/store/index";
const procStore = useProcStore();
import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();

import { nextTick, ref, computed, watch, inject, onMounted, provide } from 'vue'

const getPaper = inject('getPaper');
const localPaper = ref(getPaper());

const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

const scale = defineModel('scale', { type: Number, default: 1 });
const categories = defineModel('categories', { type: Array, required: true });

name.value = "Select";
name.cursor = "pointer";
cursor.value = "pointer";
const icon = ref("fa-hand-pointer-o");
// const movePath = ref(false);
const point = ref(null);
const segment = ref(null);
const initPoint = ref(null);
const isBbox = ref(false);
const moveObject = ref(null);
const scaleFactor = 15;
const edit = ref({
  indicatorWidth: 0,
  indicatorSize: 0,
  center: null,
  canMove: false,
});
const hover = ref({
  showText: true,
  text: null,
  textId: -1,
  box: null,
  textShift: 0,
  fontSize: scaleFactor,
  shift: 0,
  rounded: 0,
  category: null,
  annotation: null,
  annotationText: null,
});
const keypoint = ref(null)
const hitOptions = ref({
  segments: true,
  stroke: true,
  fill: false,
  tolerance: 10,
  match: (hit) => {
    return !hit.item.hasOwnProperty("indicator")
  },
});

watch(
  () => keypoint.value, 
  (newKeypoint) => {
        clear();
        if (!newKeypoint) return;
        hoverText();
    }
);

watch(
  () => scale.value, 
  (newScale) => {
      hover.value.rounded = newScale * 5;
      hover.value.textShift = newScale * 40;
      hover.value.fontSize = newScale * scaleFactor;
      edit.value.distance = newScale * 40;
      edit.value.indicatorSize = newScale * 10;
      edit.value.indicatorWidth = newScale * 2;
      if (edit.value.center && point.value != null) {
        createPoint(edit.value.center);
      }
      if (hover.value.text != null) {
        hover.value.text.fontSize = hover.value.fontSize;
        hover.value.shift =
          (hover.value.text.bounds.bottomRight.x -
            hover.value.text.bounds.bottomLeft.x) /
          2;
        let totalShift = hover.value.shift + hover.value.textShift;
        hover.value.text.position = hover.value.position.add(totalShift, 0);
        hover.value.box.bounds = hover.value.text.bounds;
  }
}, { immediate: true });

watch(
  () => state.isActive, 
  (active) => {
      if (!active) {
        if (hover.value.text) {
          hover.value.text.remove();
          hover.value.box.remove();
          hover.value.box = null;
          hover.value.text = null;
        }
        
        if (point.value) {
          point.value.remove();
          point.value = null;
          segment.value = null;
        }
        if (hover.value.annotation && hover.value.annotation.compoundPath) {
          hover.value.annotation.compoundPath.selected = false;
        }
      }
});


const exportSelect = () => {
    return {
      showText: hover.value.showText
    }
};

const setPreferences = (pref) => {
    hover.value.showText = pref.showText || hover.value.showText;
};

const generateTitle = () => {
  let string = " ";
  if (keypoint.value) {
    const index = keypoint.value.keypoint.indexLabel;
    const label = keypoint.value.keypoints.labels[index - 1];
    const visibility = keypoint.value.keypoint.visibility;
    const visibilityDesc = keypoint.value.keypoint.getVisibilityDescription();
    const annotationId = keypoint.value.keypoints.annotationId;
    const categoryName = keypoint.value.keypoints.categoryName;
    string += "Keypoint: " + label + " \n";
    string += "Visibility: " + visibility + " (" + visibilityDesc + ") \n";
    if (annotationId !== -1) {
      string += "ID: " + annotationId + " \n";
    }
    if (categoryName) {
      string += "Category: " + categoryName + " \n";
    }
    return string.replace(/\n/g, " \n ").slice(0, -2);
  }
  if (hover.value.category && hover.value.annotation) {
    const id = hover.value.textId;
    const localcategory = hover.value.category.name;
    string += "ID: " + id + " \n";
    string += "Category: " + localcategory + " \n";
  }
  if (authStore.loginEnabled()) {
    const creator = hover.value.annotation.creator;
    if (creator != null) {
      string += "Created by " + creator + "\n\n";
    }
  }
  
  return string.replace(/\n/g, " \n ").slice(0, -2) + " \n ";
};


const generateStringFromMetadata = () => {
  if (keypoint.value) return "";
  let string = "";
  
  let metadata = hover.value.annotation.metadata;
  if ( metadata == null || Object.keys(metadata).length === 0) {
    string += "No Metadata \n";
  } else {
    string += "Metadata \n";
    
    for (const [key, value] of Object.entries(metadata)) {
        string += " " + key + " = " + value + " \n";
    }    
  }
  return string.replace(/\n/g, " \n ").slice(0, -2);
};


const hoverText = () => {
      if (!hover.value.showText) return;
      if (!keypoint.value) {
        if (hover.value.category == null) return;
        if (hover.value.annotation == null) return;
      }

      const position = hover.value.position.add(hover.value.textShift, 0);

      if (
        hover.value.text == null ||
        hover.value.annotation.id !== hover.value.textId ||
        keypoint.value != null
      ) {
            if (hover.value.text !== null) {
              hover.value.text.remove();
              hover.value.box.remove();
            }
            
            if (hover.value.annotation) {
              hover.value.textId = hover.value.annotation.id;
            }
            const content = generateTitle() + generateStringFromMetadata();

            hover.value.text = new paper.PointText(position);
            hover.value.text.justification = "left";
            hover.value.text.fillColor = "black";
            hover.value.text.content = content;
            hover.value.text.indicator = true;

            hover.value.text.fontSize = hover.value.fontSize;

            hover.value.box = new paper.Path.Rectangle(
              hover.value.text.bounds,
              hover.value.rounded
            );
            hover.value.box.indicator = true;
            hover.value.box.fillColor = "white";
            hover.value.box.strokeColor = "white";
            hover.value.box.opacity = 0.5;

            hover.value.box.insertAbove(null);
            // hover.value.box.insertAbove(rect);
      }

      hover.value.shift =
        (hover.value.text.bounds.bottomRight.x -
          hover.value.text.bounds.bottomLeft.x) /  2;
      hover.value.box.position = position.add(hover.value.shift, 0);
      hover.value.text.position = position.add(hover.value.shift, 0);

      hover.value.box.bringToFront();
      hover.value.text.bringToFront();
};

const checkBbox = (paperObject) => {
  if (!paperObject) return false;
  const annotationId = paperObject.data.annotationId;

  if(paperObject.data.categoryId===null) return false;
  const categoryId = paperObject.data.categoryId;  

  const category = categories.value[categoryId];
  if (category == null) return false;
  const annotation = category.annotations[annotationId];
  if (annotation == null) return false;
  
  return annotation.isbbox;
};


const onMouseDown = (event) => {   
  const hitResult = localPaper.value.project.hitTest(
    event.point,
    hitOptions.value
  );

  if (!hitResult) return;
  
  if (event.modifiers.shift) {
    if (hitResult.type === 'segment') {
      hitResult.segment.remove();
    }
    return;
  }

  const path = hitResult.item;
  let paperObject = null;
  if (hitResult.type === 'segment') {
    segment.value = hitResult.segment;
    paperObject = path.parent;
    // added createPoint here, cause something is weird about point
    createPoint(event.point);
  } else if (hitResult.type === 'stroke') {
    const location = hitResult.location;
    segment.value = path.insert(location.index + 1, event.point);
  } else if (event.item.className == 'CompoundPath') {
    initPoint.value = event.point;
    moveObject.value = event.item;
    paperObject = event.item;
  }
  isBbox.value = checkBbox(paperObject);

  if (point.value != null) {
    edit.value.canMove = point.value.contains(event.point);
  } else {
    edit.value.canMove = false;
  }
};

function clear() {
      hover.value.category = null;
      hover.value.annotation = null;
      isBbox.value = false;
      segment.value = null;
      moveObject.value = null;
      if (hover.value.text != null) {
        hover.value.text.remove();
        hover.value.box.remove();
        hover.value.text = null;
        hover.value.box = null;
      }
}
    
function createPoint(currpoint) {
      if (point.value != null) {
        point.value.remove();
      }
      point.value = new paper.Path.Circle(currpoint, edit.value.indicatorSize);
      point.value.strokeColor = "black";
      point.value.strokeWidth = edit.value.indicatorWidth;
      point.value.indicator = true;
}


const onMouseDrag = (event) => {
  if (isBbox.value && moveObject.value) {
    const delta_x = initPoint.value.x - event.point.x;
    const delta_y = initPoint.value.y - event.point.y;
    const segments = moveObject.value.children[0].segments;
    segments.forEach((msegment) => {
      const p = msegment.point;
      msegment.point = new paper.Point(p.x - delta_x, p.y - delta_y);
    });
    initPoint.value = event.point;
  }

  if (segment.value && edit.value.canMove) {
    createPoint(event.point);
    if (isBbox.value) {
      const isCounterClock =
        segment.value.previous.point.x == segment.value.point.x;
      const prev = isCounterClock ? segment.value.previous : segment.value.next;
      const next = !isCounterClock ? segment.value.previous : segment.value.next;
      prev.point = new paper.Point(event.point.x, prev.point.y);
      next.point = new paper.Point(next.point.x, event.point.y);
    }
    segment.value.point = event.point;
  } else if (!keypoint.value && initPoint.value) {
        const delta_x = initPoint.value.x - event.point.x;
        const delta_y = initPoint.value.y - event.point.y;
        const center_delta = new paper.Point(delta_x, delta_y);
        const new_center = localPaper.value.view.center.add(center_delta);
        localPaper.value.view.setCenter(new_center);
  }
};

const onMouseUp = (event) => {
      clear();
};

const onMouseMove = (event) => {
      initPoint.value = event.point;
      const hitResult = localPaper.value.project.hitTest(
        event.point,
        hitOptions.value
      );

      if (hitResult) {
        let hitpoint = null;
        if (hitResult.type === "segment") {
          hitpoint = hitResult.segment.location.point;
        } else if (hitResult.type === "stroke") {
          hitpoint = hitResult.location.point;
        }
        if (hitpoint != null) {
          edit.value.center = hitpoint;
          createPoint(hitpoint);
        } else {
          if (point.value != null) {
            point.value.remove();
            point.value = null;
          }
        }
      }

      localPaper.value.project.activeLayer.selected = false;
      const item = event.item;

      keypoint.value = null;

      if (
        item &&
        item.data.hasOwnProperty("annotationId") &&
        item.data.hasOwnProperty("categoryId")
      ) {
        hover.value.position = event.point;

        const categoryId = event.item.data.categoryId;
        const annotationId = event.item.data.annotationId;

        hover.value.category = categories.value[categoryId];
        if (hover.value.category != null) {
          hover.value.annotation = hover.value.category.annotations[annotationId];
          event.item.selected = true;
          hoverText();
        }
      } else if (event.item && event.item.hasOwnProperty("keypoint")) {
        hover.value.position = event.point;
        keypoint.value = item;
      } else if (
        item &&
        item.lastChild &&
        item.lastChild.hasOwnProperty("keypoint")
      ) {
        hover.value.position = event.point;
        for (const child of item.children) {
            if (child.hasOwnProperty("keypoint")) {
                const childKeypoint = child.keypoint;
                if (event.point.getDistance(childKeypoint) <= childKeypoint.radius) {
                    keypoint.value = child;
                    break;
                }
            }
        }
      } else {
        clear();
      }
};

onMounted(() => {
    // state.tool.minDistance = polygon.value.minDistance;
    state.tool.onMouseDown = onMouseDown;
    state.tool.onMouseDrag = onMouseDrag;
    state.tool.onMouseMove = onMouseMove;
    state.tool.onMouseUp = onMouseUp;

    state.tool.activate();
})

defineExpose({exportSelect, setPreferences, name, hover, click});

</script>
