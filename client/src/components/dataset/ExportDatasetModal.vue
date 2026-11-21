<template>
  <BaseModal
    id="exportDataset"
    ref="modal"
    :title="title"
  >
    <form>
      <div class="form-group">
        <label>Categories (Empty export all)</label>
        <TagsInput
          v-model:selected-items="categories"
          element-id="exportCategories"
          :existing-tags="categoryTags"
          :typeahead="true"
          :typeahead-activation-threshold="0"
        />
      </div>
      <div>
        <input
          v-model="withEmptyImages"
          type="checkbox"
          class="form-check-input"
        >
        <label class="form-check-label">export with not annotated images</label>
      </div>
    </form>
    <template #footer>
      <button
        type="button"
        class="btn btn-primary"
        @click="$emit('export')"
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
    </template>
  </BaseModal>
</template>

<script setup>
import { useTemplateRef } from "vue";

import BaseModal from "@/components/BaseModal";
import TagsInput from "@/components/TagsInput";

defineProps({
  title: { type: String, default: "" },
  categoryTags: { type: Object, default: () => ({}) },
});
defineEmits(["export"]);

const categories = defineModel("categories", { type: Array, required: true });
const withEmptyImages = defineModel("withEmptyImages", { type: Boolean, required: true });

const modal = useTemplateRef("modal");

defineExpose({
  showModal: () => modal.value.showModal(),
  hideModal: () => modal.value.hideModal(),
});
</script>
