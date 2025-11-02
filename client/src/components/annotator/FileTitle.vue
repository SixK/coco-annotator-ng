<template>
  <div>
    <i
      v-show="previousimage != null"
      class="fa fa-arrow-left image-arrows"
      style="float: left"
      @click="route(previousimage)"
    />
    <i
      v-show="nextimage != null"
      class="fa fa-arrow-right image-arrows"
      style="float: right"
      @click="route(nextimage)"
    />

    <h6
      class="text-center"
      style="color: white"
    >
      <span
        class="d-inline-block text-truncate"
        style="max-width: 73%"
      >{{
        filename
      }}</span>
    </h6>
  </div>
</template>


<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

const filename = defineModel('filename', { type: String, required: true });
const previousimage = defineModel('previousimage', { type: Number, default: null });
const nextimage = defineModel('nextimage', { type: Number, default: null });

// Provide/Inject mechanism
const save = inject('save');
const updateCurrentAnnotation = inject('updateCurrentAnnotation');
const router = useRouter();

    /**
     * Navigates to image with provided ID
     *
     * @param {Number} identifer id of a file
     */

const route = async (identifier) => {
  // Make sure we pop the latest session before annotations
  updateCurrentAnnotation(-1);

  // keep previous behavior that waited a tick before saving/navigation
  await nextTick();

  try {
    // Await the migrated save() which now returns a Promise
    if (typeof save === 'function') {
      await save();
    }
    router.push({ name: "annotate", params: { identifier } });
  } catch (err) {
    console.error('Error while saving before route change:', err);
    // Fallback: still navigate (or choose not to). Here we navigate anyway.
    router.push({ name: "annotate", params: { identifier } });
  }
};

defineExpose({route});

</script>

<style scoped>
.image-arrows {
  color: white;
  position: relative;
  margin: 0 10px 15px 10px;
}
</style>
