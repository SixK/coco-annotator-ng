<template>
  <div>
    <div style="padding-top: 55px" />

    <div
      class="album py-5 bg-light"
      style="overflow: auto; height: calc(100vh - 55px)"
    >
      <div class="container">
        <h2 class="text-center">
          Datasets
          <i
            class="fa fa-question-circle help-icon"
            data-bs-toggle="modal"
            data-bs-target="#helpDataset"
            aria-hidden="true"
          />
        </h2>

        <p class="text-center">
          Loaded <strong>{{ datasets.length }}</strong> datasets.
        </p>

        <div class="row justify-content-md-center">
          <div
            class="col-md-auto btn-group"
            role="group"
            style="padding-bottom: 20px"
          >
            <button
              type="button"
              class="btn btn-success"
              data-bs-toggle="modal"
              data-bs-target="#createDataset"
            >
              Create
            </button>
            <button
              type="button"
              class="btn btn-primary"
            >
              Import
            </button>
            <button
              type=" button"
              class="btn btn-secondary"
              @click="updatePage(page)"
            >
              Refresh
            </button>
          </div>
        </div>

        <hr>
        <p
          v-if="datasets.length < 1"
          class="text-center"
        >
          You need to create a dataset!
        </p>
        <div
          v-else
          style="background-color: gray"
        >
          <Pagination
            v-model:page="page"
            :pages="pages"
            @pagechange="updatePage"
          />
          <div class="row bg-light">
            <DatasetCard
              v-for="dataset in datasets"
              :key="dataset.id"
              :dataset="dataset"
              :categories="categories"
              @update-page="updatePage"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      id="createDataset"
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
              Creating a Dataset
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
              <div
                class="form-group"
                :class="{ 'was-validated': validDatasetName.length !== 0 }"
              >
                <label>Dataset Name</label>
                <input
                  v-model="create.name"
                  class="form-control"
                  placeholder="Dataset name"
                  required
                >
                <div class="invalid-feedback">
                  {{ validDatasetName }}
                </div>
              </div>

              <div class="form-group">
                <label>Default Categories</label>
                <TagsInput
                  v-model:selectedItems="create.categories"
                  element-id="createCategory"
                  :existing-tags="categoryTags"
                  :typeahead="true"
                  :typeahead-activation-threshold="0"
                />
              </div>

              <div
                class="form-group"
                required
              >
                <label>Folder Directory</label>
                <input
                  class="form-control"
                  disabled
                  :value="directory"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              @click="createDataset"
            >
              Create Dataset
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
      id="helpDataset"
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
              Datasets
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
            More information can be found in the
            <a href="/help">help section</a>.
            <hr>
            <h6>What is a dataset?</h6>
            A dataset is a collection of images. It provides default category
            options for all subsequent images. Each dataset has its own folder
            in the /datasets directory.
            <hr>
            <h6>How do I create one?</h6>
            Click on the "Create" button found on this webpage. A dataset name
            must be provided.
            <hr>
            <h6>How do I add images?</h6>
            Once you have created a dataset you can add images by placing them
            in the create folder (while the server is running).
          </div>

          <div class="modal-footer">
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
import Datasets from "@/models/datasets";
import AdminPanel from "@/models/admin";
import DatasetCard from "@/components/cards/DatasetCard";
import Pagination from "@/components/Pagination";
import TagsInput from "@/components/TagsInput";

import useAxiosRequest from "@/composables/axiosRequest";
import { ref, computed, watch, inject, onMounted, provide } from 'vue';

const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();

import { useStores } from "@/composables/useStores"
const { auth, proc } = useStores();

const pages = ref(1);
const limit = ref(52);
const page = ref(1);
const create = ref({
      name: "",
      categories: []
});
const datasets = ref([]);
const subdirectories = ref([]);
const categories = ref([]);
const users = ref([]);

const getUsers = () => {
  return users.value;
};

const updatePage = (p) => {
      let process = "Loading datasets";
      proc.addProcess(process);

      p = p || page.value;
      page.value = p;

      Datasets.allData({
        limit: limit.value,
        page: p,
      })
        .then((response) => {
          datasets.value = response.data.datasets;
          categories.value = response.data.categories;
          subdirectories.value = response.data.subdirectories;
          pages.value = response.data.pagination.pages;
          page.value = response.data.pagination.page;
          AdminPanel.getUsers(limit.value).then((response) => {
            users.value = response.data.users;
          });
        })
        .finally(() => { 
            proc.removeProcess(process);
        });
};

const createDataset = () => {
      if (create.value.name.length < 1) return;

      const categories = [...create.value.categories];
      Datasets.create(create.value.name, categories)
        .then(() => {
          create.value.name = "";
          create.value.categories = [];
          updatePage();
        })
        .catch((error) => {
          axiosReqestError(
            "Creating Dataset",
            error.response.data.message
          );
        });
};

const directory = computed(() => {
  const closing = create.value.name.length > 0 ? "/" : "";
  return "/datasets/" + create.value.name + closing;
});

const categoryTags = computed(() => {
  const tags = {};
  categories.value.forEach((category) => {
    tags[category.name] = category.name;
  });
  return tags;
});

const validDatasetName = computed(() => {
  if (create.value.name.length === 0) return "Dataset name is required";
  return "";
});

const user = computed(() => {
  return auth.user;
});

watch(
  () => user.value,
  () => { 
      updatePage();
  }
);

onMounted(() => {
  updatePage();
});

provide('getUsers', getUsers);

</script>

<style scoped>
.help-icon {
  color: darkblue;
  font-size: 20px;
  display: inline;
}
</style>
