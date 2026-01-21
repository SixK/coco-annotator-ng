<template>
  <div>
    <i
      class="fa fa-plus"
      style="float: right; margin: 0 4px; color: green"
      @click="createKeypoints"
    />

    <p
      class="title"
      style="margin: 0"
    >
      {{ title }}
    </p>

    <div class="row">
      <div class="col-sm-5">
        <p class="subtitle">
          {{ keyTitle }}:
        </p>
      </div>
      <div class="col-sm-7">
        <p class="subtitle">
          {{ valueTitle }}:
        </p>
      </div>
    </div>

    <form>
      <ul
        class="list-group"
        style="height: 50%"
      >
        <li
          v-if="keypoints.length == 0"
          class="list-group-item keypoint-item"
        >
          <i class="subtitle">No keypoints.</i>
        </li>
        <li
          v-for="(object, index) in keypoints"
          :key="index"
          class="list-group-item keypoint-item"
        >
          <div
            class="row form-group"
            style="cell"
          >
            <!-- :class="{'was-validated': object.label_error.length === 0 }" -->
            <div
              class="col-sm-5"
              style="padding-right: 5px"
            >
              <input
                :value="object.label"
                type="text"
                class="keypoint-input form-control"
                :class="{ 'is-invalid': object.label_error.length !== 0 }"
                :required="object.edges.length !== 0"
                :placeholder="keyTitle"
                @change="keypointLabelUpdated(index, $event.target.value)"
              >
              <div class="invalid-feedback">
                {{ object.label_error }}
              </div>
            </div>

            <div class="col-sm-1 keypoint-color">
              <!-- <input v-model="object.color" type="color" class="form-control" /> -->
              <input
                :value="getColor(index)"
                type="color"
                class="form-control"
                @input="colorUpdated(index, $event.target.value)"
              >
            </div>

            <div
              class="col-sm-6"
              style="padding-left: 5px"
            >
              <TagsInput
                :selectedItems="object.edges"
                :value="object.edges"
                placeholder="Add connected label"
                class="keypoint-input"
                :element-id="`index${index}`"
                :existing-tags="otherKeypointLabels(object.label)"
                :only-existing-tags="true"
                :typeahead="true"
                :typeahead-activation-threshold="0"
                @selectedItems="keypointEdgesUpdated(index, $event)"
              />
            </div>
          </div>
        </li>
      </ul>
    </form>
  </div>
</template>

<script setup>
import TagsInput from '@/components/TagsInput.vue';
import { nextTick, toRef, ref, watchEffect, onMounted, computed, watch } from 'vue';


const DISTINCT_COLORS = [
  "#bf5c4d",
  "#d99100",
  "#4d8068",
  "#0d2b80",
  "#9c73bf",
  "#ff1a38",
  "#bf3300",
  "#736322",
  "#33fff1",
  "#3369ff",
  "#9d13bf",
  "#733941",
  "#ffb499",
  "#d0d957",
  "#0b5e73",
  "#0000ff",
  "#730b5e",
  "#ff8533",
  "#518c0e",
  "#82c7d9",
  "#0000d9",
  "#ff1ab3",
  "#733c17",
  "#7cff4d",
  "#1ab3ff",
  "#0000cc",
  "#cc0052",
  "#cc9c66",
  "#8ae6a2",
  "#335280",
  "#0000bf",
  "#e673a1"
];

const emit = defineEmits(['update:keypoints-def', 'initialized', 'input']);

const keypointsDef = defineModel('keypointsDef', { type: Object, required: true });
const title = defineModel('title', { type: String, default: "Keypoints" });
const keyTitle = defineModel('keyTitle', { type: String, default: "Label" });
const valueTitle = defineModel('valueTitle', { type: String, default: "Connects to" });
const exclude = defineModel('exclude', { type: String, default: "" });


const keypoints = ref([]);
const hiddenValue = ref({ edges: [], labels: [], colors: [] });
const isMounted = ref(false);
const nextDistinct = ref(-1);


const valid = computed(() => {
  if (!isMounted.value) {
    return false;
  }  
  return keypoints.value.every(({ label_error }) => label_error.length === 0);
});

watch(
      () => hiddenValue.value, 
      () => {
          if (hiddenValue.value !== keypointsDef.value) {
            hiddenValue.value = keypointsDef.value;
            nextTick(() => {
                keypoints.value = keypointsFromProp();
            });
          }
});


onMounted(() => {
      keypoints.value = keypointsFromProp();
      emit('initialized');
      isMounted.value = true;
});

const exportKeypoints = () => {
  const newKeypoints = [];

  for (let i = 0; i < keypointsDef.value.labels.length; ++i) {
    newKeypoints.push({
      label: keypointsDef.value.labels[i],
      edges: [],
      label_error: "",
      color: keypointsDef.value.colors[i],
    });
  }

  keypointsDef.value.edges.forEach((edge) => {
    const label0 = edge[0] - 1;
    const label1 = edge[0] - 1;
    newKeypoints[label0].edges.push(keypointsDef.value.labels[label1]);
    newKeypoints[label1].edges.push(keypointsDef.value.labels[label0]);
  });
  return newKeypoints;
};

const createKeypoints = () => {
    keypoints.value.push({
        label: "",
        label_error: "",
        edges: [],
        color: nextDistinctColor(),
    }); 
};

