<template>
  <div>
    <i v-tooltip.right="tooltip" class='fa fa-x' :class="icon" :style="{ color: iconColor }" @click="click"></i>
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

const getAnnotationFromIndex = inject('getAnnotationFromIndex', () => {});
const getCategoryByIndex = inject('getCategoryByIndex');
const getCategory = inject('getCategory');
const getHover = inject('getHover');
const getPaper = inject('getPaper');

const {
    click,
    state,
    iconColor,
    tooltip,
    name,
    cursor
  }= useTools();

const scale = defineModel('scale', { type: Number, default: 1 });

name.value = "Select";
name.cursor = "pointer";
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

const localHover = ref(getHover());
const localPaper = ref(getPaper());

watch(
  () => keypoint.value, 
  (newKeypoint) => {
        console.log('keypoint watched !');
        clear();
        if (!newKeypoint) return;
        hoverText();
    }
);

watch(
  () => scale.value, 
  (newScale) => {
      console.log('scaling');
      hover.value.rounded = newScale * 5;
      hover.value.textShift = newScale * 40;
      hover.value.fontSize = newScale * scaleFactor;
      edit.value.distance = newScale * 40;
      edit.value.indicatorSize = newScale * 10;
      edit.value.indicatorWidth = newScale * 2;
      console.log('scale:', edit.value.center, point);
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
        
        console.log('watch active point:', point);
        if (point.value) {
          point.value.remove();
          point.value = null;
          segment.value = null;
        }
        if (hover.value.annotation) {
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
    let index = keypoint.value.keypoint.indexLabel;
    let label = keypoint.value.keypoints.labels[index - 1];
    let visibility = keypoint.value.keypoint.visibility;
    let visibilityDesc = keypoint.value.keypoint.getVisibilityDescription();
    let annotationId = keypoint.value.keypoints.annotationId;
    let categoryName = keypoint.value.keypoints.categoryName;
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
    let id = hover.value.textId;
    let localcategory = hover.value.category.category.name;
    string += "ID: " + id + " \n";
    string += "Category: " + localcategory + " \n";
  }
  // if (store.getters["user/loginEnabled"]) {
  if (authStore.loginEnabled()) {
    let creator = hover.value.annotation.annotation.creator;
    if (creator != null) {
      string += "Created by " + creator + "\n\n";
    }
  }
  
  return string.replace(/\n/g, " \n ").slice(0, -2) + " \n ";
};


const generateStringFromMetadata = () => {
  if (keypoint.value) return "";
  let string = "";
  
  ////////////// may not work here $refs ????
  let metadata = hover.value.annotation.$refs?.metadata?.metadataList;
  if ( metadata == null || metadata.length === 0) {
    string += "No Metadata \n";
  } else {
    string += "Metadata \n";
    metadata.forEach((element) => {
      if (element.key.length !== 0) {
        string += " " + element.key + " = " + element.value + " \n";
      }
    });
  }
  return string.replace(/\n/g, " \n ").slice(0, -2);
};


const hoverText = () => {
      if (!hover.value.showText) return;
      if (!keypoint.value) {
        if (hover.value.category == null) return;
        if (hover.value.annotation == null) return;
      }

      let position = hover.value.position.add(hover.value.textShift, 0);


      if (
        hover.value.text == null ||
        hover.value.annotation.annotation.id !== hover.value.textId ||
        keypoint.value != null
      ) {
            if (hover.value.text !== null) {
              hover.value.text.remove();
              hover.value.box.remove();
            }
            
            if (hover.value.annotation) {
              hover.value.textId = hover.value.annotation.annotation.id;
            }
            let content = generateTitle() + generateStringFromMetadata();

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
  let annotationId = paperObject.data.annotationId;
  
  if(!paperObject.data.categoryId) return false;
  let categoryId = paperObject.data.categoryId;  
  
  let category = getCategoryByIndex(categoryId);
   if (category == null) return false;
  let annotation = category.getAnnotationFromIndex(annotationId);
  // let annotation = category.category.annotations[annotationId];
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
    console.log('Create Point');
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
    console.log('isBbox and moveObject');
    let delta_x = initPoint.value.x - event.point.x;
    let delta_y = initPoint.value.y - event.point.y;
    let segments = moveObject.value.children[0].segments;
    segments.forEach((msegment) => {
      let p = msegment.point;
      msegment.point = new paper.Point(p.x - delta_x, p.y - delta_y);
    });
    initPoint.value = event.point;
  }

  if (segment.value && edit.value.canMove) {
    createPoint(event.point);
    if (isBbox.value) {
      let isCounterClock =
        segment.value.previous.point.x == segment.value.point.x;
      let prev = isCounterClock ? segment.value.previous : segment.value.next;
      let next = !isCounterClock ? segment.value.previous : segment.value.next;
      prev.point = new paper.Point(event.point.x, prev.point.y);
      next.point = new paper.Point(next.point.x, event.point.y);
    }
    segment.value.point = event.point;
  } else if (!keypoint.value && initPoint.value) {
        let delta_x = initPoint.value.x - event.point.x;
        let delta_y = initPoint.value.y - event.point.y;
        let center_delta = new paper.Point(delta_x, delta_y);
        let new_center = localPaper.value.view.center.add(center_delta);
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

      localHover.value.annotation = -1;
      localHover.value.category = -1;

      localPaper.value.project.activeLayer.selected = false;
      let item = event.item;

      keypoint.value = null;

      if (
        item &&
        item.data.hasOwnProperty("annotationId") &&
        item.data.hasOwnProperty("categoryId")
      ) {
        hover.value.position = event.point;

        let categoryId = event.item.data.categoryId;
        let annotationId = event.item.data.annotationId;

        localHover.value.category = categoryId;
        localHover.value.annotation = annotationId;

        // hover.value.category = $parent.getCategory(categoryId);
        hover.value.category = getCategoryByIndex(categoryId);
        if (hover.value.category != null) {
          hover.value.annotation =
            hover.value.category.getAnnotationFromIndex(annotationId);
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
        for (let i = 0; i < item.children.length; ++i) {
          if (item.children[i].hasOwnProperty("keypoint")) {
            let childkeypoint = item.children[i].keypoint;
            if (event.point.getDistance(childkeypoint) <= childkeypoint.radius) {
              keypoint.value = item.children[i];
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
})

defineExpose({exportSelect, setPreferences, name, hover, click});

</script>
