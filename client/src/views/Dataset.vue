<template>
  <div @mousemove="mouseMove">
    <div style="padding-top: 55px" />

    <div
      class="bg-light"
      :style="{ 'margin-left': sidebar.width + 'px' }"
    >
      <nav
        class="nav border-bottom shadow-sm"
        style="background-color: #4b5162"
      >
        <a
          class="btn tab"
          :style="{ color: tab == 'images' ? 'white' : 'darkgray' }"
          @click="tab = 'images'"
        >
          <i
            class="fa fa-picture-o"
            aria-hidden="true"
          /> Images
        </a>
        <a
          class="btn tab"
          :style="{ color: tab == 'exports' ? 'white' : 'darkgray' }"
          @click="tab = 'exports'"
        >
          <i
            class="fa fa-share"
            aria-hidden="true"
          /> Exports
        </a>
        <a
          class="btn tab"
          :style="{ color: tab == 'members' ? 'white' : 'darkgray' }"
          @click="tab = 'members'"
        >
          <i
            class="fa fa-users"
            aria-hidden="true"
          /> Members
        </a>
        <a
          class="btn tab"
          :style="{ color: tab == 'statistics' ? 'white' : 'darkgray' }"
          @click="tab = 'statistics'"
        >
          <i
            class="fa fa-bar-chart"
            aria-hidden="true"
          /> Statistics
        </a>
        <a
          class="btn tab"
          :style="{ color: tab == 'settings' ? 'white' : 'darkgray' }"
          @click="tab = 'settings'"
        >
          <i
            class="fa fa-cog"
            aria-hidden="true"
          /> Settings
        </a>
      </nav>

      <div
        class="bg-light text-left"
        style="overflow: auto; height: calc(100vh - 100px); margin: 10px"
      >
        <div
          v-show="tab == 'images'"
          class="container"
        >
          <ol class="breadcrumb">
            <li class="breadcrumb-item" />
            <li class="breadcrumb-item active">
              <button
                class="btn btn-sm btn-link"
                @click="folders = []"
              >
                {{ dataset.name }}
              </button>
            </li>
            <li
              v-for="(folder, folderId) in folders"
              :key="folderId"
              class="breadcrumb-item"
            >
              <button
                class="btn btn-sm btn-link"
                :disabled="folders[folders.length - 1] === folder"
                @click="removeFolder(folder)"
              >
                {{ folder }}
              </button>
            </li>
          </ol>

          <p
            v-if="images.length < 1"
            class="text-center"
          >
            No images found in directory.
          </p>
          <div v-else>
            <Pagination
              v-model:page="page"
              :pages="pages"
              @pagechange="updatePage"
            />
            <div class="row">
              <ImageCard
                v-for="image in images"
                :key="image.id"
                :image="image"
                @update-page="updatePage"
              />
            </div>
            <Pagination
              v-model:page="page"
              :pages="pages"
              @pagechange="updatePage"
            />
          </div>
        </div>
        <div
          v-show="tab == 'exports'"
          class="container"
        >
          <div class="card my-3 p-3 shadow-sm mr-2">
            <h6 class="border-bottom border-gray pb-2">
              <b>Exports</b>
            </h6>

            <div
              v-for="exp in datasetExports"
              :key="exp.id"
              class="media text-muted pt-3"
            >
              <div class="media-body lh-125 border-bottom border-gray">
                {{ exp.id }}. Exported
                {{ exp.ago.length > 0 ? exp.ago : 0 + " seconds" }} ago
                <div style="display: inline">
                  <span
                    v-for="(tag, index) in exp.tags"
                    :key="index"
                    class="badge badge-secondary"
                    style="margin: 1px"
                  >
                    {{ tag }}
                  </span>
                </div>
                <button
                  class="btn btn-sm btn-success"
                  style="float: right; margin: 2px; padding: 2px"
                  @click="downloadExport(exp.id)"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-show="tab == 'members'"
          class="container"
        >
          <div class="card my-3 p-3 shadow-sm mr-2">
            <h6 class="border-bottom border-gray pb-2">
              <b>Invite Members</b>
            </h6>
          </div>

          <div class="card my-3 p-3 shadow-sm mr-2">
            <h6 class="border-bottom border-gray pb-2">
              <b>Existing Members</b>
            </h6>

            <div
              v-for="(user, index) in users"
              :key="index"
              class="media text-muted pt-3"
            >
              <img
                src="https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/256x256/plain/user.png"
                class="mr-2 rounded"
                style="width: 32px; height: 32px"
              >
              <div
                class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray"
              >
                <div
                  class="d-flex justify-content-between align-items-center w-100"
                >
                  <div class="text-gray-dark">
                    <strong>{{ user.name }}</strong> @{{ user.username }}
                  </div>
                  <a href="#">{{ user.group }}</a>
                </div>
                <span class="d-block">Last seen:
                  {{
                    new Date(user.last_seen["$date"])
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " ")
                  }}
                  UTC</span>
              </div>
            </div>
          </div>
        </div>
        <div
          v-show="tab == 'statistics'"
          class="container"
        >
          <div v-if="stats == null">
            Crunching numbers...
          </div>

          <div v-else>
            <div class="row">
              <div
                v-if="stats.total"
                class="card my-3 p-3 shadow-sm col-3 mr-2"
              >
                <h6 class="border-bottom border-gray pb-2">
                  <b>Total</b>
                </h6>
                <div
                  v-for="(stat, index) in Object.keys(stats.total)"
                  :key="index"
                  class="row"
                >
                  <strong class="col-8">{{ stat }}:</strong>
                  <span class="col-4">{{ stats.total[stat].toFixed(0) }}</span>
                </div>
              </div>

              <div
                v-if="stats.average"
                class="card my-3 p-3 shadow-sm col-4 mr-2"
              >
                <h6 class="border-bottom border-gray pb-2">
                  <b>Average</b>
                </h6>
                <div
                  v-for="(stat, index) in Object.keys(stats.average)"
                  :key="index"
                  class="row"
                >
                  <strong class="col-8">{{ stat }}:</strong>
                  <span class="col-4">{{
                    stats.average[stat].toFixed(0)
                  }}</span>
                </div>
              </div>

              <div
                v-if="stats.categories"
                class="card my-3 p-3 shadow-sm col-4 mr-2"
              >
                <h6 class="border-bottom border-gray pb-2">
                  <b>Annotations Per Category</b>
                </h6>
                <div
                  v-for="(stat, index) in Object.keys(stats.categories)"
                  :key="index"
                  class="row"
                >
                  <strong class="col-8">{{ stat }}:</strong>
                  <span class="col-4">{{
                    stats.categories[stat].toFixed(0)
                  }}</span>
                </div>
              </div>

              <div
                v-if="stats.images_per_category"
                class="card my-3 p-3 shadow-sm col-4 mr-2"
              >
                <h6 class="border-bottom border-gray pb-2">
                  <b>Annotated Images Per Category</b>
                </h6>
                <div
                  v-for="(stat, index) in Object.keys(
                    stats.images_per_category
                  )"
                  :key="index"
                  class="row"
                >
                  <strong class="col-8">{{ stat }}:</strong>
                  <span class="col-4">{{
                    stats.images_per_category[stat].toFixed(0)
                  }}</span>
                </div>
              </div>

              <div
                v-if="stats.users"
                class="card my-3 p-3 shadow-sm col-6 mr-2"
              >
                <h6 class="border-bottom border-gray pb-2">
                  <b>Annotations per User</b>
                </h6>
                <h6 class="row border-bottom border-gray pb-2">
                  <span class="col-4">Username</span>
                  <span class="col-4">Annotations</span>
                  <span class="col-4">Images</span>
                </h6>
                <div
                  v-for="(stat, index) in Object.keys(stats.users)"
                  :key="index"
                  class="row"
                >
                  <strong class="col-4">{{ stat }}:</strong>
                  <span class="col-4">{{
                    stats.users[stat]["annotations"].toFixed(0)
                  }}</span>
                  <span class="col-4">{{
                    stats.users[stat]["images"].toFixed(0)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-show="tab == 'settings'"
          class="container"
        >
          <div class="card my-3 p-3 shadow-sm mr-2">
            <h6 class="border-bottom border-gray pb-2">
              <b>Metadata</b>
            </h6>

            <button
              class="btn btn-sm btn-block btn-danger"
              @click="resetMetadata"
            >
              Rest All Metadata
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      id="filter"
      ref="sidebar"
      class="sidebar"
      :style="{ width: sidebar.width + 'px' }"
    >
      <div style="padding-top: 10px" />
      <h3>{{ dataset.name }}</h3>
      <p
        class="text-center"
        style="color: lightgray"
      >
        Total of <strong style="color: white">{{ imageCount }}</strong> images
        displayed on <strong style="color: white">{{ pages }}</strong> pages.
      </p>
      <div class="row justify-content-md-center sidebar-section-buttons">
        <button
          type="button"
          class="btn btn-success btn-block"
          data-bs-toggle="modal"
          data-bs-target="#generateDataset"
        >
          <div
            v-if="generate.id != null"
            class="progress"
          >
            <div
              class="progress-bar bg-success"
              :style="{ width: `${generate.progress}%` }"
            >
              Generating
            </div>
          </div>
          <div v-else>
            Generate
          </div>
        </button>

        <button
          type="button"
          class="btn btn-secondary btn-block"
          @click="createScanTask"
        >
          <div
            v-if="scan.id != null"
            class="progress"
          >
            <div
              class="progress-bar bg-secondary"
              :style="{ width: `${scan.progress}%` }"
            >
              Scanning
            </div>
          </div>
          <div v-else>
            Scan
          </div>
        </button>

        <button
          type="button"
          class="btn btn-primary btn-block"
          @click="importModal"
        >
          <div
            v-if="importing.id != null"
            class="progress"
          >
            <div
              class="progress-bar bg-primary"
              :style="{ width: `${importing.progress}%` }"
            >
              Importing
            </div>
          </div>
          <div v-else>
            Import COCO
          </div>
        </button>

        <button
          type="button"
          class="btn btn-dark btn-block"
          @click="exportModal"
        >
          <div
            v-if="exporting.id != null"
            class="progress"
          >
            <div
              class="progress-bar bg-dark"
              :style="{ width: `${exporting.progress}%` }"
            >
              Exporting
            </div>
          </div>
          <div v-else>
            Export COCO
          </div>
        </button>
      </div>
      <hr>
      <h6 class="sidebar-title text-center">
        Subdirectories
      </h6>
      <div
        class="sidebar-section"
        style="max-height: 30%; color: lightgray"
      >
        <div v-if="subdirectories.length > 0">
          <button
            v-for="(subdirectory, subId) in subdirectories"
            :key="subId"
            class="btn badge badge-pill badge-primary category-badge"
            style="margin: 2px"
            @click="folders.push(subdirectory)"
          >
            {{ subdirectory }}
          </button>
        </div>
        <p
          v-else
          style="margin: 0; font-size: 13px; color: gray"
        >
          No subdirectory found.
        </p>
      </div>
      <hr>
      <h6 class="sidebar-title text-center">
        Filtering Options
      </h6>
      <div
        class="sidebar-section"
        style="max-height: 30%; color: lightgray"
      >
        <PanelString
          v-model:input-string="query.file_name__icontains"
          name="Contains"
          @submit="updatePage"
        />
        <PanelToggle
          v-model:show-text="panel.showAnnotated"
          name="Show Annotated"
        />
        <PanelToggle
          v-model:show-text="panel.showNotAnnotated"
          name="Show Not Annotated"
        />
        <PanelDropdown
          v-model:value="order"
          name="Order"
          :values="orderTypes"
          @update-order="updateOrder"
        />
      </div>
      <div
        class="sidebar-section"
        style="max-height: 30%; color: lightgray"
      >
        <div class="form-group">
          <label>Show Annotated Categories</label>
          <TagsInput
            v-model:selectedItems="selected.categories"
            element-id="selectedCategories"
            title="Only shows images annotated with the selected categories for 'Show Annotated' button. Leave empty to show all annotated images."
            :existing-tags="categoryTags"
            :typeahead="true"
            :typeahead-activation-threshold="0"
          />
        </div>
      </div>
    </div>

    <div
      id="generateDataset"
      class="modal fade"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              Generate a Dataset
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
                <label>Keyword</label>
                <input
                  v-model="keyword"
                  class="form-control"
                >
              </div>
              <div class="form-group">
                <label>Limit</label>
                <input
                  v-model="generateLimit"
                  class="form-control"
                  type="number"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              @click="generateDataset"
            >
              Generate
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

    <div
      id="cocoUpload"
      class="modal fade"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              Upload COCO Annotaitons
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
                <label for="coco">COCO Annotation file (.json)</label>
                <input
                  id="coco"
                  type="file"
                  class="form-control-file"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="importCOCO"
            >
              Upload
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

    <div
      id="exportDataset"
      class="modal fade"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              Export {{ dataset.name }}
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
                <label>Categories (Empty export all)</label>
                <TagsInput
                  v-model:selectedItems="exporting.categories"
                  element-id="exportCategories"
                  :existing-tags="categoryTags"
                  :typeahead="true"
                  :typeahead-activation-threshold="0"
                />
              </div>
              <div>
                <input
                  v-model="exporting.with_empty_images"
                  type="checkbox"
                  class="form-check-input"
                >
                <label class="form-check-label">export with not annotated images</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              @click="exportCOCO"
            >
              Export
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
import Dataset from "@/models/datasets";
import Export from "@/models/exports";
import ImageCard from "@/components/cards/ImageCard";
import Pagination from "@/components/Pagination";
import PanelString from "@/components/PanelInputString";
import PanelToggle from "@/components/PanelToggle";
import PanelDropdown from "@/components/PanelInputDropdown";
import TagsInput from "@/components/TagsInput";

import { Modal } from "bootstrap";

import { getCurrentInstance, ref, computed, watch, inject, onUnmounted, onMounted, provide } from 'vue';

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

import useAxiosRequest from "@/composables/axiosRequest";
const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();

import { onBeforeRouteUpdate, useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

const props = defineProps({
  identifier: {
    type: [Number, String],
    required: true
  }
});


// modals
let cocoImportModal = null;
let cocoExportModal = null;

const identifier = ref(props.identifier);
const page = ref(1);
const pages = ref(1);
const generateLimit = ref(100);
const limit = ref(52);
const imageCount = ref(0);
const categories = ref([]);
const images = ref([]);
const folders = ref([]);
const dataset = ref({
      id: 0
});
const users = ref([]);
const subdirectories = ref([]);
const status = ref({
      data: { state: true, message: "Loading data" }
});
const keyword = ref("");
const mouseDown = ref(false);
const sidebar = ref({
      drag: false,
      width: window.innerWidth * 0.2,
      canResize: false
});

const scan = ref({
  progress: 0,
  id: null
});

const generate = ref({
  progress: 0,
  id: null
});

const importing = ref({
  progress: 0,
  id: null
});

const exporting = ref({
  categories: [],
  progress: 0,
  with_empty_images: false,
  id: null
});
const selected = ref({
  categories: []
});
const datasetExports = ref([]);
const tab = ref("images");
const order = ref("file_name");

const orderTypes = ref({
  file_name: "File Name",
  id: "Id",
  path: "File Path"
});

const query = ref({
  file_name__icontains: "",
  ...route.query
});

const panel = ref({
  showAnnotated: true,
  showNotAnnotated: true
});
const stats = ref(null);

const updateOrder = (newOrder) => {
  order.value = newOrder;
};

const generateDataset = () => {
  if (keyword.value.length === 0) return;
  Dataset.generate(dataset.value.id, {
    keywords: [keyword.value],
    limit: generateLimit.value
  });
};

const updatePage = (page) => {
  let process = "Loading images from dataset";
  procStore.addProcess(process);
  
  console.log('queryannotated:', queryAnnotated);
  Dataset.getData(dataset.value.id, {
    page: page,
    limit: limit.value,
    folder: folders.value.join("/"),
    ...query.value,
    annotated: queryAnnotated.value,
    category_ids__in: encodeURI(selected.value.categories),
    order: order.value
  })
    .then(response => {
      let data = response.data;
      images.value = data.images;
      dataset.value = data.dataset;
      categories.value = data.categories;
      imageCount.value = data.total;
      pages.value = data.pages;
      subdirectories.value = data.subdirectories;
    })
    .catch(error => {
      axiosReqestError("Loading Dataset", error.response.data.message);
    })
    .finally(() => {
              procStore.removeProcess(process);
    });
}

const getUsers = () => {
  Dataset.getUsers(dataset.value.id).then(response => {
    users.value = response.data;
  });
};

const downloadExport = (id) => {
  Export.download(id, dataset.value.name);
};

const getExports = () => {
  Dataset.getExports(dataset.value.id).then(response => {
    datasetExports.value = response.data;
  });
};

const resetMetadata = () => {
    let r = confirm(
            "You can not undo reseting of all metadata in" +    
            "this dataset. This includes metadata of images" +
            "and annotations."
     );
     if (r) { 
         Dataset.resetMetadata(dataset.value.id); 
     }
};

const getStats = () => {
      Dataset.getStats(dataset.value.id)
      .then(response => {
        stats.value = response.data;
      });
};
    
const createScanTask = () => {
      let process = "Loading images from dataset";
      console.log("scanning...");
      if (scan.value.id != null) {
        router.push({ path: "/tasks", query: { id: scan.value.id } });
        return;
      }
      Dataset.scan(dataset.value.id)
        .then(response => {
          let id = response.data.id;
          scan.value.id = id;
        })
        .catch(error => {
          axiosReqestError(
            "Scanning Dataset",
            error.response.data.message
          );
        })
        .finally(() => {
            procStore.removeProcess(process);
        });
};

const exportModal = () => {
  console.log('exportModal invoked...:',exporting);
  if (exporting.value.id !== null) {
    router.push({ path: "/tasks", query: { id: exporting.value.id } });
    return;
  }
  // $("#exportDataset").modal("show");
  cocoExportModal.show();
};

const exportCOCO = () => {
  // $("#exportDataset").modal("hide");
  cocoExportModal.hide();
  let process = "Loading images from dataset";

  Dataset.exportingCOCO(
    dataset.value.id,
    exporting.value.categories,
    exporting.value.with_empty_images
  )
    .then((response) => {
      let id = response.data.id;
      exporting.value.id = id;
    })
    .catch(error => {
      axiosReqestError("Exporting COCO", error.response.data.message);
    })
    .finally(() => {
        procStore.removeProcess(process);
    });
};

const removeFolder = (folder) => {
  let index = folders.value.indexOf(folder);
  folders.value.splice(index + 1, folders.value.length);
};

const importModal = () => {
  console.log('importing:', importing);
  if (importing.value.id != null) {
    router.push({ path: "/tasks", query: { id: importing.value.id } });
    return;
  }
  
  // $("#cocoUpload").modal("show");
  cocoImportModal.show();
};

const importCOCO = () => {
  let process = "Loading images from dataset";
  const uploaded = document.getElementById("coco");
  Dataset.uploadCoco(dataset.value.id, uploaded.files[0])
    .then(response => {
      const id = response.data.id;
      importing.value.id = id;
    })
    .catch(error => {
      axiosReqestError("Importing COCO", error.response.data.message);
    })
    .finally(() => {
        procStore.removeProcess(process);
    });
};

const mouseMove = (event) => {
      let element = document.querySelector('.sidebar');
      let sidebarWidth = element.offsetWidth;
      let clickWidth = event.x;
      let pixelsFromSide = Math.abs(sidebarWidth - clickWidth);      
      sidebar.value.drag = pixelsFromSide < 4;
      if (sidebar.value.canResize) {
        event.preventDefault();
        let max = window.innerWidth * 0.5;
        sidebar.value.width = Math.min(Math.max(event.x, 150), max);
        localStorage.setItem("dataset/sideWidth", sidebar.value.width);
      }
};

const startDrag = () => {
      mouseDown.value = true;
      sidebar.value.canResize = sidebar.value.drag;
};

const stopDrag = () => {
      mouseDown.value = false;
      sidebar.value.canResize = false;
};

const queryAnnotated = computed(() => {
  let showAnnotated = panel.value.showAnnotated;
  let showNotAnnotated = panel.value.showNotAnnotated;
  if (showAnnotated && showNotAnnotated) return null;
  if (!showAnnotated && !showNotAnnotated) return " ";
  return showAnnotated;
});

const categoryTags = computed(() => {
  let tags = {};
  categories.value.forEach(c => tags[c.id] = c.name);
  return tags;
});

// socket
const onTaskProgress = (data) => {
  if (data.id === scan.value.id) {
    scan.value.progress = data.progress;
  }
  if (data.id === generate.value.id) {
    generate.value.progress = data.progress;
  }
  if (data.id === importing.value.id) {
    importing.value.progress = data.progress;
  }
  if (data.id === exporting.value.id) {
    exporting.value.progress = data.progress;
  }
};

// socket
const onAnnotating = (data) => {
      const image = images.value.find(i => i.id == data.image_id);
      if (image == null) return;
      if (data.active) {
        const found = image.annotating.indexOf(data.username);
        if (found < 0) {
          image.annotating.push(data.username);
        }
      } else {
        image.annotating.splice(image.annotating.indexOf(data.username), 1);
      }
};


watch(
    () => tab.value,
    (newtab) => {
      console.log('tab changed...:', newtab);
      localStorage.setItem('dataset/tab', newtab);
      if (newtab === 'members') getUsers();
      if (newtab === 'statistics') getStats();
      if (newtab === 'exports') getExports();
    }
);

watch(
    () => order.value,
    (neworder) => {
      localStorage.setItem('dataset/order', neworder);
      updatePage();
    }
);

watch(
    () => queryAnnotated.value,
    () => updatePage()
);

  
watch(
    () => selected.value.categories,
    (val) => { 
        console.log('selected categories :', val);
        updatePage();
    },
      {deep: true},
);

watch(
    () => folders.value,
    () => updatePage()
);

watch(
    () => sidebar.value.drag,
    (canDrag) => {
      const el = document.querySelector('.sidebar');
      if (canDrag) {
        document.body.style.cursor = 'ew-resize';
        el.style.borderRight = '4px solid #383c4a';
      } else {
        document.body.style.cursor = 'default';
        el.style.borderRight = '';
      }
    }
);

watch(
  () => scan.value.progress,
  (scanProgress) => {
        if (scanProgress >= 100) {
            setTimeout(() => {
              scan.value.progress = 0;
              scan.value.id = null;
            }, 1000);
          }
    }
);

watch(
  () => importing.value.progress,
  (importingProgress) => {
    if (importingProgress >= 100) {
        setTimeout(() => {
            importing.value.progress = 0;
            importing.value.id = null;
        }, 1000);
    }
  }
);

watch(
  () => exporting.value.progress,
  (exportingProgress) => {
    if (exportingProgress >= 100) {
        setTimeout(() => {
            exporting.value.progress = 0;
            exporting.value.id = null;
            getExports();
        }, 1000);
    }
  }
);


onBeforeRouteUpdate ((to, from, next) => {
    dataset.value.id = parseInt(identifier.value);
    updatePage();
});


onMounted(() => {
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('mousedown', startDrag);

      let ltab = localStorage.getItem("dataset/tab");
      let lorder = localStorage.getItem("dataset/order");
      let sideWidth = localStorage.getItem("dataset/sideWidth");
      
      if (sideWidth !== null) sidebar.value.width = parseInt(sideWidth);
      if (ltab !== null) tab.value = ltab;
      if (lorder !== null) order.value = lorder;
      dataset.value.id = parseInt(identifier.value);
      updatePage();
      
      const importTag = document.getElementById("cocoUpload");
      cocoImportModal = new Modal(importTag, { });

      const exportTag = document.getElementById("exportDataset");
      cocoExportModal = new Modal(exportTag, { });
    
      // app.__vue_app__._instance.ctx.sockets.subscribe('taskProgress', onTaskProgress);
      // app.__vue_app__._instance.ctx.sockets.subscribe('annotating', onAnnotating);
      
      getCurrentInstance().ctx.sockets.subscribe('taskProgress', onTaskProgress);
      getCurrentInstance().ctx.sockets.subscribe('annotating', onAnnotating);

});

onUnmounted(() => {
      // app.__vue_app__._instance.ctx.sockets.unsubscribe('taskProgress');
      // app.__vue_app__._instance.ctx.sockets.unsubscribe('annotating');
      getCurrentInstance().ctx.sockets.unsubscribe('taskProgress');
      getCurrentInstance().ctx.sockets.unsubscribe('annotating');

      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('mousedown', startDrag);
});

</script>

<style scoped>
.breadcrumb {
  padding: 0px;
  margin: 5px 0;
}

.btn-link {
  padding: 0px;
}

.sidebar .title {
  color: white;
}

.progress {
  padding: 2px;
  height: 24px;
}

.sidebar {
  height: 100%;
  position: fixed;
  color: white;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #4b5162;
  overflow-x: hidden;
  padding-top: 60px;
}

.sidebar .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

.sidebar-title {
  color: white;
}

.sidebar-section-buttons {
  margin: 5px;
}

.sidebar-section {
  margin: 5px;
  border-radius: 5px;
  background-color: #383c4a;
  padding: 0 5px 2px 5px;
  overflow: auto;
}
</style>