const keypointsFromProp = () => {
      const keypointsArr = [];
      
      if (
        keypointsDef.value != null &&
        keypointsDef.value.labels != null &&
        keypointsDef.value.labels.length
      ) {
        for (let i = 0; i < keypointsDef.value.labels.length; ++i) {
          const label = keypointsDef.value.labels[i];
          if (label.length > 0) {
            keypointsArr.push({
              label,
              label_error: "",
              edges: [],
              color: keypointsDef.value.colors[i] || "#000",
            });
          }
        }

        keypointsDef.value.edges.forEach((edge) => {
          const label0 = Math.max(0, edge[0] - 1);
          const label1 = Math.max(0, edge[1] - 1);

          if (label0 < keypointsArr.length && label1 < keypointsArr.length) {
            keypointsArr[label0].edges.push(keypointsDef.value.labels[label1]);
            keypointsArr[label1].edges.push(keypointsDef.value.labels[label0]);
          }
        });
      }
      return keypointsArr;
};

const getEdge = (index) => {
    return keypointsDef.value.edges[index];
}

const getColor = (index) => {
    return keypointsDef.value.colors[index];
}

const  colorUpdated = (index, color) => {
        keypoints.value[index].color = color;
        hiddenValue.value = propFomKeypoints();  
        emit('update:keypoints-def', hiddenValue.value);
};

const keypointLabelUpdated = (index, label) => {
      const current_kp = keypoints.value[index];
      const previous_label = current_kp.label;

      current_kp.label_error = "";
      if (label !== "") {
        for (let i = 0; i < keypoints.value.length; ++i) {
          if (i !== index) {
            const kp = keypoints.value[i];
            if (label === kp.label) {
              current_kp.label_error = "Duplicate keypoint label";
              kp.label_error = current_kp.label_error;
            } else if (
              previous_label === kp.label &&
              kp.label_error.length !== 0
            ) {
              kp.label_error = "";
            }
          }
        }
      } else if (current_kp.edges.length !== 0) {
        current_kp.label_error = "Label is required";
      }

      current_kp.label = label;
      if (current_kp.label_error === "") {
        if (label !== "") {
          for (let i = 0; i < keypoints.value.length; ++i) {
            if (i !== index) {
              const kp = keypoints.value[i];
              kp.edges = kp.edges.map((edge) => {
                return edge === previous_label ? label : edge;
              });
            }
          }
        }
        hiddenValue.value = propFomKeypoints();
        emit('update:keypoints-def', hiddenValue.value);
      } else if (label !== "") {
        for (let i = 0; i < keypoints.value.length; ++i) {
          if (i !== index) {
            const kp = keypoints.value[i];
            kp.edges = kp.edges.filter((edge) => {
              return edge != previous_label;
            });
          }
        }
      }
};

const keypointEdgesUpdated = (index, edges) => {
  const new_edges = new Set(edges);
  const current_kp = keypoints.value[index];

  keypoints.value.forEach((kp) => {
    if (kp.label !== current_kp.label) {
      const kp_edges = new Set(kp.edges);
      if (!new_edges.has(kp.label) && kp_edges.has(current_kp.label)) {
        kp_edges.delete(current_kp.label);
        kp.edges = Array.from(kp_edges);
      } else if (
        new_edges.has(kp.label) &&
        !kp_edges.has(current_kp.label)
      ) {
        kp_edges.add(current_kp.label);
        kp.edges = Array.from(kp_edges);
      }
      if (
        kp.edges.length === 0 &&
        kp.label.length === 0 &&
        kp.label_error
      ) {
        kp.label_error = "";
      }
    }
  });
  keypoints.value[index].edges = edges;
  hiddenValue.value = propFomKeypoints();
  emit('update:keypoints-def', hiddenValue.value);
};

const propFomKeypoints = () => {
  let edge_labels = {};
  let labels = [];
  let colors = [];
  keypoints.value.forEach (kp => {
    if (kp.label.length > 0) {
      labels.push(kp.label);
      colors.push(kp.color);
    }
  });
  keypoints.value.forEach (kp => {
    kp.edges.forEach( edge => {
      if (edge in edge_labels) {
        edge_labels[edge].add(kp.label);
      } else {
        edge_labels[kp.label] = edge_labels[kp.label] || new Set();
        edge_labels[kp.label].add(edge);
      }
    });
  });
  let edges = [];
  for (const label in edge_labels) {
    let label_index = labels.indexOf(label) + 1;
    edge_labels[label].forEach((edge) => {
      let edge_index = labels.indexOf(edge) + 1;
      edges.push([label_index, edge_index]);
    });
  }
  return { labels, edges, colors };
};

const otherKeypointLabels = (current_label) => {
  const labels = {};
  if (keypoints.value != null) {
    keypoints.value.forEach((keypoint) => {
      if (keypoint.label !== "" && keypoint.label !== current_label) {
        labels[keypoint.label] = keypoint.label;
      }
    });
  }
  return labels;
};

const clearKeypoints = (keypoints) => {
  keypoints.splice(0, keypoints.length);
};

const nextDistinctColor = () => {
  const nextDistinct = ref(0);
  nextDistinct.value++;
  return DISTINCT_COLORS[nextDistinct.value];
};

defineExpose({exportKeypoints, valid, keypoints});


</script>

<style scoped>
.keypoint-input {
  padding: 3px;
  background-color: inherit;
  width: 100%;
  height: 100%;
  border: none;
}

.keypoint-item {
  background-color: inherit;
  margin-bottom: -20px;
  border: none;
  padding-bottom: 0;
}

.keypoint-color {
  padding-left: 0;
  padding-right: 0;
  line-height: 1.25;
  height: 100%;
  padding-top: 15px;
  padding-bottom: 15px;
}

.keypoint-color input[type="color"] {
  padding: 4px;
}

.subtitle {
  margin: 0;
  font-size: 10px;
}
</style>
