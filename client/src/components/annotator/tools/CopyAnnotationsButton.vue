<template>
  <div>
    <i
      v-tooltip.right="name"
      class="fa fa-x fa-clone"
      style="color: white"
      data-bs-toggle="modal"
      data-bs-target="#copyAnnotations"
    />
    <br>
    <!-- Modal -->
    <BaseModal
      id="copyAnnotations"
      ref="copyModal"
      title="Copy Annotations From Image"
    >
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
      <template #footer>
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
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import axios from "axios";
import TagsInput from "@/components/TagsInput";
import BaseModal from "@/components/BaseModal";
import { watch, computed, ref, inject, watchEffect, useTemplateRef } from 'vue'

import useAxiosRequest from "@/composables/axiosRequest";

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

import { useProcess } from "@/composables/useProcess";
const { withProcess } = useProcess(procStore);

const {axiosRequestError, axiosRequestSuccess} = useAxiosRequest();
const resetUndo = () => procStore.resetUndo();


const { save, getData } = inject('annotator');

const imageId = defineModel('imageId', { type: Number, required: true });
const next = defineModel('next', { type: Number, default: null });
const previous = defineModel('previous', { type: Number, default: null });
const categories = defineModel('categories', { type: Array, required: true });


const name = 'Copy Annotations';
const fromId = ref('');
const selectedCategories = ref([]);
const visible = ref(false);
const isVisible = ref(false);

const localCategories = ref([]);

const copyModal = useTemplateRef('copyModal');
const closeModal = () => copyModal.value.hideModal();

const copyAnnotations = () => {

  if (validImageId.value !== '') return
  closeModal();

  const process = `Copying annotations from ${fromId.value}`
  const scategories = selectedCategories.value.map((category) => parseInt(category))

  // `save()` returns a promise and ignores any argument (see useDataHandling):
  // passing it a callback used to skip the copy entirely. Save first, then copy.
  save()
    .catch((error) => {
      axiosRequestError('Saving', error.response?.data?.message || error.message);
      return false; // stop here: don't copy onto unsaved annotations
    })
    .then((saved) => {
      if (saved === false) return;

      return withProcess(process, () => {
        return axios.post(`/api/image/copy/${fromId.value}/${imageId.value}/annotations`, {
          category_ids: scategories,
        });
      })
        .then(() => getData())
        .catch((error) => {
          axiosRequestError('Copying Annotations', error.response?.data?.message);
        });
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
  localCategories,
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
