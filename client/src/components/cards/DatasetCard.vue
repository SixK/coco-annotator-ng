<template>
  <div class="col-md-3">
    <!-- Dataset Card -->
    <div class="card mb-4 box-shadow">
      <!-- Display Image -->
      <img
        :src="imageUrl"
        class="card-img-top"
        style="width: 100%; display: block"
        @click="onImageClick"
        @error="imageError = true"
      >

      <!-- Card Body -->
      <div class="card-body">
        <span
          class="d-inline-block text-truncate"
          style="max-width: 85%; float: left"
        >
          <strong class="card-title">{{ dataset.name }}</strong>
        </span>

        <i
          :id="'dropdownDataset' + dataset.id"
          class="card-text fa fa-ellipsis-v fa-x icon-more"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-hidden="true"
        />

        <br>

        <div>
          <div v-if="dataset.numberImages > 0">
            {{ dataset.numberAnnotated }} of {{ dataset.numberImages }} images
            annotated.
            <div class="progress">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: percent + '%' }"
              />
            </div>
          </div>

          <p v-else>
            No images in dataset.
          </p>
          <span
            v-for="(category, index) in listCategories"
            :key="index"
            class="badge badge-pill badge-primary category-badge"
            :style="{ 'background-color': category.color }"
          >
            {{ category.name }}
          </span>
        </div>

        <div
          class="dropdown-menu"
          :aria-labelledby="'dropdownDataset' + dataset.id"
        >
          <button
            class="dropdown-item"
            data-bs-toggle="modal"
            :data-bs-target="'#datasetEdit' + dataset.id"
          >
            Edit
          </button>
          <button
            v-if="dataset.permissions.owner"
            class="dropdown-item"
            data-bs-toggle="modal"
            :data-bs-target="'#datasetShare' + dataset.id"
          >
            Share
          </button>
          <button
            v-show="dataset.permissions.download"
            class="dropdown-item"
            @click="onCocoDownloadClick"
          >
            Download COCO
          </button>
          <hr v-show="dataset.permissions.delete">
          <button
            v-show="dataset.permissions.delete"
            class="dropdown-item delete"
            @click="onDeleteClick"
          >
            Delete
          </button>
        </div>
      </div>

      <div
        v-show="authStore.loginEnabled()"
        class="card-footer text-muted"
      >
        Created by {{ dataset.owner }}
      </div>
    </div>

    <!-- Edit Dataset -->
    <div
      :id="'datasetEdit' + dataset.id"
      class="modal fade"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ dataset.name }}
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
                <label>Default Categories</label>
                <TagsInput
                  v-model:selectedCategories="selectedCategories"
                  element-id="changeDataset"
                  :existing-tags="categoryTags"
                  :typeahead="true"
                  :typeahead-activation-threshold="0"
                />
              </div>

              <MetaData
                ref="defaultAnnotation"
                :metadata="defaultMetadata"
                title="Default Annotation Metadata"
                key-name="Default Key"
                value-name="Default Value"
              />
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-success"
              data-bs-dismiss="modal"
              @click="onSave"
            >
              Save
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

    <!-- Share Dataset -->
    <div
      :id="'datasetShare' + dataset.id"
      class="modal fade"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ dataset.name }}
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
                <label>Users shared with</label>
                <TagsInput
                  v-model="sharedUsers"
                  element-id="usersList"
                  :existing-tags="users"
                  :typeahead="true"
                  :typeahead-activation-threshold="0"
                  placeholder="Add usernames"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-success"
              data-bs-dismiss="modal"
              @click="onShare"
            >
              Save
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
import axios from "axios";
import MetaData from "@/components/MetaData";
import TagsInput from "@/components/TagsInput";

import { ref, computed, inject, watch, onMounted, onBeforeMount } from "vue";
import { useRouter } from 'vue-router';

import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();
import { useProcStore } from "@/store/index";
const procStore = useProcStore();
import { useInfoStore } from "@/store/info";
const infoStore = useInfoStore();

const router = useRouter();
const emit = defineEmits(['updatePage']);

const getUsers = inject('getUsers');

const addProcess = (process) => procStore.addProcess(process);
const removeProcess = (process) => procStore.removeProcess(process);

const dataset = defineModel('dataset', { type: Object, required: true });
const categories = defineModel('categories', { type: Array, required: true });

/*
const props = defineProps({
  dataset: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
});
const dataset = ref(props.dataset);
const categories = ref(props.categories);
*/

