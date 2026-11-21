<template>
  <BaseModal
    id="generateDataset"
    title="Generate a Dataset"
  >
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
          v-model="limit"
          class="form-control"
          type="number"
        >
      </div>
    </form>
    <template #footer>
      <button
        type="button"
        class="btn btn-primary"
        @click="$emit('generate')"
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
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from "@/components/BaseModal";

const keyword = defineModel("keyword", { type: String, required: true });
const limit = defineModel("limit", { type: [Number, String], required: true });

defineEmits(["generate"]);
</script>
