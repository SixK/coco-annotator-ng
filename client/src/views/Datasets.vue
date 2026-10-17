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

    <BaseModal
      id="createDataset"
      title="Creating a Dataset"
    >
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
      <template #footer>
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
      </template>
    </BaseModal>

    <BaseModal
      id="helpDataset"
      title="Datasets"
    >
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
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import Datasets from "@/models/datasets";
import AdminPanel from "@/models/admin";
import DatasetCard from "@/components/cards/DatasetCard";
import Pagination from "@/components/Pagination";
import TagsInput from "@/components/TagsInput";
import BaseModal from "@/components/BaseModal";

import useAxiosRequest from "@/composables/axiosRequest";
import usePaginatedList from "@/composables/usePaginatedList";
import { ref, computed, watch, onMounted, provide } from 'vue';

const {axiosRequestError, axiosRequestSuccess} = useAxiosRequest();

import { useStores } from "@/composables/useStores"
const { auth } = useStores();

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

const { page, pages, limit, updatePage } = usePaginatedList({
  processLabel: "Loading datasets",
  initialLimit: 52,
  fetchPage: (params) => Datasets.allData(params),
  handleResponse: ({ data }) => {
    datasets.value = data.datasets;
    categories.value = data.categories;
    subdirectories.value = data.subdirectories;
  },
  onLoaded: () => {
    AdminPanel.getUsers(limit.value).then((response) => {
      users.value = response.data.users;
    });
  },
});

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
          axiosRequestError(
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
  user,
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
