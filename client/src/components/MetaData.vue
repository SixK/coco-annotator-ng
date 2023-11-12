<template>
  <div>
    <i
      class="fa fa-plus"
      style="float: right; margin: 0 4px; color: green"
      @click="createMetadata"
    />

    <p
      class="title"
      style="margin: 0"
    >
      {{ title }}
    </p>

    <div class="row">
      <div class="col-sm">
        <p class="subtitle">
          {{ keyTitle }}
        </p>
      </div>
      <div class="col-sm">
        <p class="subtitle">
          {{ valueTitle }}
        </p>
      </div>
    </div>

    <ul
      class="list-group"
      style="height: 50%"
    >
      <li
        v-if="metadataList.length == 0"
        class="list-group-item meta-item"
      >
        <i class="subtitle">No items in metadata.</i>
      </li>
      <li
        v-for="(object, index) in metadataList"
        :key="index"
        class="list-group-item meta-item"
      >
        <div
          class="row"
          style="cell"
        >
          <div class="col-sm">
            <input
              v-model="object.key"
              type="text"
              class="meta-input"
              :placeholder="keyTitle"
            >
          </div>

          <div class="col-sm">
            <input
              v-model="object.value"
              type="text"
              class="meta-input"
              :placeholder="valueTitle"
            >
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>

import { ref, watchEffect, onMounted } from 'vue';

const props = defineProps({
  metadata: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: "Metadata",
  },
  keyTitle: {
    type: String,
    default: "Keys",
  },
  valueTitle: {
    type: String,
    default: "Values",
  },
  exclude: {
    type: String,
    default: "",
  },
});

const metadataList = ref([]);
// const metadata = ref([]);
const metadata = ref(props.metadata);

watchEffect(() => {
    loadMetadata();
});


onMounted(() => {
    // loadMetadata();
});

const exportMetadata = () => {
  let new_metadata = {};
  metadataList.value.forEach((object) => {
    console.log('each metadata list:',object);

    if (object.key.length > 0) {
      if (!isNaN(object.value))
        new_metadata[object.key] = parseInt(object.value);
      else if (
        object.value.toLowerCase() === "true" ||
        object.value.toLowerCase() === "false"
      )
        new_metadata[object.key] = object.value.toLowerCase() === "true";
      else new_metadata[object.key] = object.value;
    }
  });

  return new_metadata;
};

const createMetadata = () => {
  metadataList.value.push({ key: "", value: "" });
};

function loadMetadata() {
    if (props.metadata != null && props.metadata['metadata'] == null) {
      for (let key in props.metadata) {
        if (!Object.prototype.hasOwnProperty.call(props.metadata, key)) {
          continue;
        }
        if (key === props.exclude) continue;
        let value = props.metadata[key];
        if (value == null) value = '';
        else value = value.toString();
        metadataList.value.push({ key: key, value: value });
      }
    }
};

defineExpose({exportMetadata, metadataList});

</script>

<style scoped>
.meta-input {
  padding: 3px;
  background-color: inherit;
  width: 100%;
  height: 100%;
  border: none;
}

.meta-item {
  padding: 3px;
  background-color: inherit;
  height: 40px;
  border: none;
}

.subtitle {
  margin: 0;
  font-size: 10px;
}
</style>
