<template>
  <div class="col-md-3">
    <div
      class="card mb-4 box-shadow"
      @click="onCardClick"
    >
      <div class="card-body">
        <span
          class="d-inline-block text-truncate"
          style="max-width: 75%; float: left"
        >
          <i
            class="fa fa-circle color-icon"
            aria-hidden="true"
            :style="{ color: category.color }"
          />
          <strong class="card-title">{{ category.name }}</strong>
        </span>

        <i
          :id="'dropdownCategory' + category.id"
          class="card-text fa fa-ellipsis-v fa-x icon-more"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-hidden="true"
        />

        <br>

        <div>
          <p v-if="category.numberAnnotations > 0">
            {{ category.numberAnnotations }} objects have been made with this
            category.
          </p>
          <p v-else>
            No annotations use this category
          </p>
        </div>

        <div
          class="dropdown-menu"
          :aria-labelledby="'dropdownCategory' + category.id"
        >
          <a
            class="dropdown-item"
            @click="onDeleteClick"
          >Delete</a>
          <!--<a class="dropdown-item" @click="onDownloadClick"
            >Download COCO & Images</a
          >-->
          <button
            class="dropdown-item"
            data-bs-toggle="modal"
            :data-bs-target="'#categoryEdit' + category.id"
          >
            Edit
          </button>
        </div>
      </div>

      <div
        v-show="authStore.loginEnabled()"
        class="card-footer text-muted"
      >
        Created by {{ category.creator }}
      </div>
    </div>

    <div
      :id="'categoryEdit' + category.id"
      ref="category_settings"
      class="modal fade"
      role="dialog"
      @hidden="resetCategorySettings"
    >
      <div
        class="modal-dialog"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header justify-content-between">
            <h5 class="modal-title">
              Category: {{ category.name }}
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
                <label>Name</label>
                <input
                  type="text"
                  :value="name"
                  required="true"
                  class="form-control"
                  :class="{ 'is-invalid': name.length === 0 }"
                  @input="name = $event.target.value"
                >
              </div>

              <div class="form-group">
                <label>Supercategory</label>
                <input
                  type="text"
                  class="form-control"
                  :value="category.supercategory"
                  @input="supercategory = $event.target.value"
                >
              </div>

              <div class="form-group row">
                <label class="col-sm-2 col-form-label">Color</label>
                <div class="col-sm-9">
                  <input
                    v-model="color"
                    type="color"
                    class="form-control"
                  >
                </div>
              </div>

              <div class="form-group">
                <KeypointsDefinition
                  ref="keypoints"
                  v-model:keypoints-def="keypoint"
                  element-id="keypoints"
                  placeholder="Add a keypoint"
                />
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-success"
              :disabled="!isFormValid"
              :class="{ disabled: !isFormValid }"
              data-bs-dismiss="modal"
              @click="onUpdateClick"
            >
              Update
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
  </div>
</template>

<script setup>

import { ref, toRefs, reactive, onMounted, computed} from "vue";

import axios from "axios";
import KeypointsDefinition from "@/components/KeypointsDefinition";
import useAxiosRequest from "@/composables/axiosRequest";

import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();

const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();

const emit = defineEmits(['updatePage']);
const keypoints = ref([]);

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
});

const category = ref(props.category);

const state = reactive({
  group: null,
  supercategory: category.value.supercategory,
  color: props.category.color,
  metadata: [],
  keypoint: {
    labels: [...category.value.keypoint_labels],
    edges: [...category.value.keypoint_edges],
    colors: [...category.value.keypoint_colors],
  },
  name: category.value.name,
  isMounted: false,
});

const { group, supercategory, color, metadata, keypoint, name } = toRefs(state);
defineExpose({ group, supercategory, color, metadata, keypoint, name });


onMounted(() => {
  state.isMounted = true;
  resetCategorySettings();
});

const isFormValid = computed(() => {
  return (
    state.isMounted &&
    name.value.length !== 0 &&
    keypoints.value &&
    keypoints.value.valid
  );
});

const resetCategorySettings = () => {
      name.value = props.category.name;
      supercategory.value = props.category.supercategory;
      color.value = props.category.color;
      keypoint.value = {
        labels: [...props.category.keypoint_labels],
        edges: [...props.category.keypoint_edges],
        colors: [...props.category.keypoint_colors],
      };
    };
    const onCardClick = () => {};
    const onDownloadClick = () => {};
    const onDeleteClick = async () => {
      await axios.delete("/api/category/" + props.category.id);
      emit('updatePage');
};


const onUpdateClick = () => {
      try {
        axios.put('/api/category/' + category.value.id, {
          name: name.value,
          color: color.value,
          supercategory: supercategory.value,
          metadata: metadata.value,
          keypoint_edges: keypoint.value.edges,
          keypoint_labels: keypoint.value.labels,
          keypoint_colors: keypoint.value.colors,
        });
        axiosReqestSuccess(
          'Updating Category',
          'Category successfully updated'
        );

        category.value.name = name.value;
        category.value.supercategory = supercategory.value;
        category.value.color = color.value;
        category.value.metadata = { ...metadata.value };
        category.value.keypoint_edges = [...keypoint.value.edges];
        category.value.keypoint_labels = [...keypoint.value.labels];
        category.value.keypoint_colors = [...keypoint.value.colors];
        emit('updatePage');
      } catch (error) {
          console.error('Error updating category:',    error.message);
          axiosReqestError(
            'Updating Category',
            error.message
          );
          emit('updatePage');
      }
};
</script>

<style scoped>
.icon-more {
  width: 10%;
  margin: 3px 0;
  padding: 0;
  float: right;
  color: black;
}

.card-body {
  padding: 10px 10px 0 10px;
}

.color-icon {
  display: inline;
  margin: 0;
  padding-right: 10px;
}

.card-footer {
  padding: 2px;
  font-size: 11px;
}
</style>
