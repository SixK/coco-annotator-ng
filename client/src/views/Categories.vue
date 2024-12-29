<template>
  <div>
    <div style="padding-top: 55px" />
    <div
      class="album py-5 bg-light"
      style="overflow: auto; height: calc(100vh - 55px)"
    >
      <div class="container">
        <h2 class="text-center">
          Categories
          <i
            class="fa fa-question-circle help-icon"
            data-bs-toggle="modal"
            data-bs-target="#helpCategories"
            aria-hidden="true"
          />
        </h2>

        <p class="text-center">
          Loaded <strong>{{ categoryCount }}</strong> categories.
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
              data-bs-target="#createCategories"
            >
              Create
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="updatePage()"
            >
              Refresh
            </button>
          </div>
        </div>

        <hr>

        <p
          v-if="categories.length < 1"
          class="text-center"
        >
          You need to create a category!
        </p>
        <div v-else>
          <Pagination
            :pages="pages"
            @pagechange="updatePage"
          />

          <div class="row">
            <CategoryCard
              v-for="category in categories"
              :key="category.id"
              :category="category"
              @update-page="updatePage"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      id="createCategories"
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
              Creating a Category
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
                <label>Name:</label>
                <input
                  v-model="newCategoryName"
                  class="form-control"
                  :class="{ 'is-invalid': newCategoryName.trim().length === 0 }"
                  required="true"
                  placeholder="Name"
                >
              </div>

              <div class="form-group">
                <label>Supercategory:</label>
                <input
                  v-model="newCategorySupercategory"
                  class="form-control"
                  placeholder="Supercategory"
                >
              </div>

              <div class="form-group row">
                <label class="col-sm-2 col-form-label">Color:</label>
                <div class="col-sm-9">
                  <input
                    v-model="newCategoryColor"
                    type="color"
                    class="form-control"
                  >
                </div>
              </div>

              <div class="form-group">
                <KeypointsDefinition
                  ref="keypoints"
                  v-model:keypoints-def="newCategoryKeypoint"
                  element-id="keypoints"
                  placeholder="Add a keypoint"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!isFormValid"
              :class="{ disabled: !isFormValid }"
              @click="createCategory"
            >
              Create Category
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
      id="helpCategories"
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
              Categories
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
            <a
              href="https://github.com/jsbroks/coco-annotator/wiki/Usage#creating-categories"
            >
              getting started section </a>.
            <hr>
            <h6>What is a category?</h6>

            <hr>
            <h6>How do I create one?</h6>
            Click on the "Create" button found on this webpage. You must
            provided a name for the category.
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
import Category from "@/models/categories";
import CategoryCard from "@/components/cards/CategoryCard";
import Pagination from "@/components/Pagination";
import KeypointsDefinition from "@/components/KeypointsDefinition";

import { ref, computed, watch, inject, onMounted, provide } from 'vue';

import useAxiosRequest from "@/composables/axiosRequest";
const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

const categoryCount = ref(0);
const pages = ref(1);
const page = ref(1);
const limit = ref(50);
const range = ref(11);
const newCategoryName = ref("");
const newCategorySupercategory = ref("");
const newCategoryColor = ref(null);
const newCategoryKeypoint = ref({
  labels: [],
  edges: [],
  colors: []
});
const categories = ref([]);
const status = ref({
  data: { state: true, message: "Loading categories" }
});
const keypoints = ref(null);

const isFormValid = computed(() => {
  return (
    newCategoryName.value.length !== 0 &&
    keypoints.value != null &&
    keypoints.value.valid
  );
});

const updatePage = (p) => {
  const process = "Loading categories";
  procStore.addProcess(process);

  p = p || page.value;
  page.value = p;
  Category.allData({
    page: p,
    limit: limit.value
  })
    .then((response) => {
      categories.value = response.data.categories;
      page.value = response.data.pagination.page;
      pages .value= response.data.pagination.pages;
      categoryCount.value = response.data.pagination.total;
    })
    .finally(() => {
               procStore.removeProcess(process);
    });
};

const createCategory = () => {
  if (newCategoryName.value.length < 1) return;

  Category.create({
    name: newCategoryName.value,
    supercategory: newCategorySupercategory.value,
    color: newCategoryColor.value,
    keypoint_labels: newCategoryKeypoint.value.labels,
    keypoint_edges: newCategoryKeypoint.value.edges,
    keypoint_colors: newCategoryKeypoint.value.colors,
  })
    .then(() => {
      newCategoryName.value = "";
      newCategorySupercategory.value = "";
      newCategoryColor.value = null;
      newCategoryKeypoint.value = {};
      updatePage();
    })
    .catch((error) => {
      axiosReqestError("Creating Category", error.response.data.message);
    });
};

const previousPage = () => {
  page.value -= 1;
  if (page.value < 1) {
    page.value = 1;
  }
  updatePage();
};

const nextPage = () => {
  page.value += 1;
  if (page.value > pages.value) {
    page.value = pages.value;
  }
  updatePage();
};

onMounted(() => {
      updatePage();
});

</script>

<style scoped>
.card-img-overlay {
  padding: 0 10px 0 0;
}

.icon-more {
  width: 10%;
  margin: 3px 0;
  padding: 0;
  float: right;
  color: black;
}

.help-icon {
  color: darkblue;
  font-size: 20px;
  display: inline;
}
</style>
