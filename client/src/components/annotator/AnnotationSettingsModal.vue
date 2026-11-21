<template>
  <BaseModal
    :id="id"
    ref="modal"
    @hidden="$emit('hidden')"
  >
    <template #title>
      {{ index + 1 }}
      <i style="color: darkgray">(id: {{ annotation.id }})</i>
    </template>
    <form>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Color</label>
        <div class="col-sm-8">
          <input
            v-model="color"
            type="color"
            class="form-control"
          >
        </div>
      </div>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Name</label>
        <div class="col-sm-8">
          <input
            v-model="name"
            class="form-control"
          >
        </div>
      </div>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Category</label>
        <div class="col-sm-8">
          <select
            class="form-control"
            @change="$emit('change-category', $event)"
          >
            <option
              v-for="option in allCategories"
              :key="option.text"
              :selected="annotation.category_id === option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
      <MetaData
        ref="metadata"
        :metadata="annotation.metadata"
        exclude="name"
      />
    </form>
    <template #footer>
      <button
        type="button"
        class="btn btn-danger"
        data-bs-dismiss="modal"
        @click="$emit('delete')"
      >
        Delete
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
import MetaData from "@/components/MetaData";

defineProps({
  id: { type: String, required: true },
  annotation: { type: Object, required: true },
  index: { type: Number, required: true },
  allCategories: { type: Array, default: () => [] },
});
defineEmits(["hidden", "delete", "change-category"]);

const color = defineModel("color", { type: String, required: true });
const name = defineModel("name", { type: String, required: true });

const modal = useTemplateRef("modal");
const metadata = useTemplateRef("metadata");

defineExpose({
  showModal: () => modal.value.showModal(),
  hideModal: () => modal.value.hideModal(),
  // Annotation.vue builds its payload from the metadata editor: keep the same
  // call surface now that the editor lives one level down.
  exportMetadata: () => metadata.value?.exportMetadata(),
});
</script>
