<template>
  <div>
    <i
      v-tooltip.right="name"
      class="fa fa-x fa-clone"
      style="color: white"
      data-bs-toggle="modal"
      data-bs-target="#copyAnnotations"
      @click="showModal"
    />
    <br>
    <!-- Modal -->
    <div
      id="copyAnnotations"
      ref="modal"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      aria-labelledby="copyAnnotationsLabel"
      aria-hidden="true"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5
              id="copyAnnotationsLabel"
              class="modal-title"
            >
              Copy Annotations From Image
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
            <form novalidate="true">
              <button
                type="button"
                class="btn btn-sm btn-light"
                style="float: left"
                @click="fromId = previous.toString()"
              >
                <i class="fa fa-arrow-left" /> Previous Image
              </button>
              <button
                type="button"
                class="btn btn-sm btn-light"
                style="float: right; margin-left: 8px"
                @click="fromId = next.toString()"
              >
                Next Image <i class="fa fa-arrow-right" />
              </button>

              <div class="form-group">
                <label>Image ID</label>
                <input
                  v-model="fromId"
                  :class="{
                    'form-control': true,
                    'is-invalid': validImageId.length !== 0,
                  }"
                  placeholder="Enter an image ID"
                  required
                >
                <div class="invalid-feedback">
                  {{ validImageId }}
                </div>
              </div>

              <div class="form-group">
                <label>Copy Only Selected Categories</label>
                <TagsInput
                  v-model:selectedItems="selectedCategories"
                  element-id="categoriesToCopy"
                  :existing-tags="categoryTags"
                  :typeahead="true"
                  :only-existing-tags="true"
                  :typeahead-activation-threshold="0"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal()"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="copyAnnotations()"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { Modal } from "bootstrap";
import TagsInput from "@/components/TagsInput";
import { watch, computed, ref, inject, onMounted, toRefs, reactive, watchEffect } from 'vue'

import useAxiosRequest from "@/composables/axiosRequest";
/*
import { useStore } from 'vuex';
const store = useStore();
*/

import { useProcStore } from "@/store/index";
const procStore = useProcStore();
/*
import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();
import { useInfoStore } from "@/store/info";
const infoStore = useInfoStore();
*/

const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();
const addProcess = (process) => procStore.addProcess(process);
const removeProcess = (process) => procStore.removeProcess(process);
const resetUndo = () => procStore.resetUndo();


const { save, getData } = inject('annotator');

const imageId = defineModel('imageId', { type: Number, required: true });
const next = defineModel('next', { type: Number, default: null });
const previous = defineModel('previous', { type: Number, default: null });
const categories = defineModel('categories', { type: Array, required: true });

/*
const props = defineProps({
  imageId: {
    type: Number,
    required: true,
  },
  next: {
    type: Number,
    default: null,
  },
  previous: {
    type: Number,
    default: null,
  },
  categories: {
    type: Array,
    required: true,
  },
  
});
*/

const name = 'Copy Annotations';
const fromId = ref('');
const selectedCategories = ref([]);
const visible = ref(false);
const isVisible = ref(false);

// const imageId = ref(props.imageId);
const localCategories = ref([]);

let modal = ref(null);
const closeModal = () => Modal.getInstance(modal.value)?.hide();
const showModal = () => Modal.getInstance(modal.value)?.show();

const copyAnnotations =  () => {

  if (validImageId.value !== '') return
  closeModal();

  const process = `Copying annotations from ${fromId.value}`
  const scategories = selectedCategories.value.map((category) => parseInt(category))

  save(() => {

    addProcess(process);
    axios
      .post(`/api/image/copy/${fromId.value}/${imageId.value}/annotations`, {
        category_ids: scategories,
      })
      .then(() => {
        getData()
      })
      .catch((error) => {
        axiosReqestError('Copying Annotations', error.response.data.message)
      })
      .finally(() => removeProcess(process))
  });
};


const validImageId = computed(() => {
  const errorMsg = "Enter a valid image ID";

  if (fromId.value == null) return errorMsg;
  if (fromId.value === "") return errorMsg;
  if (isNaN(fromId.value)) return "Value must be a number";
  if (fromId.value.trim() !== fromId.value) return "Value must be a number";
  if (fromId.value === imageId.value) return "Sorry, you can not clone the same image";
  return "";
});

const categoryTags = computed(() => {
  const tags = {};
  localCategories.value.forEach((category) => {
    tags[category.id] = category.name;
  });
  return tags;
});

// dunno if there is a better way to get Array toward props ?
watchEffect(() => {
    categories.value.forEach((category) => {
          localCategories.value.push(category);
      });
});

watch(
  () => localCategories.value,
  (newCategories) => {
    const tags = [];
    newCategories.forEach((category) => {
      tags.push(category.id.toString());
    });
    selectedCategories.value = tags;
  },
  { immediate: true }
);


</script>

<style scoped>
.btn-light {
  margin-bottom: 4px;
}
</style>