const imageError = ref(false);
const selectedCategories = ref([]);
// const defaultMetadata = ref(props.dataset.default_annotation_metadata);
const defaultMetadata = ref(dataset.value.default_annotation_metadata);
// const noImageUrl = require("@/assets/no-image.png");
// const notFoundImageUrl = require("@/assets/404-image.png");
import noImageUrl from "@/assets/no-image.png";
import notFoundImageUrl from "@/assets/404-image.png";

const sharedUsers = ref([]);
const localUsers = ref([]);
const defaultAnnotation = ref(null);

watch(
  () => getUsers(),
  (value) => {
      localUsers.value=value;
  }
);


const onImageClick = () => {
  let identifier = dataset.value.id;
  router.push({ name: 'dataset', params: { identifier } });
};

const onShare = () => {
  dataset.value.users = sharedUsers;

  axios
    .post('/api/dataset/' + dataset.value.id + '/share', {
      users: sharedUsers.value,
    })
    .then(() => {
          emit('updatePage');

      // $parent.updatePage();
    });
};


const onCocoDownloadClick = () => {
  const process = `Generating COCO for ${dataset.value.name}`;
  addProcess(process);
  try {
    const response = axios.get(`/api/dataset/${dataset.value.id}/coco`);
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(response.data))}`;
    downloadURI(dataStr, `${dataset.value.name}.json`);
  } catch (error) {
    console.error(error);
  } finally {
    removeProcess(process);
  }
};

const onDeleteClick = () => {
  try {
    axios.delete(`/api/dataset/${dataset.value.id}`);
    // $parent.updatePage();
    emit('updatePage');
  } catch (error) {
    console.error(error);
  }
};

const onSave = () => {
  dataset.value.categories = selectedCategories.value;

  axios
    .post("/api/dataset/" + dataset.value.id, {
      categories: selectedCategories.value,
      default_annotation_metadata: defaultAnnotation.value.exportMetadata(),
    })
    .then(() => {
        emit('updatePage');
    });
};

const downloadURI = (uri, exportName) => {
  let link = document.createElement("a");
  link.href = uri;
  link.download = exportName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const createSelectedCategories = () => {
      listCategories.value.forEach((category) => {
        selectedCategories.value.push(category.name);
      });
};

const createSelectedUsers = () => {
      sharedUsers.value.users = dataset.value.users;
};

const percent = computed(() => {
  return 100 * (dataset.value.numberAnnotated / dataset.value.numberImages);
});

const imageUrl = computed(() => {
  if (imageError.value) {
    return notFoundImageUrl;
  }
  if (dataset.value.numberImages > 0) {
    return "/api/image/" + dataset.value.first_image_id + "?width=250";
  }
  return noImageUrl;
});

// const listCategories = computed(() => {
const listCategories = computed(() => {
  let list = [];
  console.log('listCategories 1: ', dataset.value.hasOwnProperty("categories"));
  if (!dataset.value.hasOwnProperty("categories")) return [];
  console.log('listCategories 2: ', dataset.value.categories.length);
  if (dataset.value.categories.length === 0) return [];
  
  console.log('listCategories 3: ', dataset.value.categories, categories);
  dataset.value.categories.forEach((category) => {
    let elements = categories.value.filter(
      // quick and dirty fix for categories initiated with id and returned by TagsInput as name
      // (element) => element.id === category
      (element) => element.id === category || element.name === category
    );
    if (elements.length === 1) {
      list.push(elements[0]);
    }
  });
  return list;
});

const categoryTags = computed(() => {
  let tags = {};
  categories.value.forEach((category) => {
    tags[category.name] = category.name;
  });
  return tags;
});

const users = computed(() => {
  let users = {};
  // this.$parent.users.forEach((user) => {
  localUsers.value.forEach((user) => {
    users[user.username] = user.username;
  });
  return users;
});

onBeforeMount(() => {
    createSelectedUsers();
    createSelectedCategories();

});


onMounted(() => {
  // createSelectedUsers();
   // createSelectedCategories();

});


</script>

<style scoped>
.card-img-overlay {
  padding: 0 10px 0 0;
}

.card-body {
  padding: 10px 10px 0 10px;
}

p {
  margin: 0;
  padding: 0 0 3px 0;
}

.category-badge {
  float: left;
  margin: 0 2px 5px 0;
}

.list-group-item {
  height: 21px;
  font-size: 13px;
  padding: 2px;
  background-color: #4b5162;
}
.icon-more {
  width: 10%;
  margin: 3px 0;
  padding: 0;
  float: right;
  color: black;
}

.progress {
  margin: 0 5px 7px 5px;
  height: 5px;
}
.card-footer {
  padding: 2px;
  font-size: 11px;
}

.delete {
  color: darkred;
}
</style>
