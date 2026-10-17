<template>
  <div
    ref="root"
    class="modal fade"
    tabindex="-1"
    role="dialog"
    :aria-labelledby="titleId"
    @hidden="$emit('hidden')"
  >
    <div
      class="modal-dialog"
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header justify-content-between">
          <h5
            :id="titleId"
            class="modal-title"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div
          v-if="slots.footer"
          class="modal-footer"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, ref, useId, useSlots } from "vue";
import { Modal } from "bootstrap";

defineProps({ title: { type: String, default: "" } });
defineEmits(["hidden"]);

const slots = useSlots();
const root = ref(null);
// unique per instance: a category or annotation list renders one modal per row
const titleId = useId();

// Created on demand: Bootstrap itself instantiates the modal when it is
// opened through data-bs-toggle / data-bs-target, both end up on the same
// instance.
const instance = () => Modal.getOrCreateInstance(root.value);

const showModal = () => instance().show();
const hideModal = () => instance().hide();

onUnmounted(() => {
  const modal = Modal.getInstance(root.value);
  if (!modal) return;

  if (modal.isShown) {
    // Closing here would leave the grey backdrop and the locked scroll behind
    // once the element is gone: let Bootstrap finish its transition, which
    // runs ~300ms later even if the element is no longer in the document.
    // dispose() is deliberately not called: it nulls every property of the
    // instance and hide()'s deferred callback would then throw.
    modal.hide();
  } else {
    // Nothing pending: release the instance now, Bootstrap keeps it in a Map
    // keyed by element otherwise.
    modal.dispose();
  }
});

defineExpose({ showModal, hideModal });
</script>
