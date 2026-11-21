<template>
  <BaseModal
    id="cocoUpload"
    ref="modal"
    title="Upload COCO Annotaitons"
  >
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
    <template #footer>
      <button
        type="button"
        class="btn btn-primary"
        data-bs-dismiss="modal"
        @click="$emit('upload')"
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
    </template>
  </BaseModal>
</template>

<script setup>
import { useTemplateRef } from "vue";

import BaseModal from "@/components/BaseModal";

defineEmits(["upload"]);

const modal = useTemplateRef("modal");

defineExpose({
  showModal: () => modal.value.showModal(),
  hideModal: () => modal.value.hideModal(),
});
</script>
