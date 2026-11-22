<template>
  <BaseModal
    :id="id"
    ref="modal"
    :title="title"
    @hidden="$emit('hidden')"
  >
    <form>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Visibility</label>
        <div class="col-sm-8">
          <select
            v-model="visibility"
            class="form-control"
          >
            <option
              v-for="(desc, label) in visibilityOptions"
              :key="label"
              :value="label"
              :selected="visibility == label"
            >
              {{ desc }}
            </option>
          </select>
        </div>
      </div>
    </form>
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
</template>

<script setup>
import { useTemplateRef } from "vue";

import BaseModal from "@/components/BaseModal";
import { VisibilityOptions } from "@/libs/keypoints";

defineProps({
  id: { type: String, required: true },
  title: { type: String, default: "" },
});
defineEmits(["hidden"]);

// The modal edits `keypoint.visibility` in the parent; the value is a label
// (string) as rendered by the <option> list below.
const visibility = defineModel("visibility", {
  type: [Number, String],
  required: true,
});

const visibilityOptions = VisibilityOptions;

const modal = useTemplateRef("modal");

defineExpose({
  showModal: () => modal.value.showModal(),
  hideModal: () => modal.value.hideModal(),
});
</script>
