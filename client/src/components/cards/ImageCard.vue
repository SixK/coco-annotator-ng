<template>
  <div class="col-md-3">
    <div
      class="card mb-4 shadow-sm"
      :class="{ border: annotated, 'border-danger': annotated }"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <div @click="openAnnotator">
        <UnLazyImage
          :src="imageUrl"
          :src-placeholder="loaderUrl"
          class="card-img-top"
          style="width: 100%; display: block"
          :style="{ opacity: annotated ? 0.3 : 1 }"
        />
      </div>

      <b
        v-if="annotated"
        class="overlay-text text-center"
      >
        Being annotated by {{ image.annotating.join(", ") }}
      </b>

      <div
        class="card-body"
        style="width: 100%"
        :style="{ opacity: annotated ? 0.3 : 1 }"
      >
        <div
          class="row"
          style="width: 100%"
        >
          <span
            :class="{ 'text-truncate': !hover }"
            style="width: 100%; float: left"
          >
            <strong class="card-title">
              {{ image.id }}. {{ image.file_name }}
            </strong>
          </span>

          <i
            :id="'dropdownImage' + image.id"
            class="card-text fa fa-ellipsis-v fa-x icon-more"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            aria-hidden="true"
          />

          <div
            class="dropdown-menu"
            :aria-labelledby="'dropdownImage' + image.id"
            style="min-width: fit-content"
          >
            <button
              class="btn dropdown-item"
              @click="onDeleteClick"
            >
              Delete
            </button>
            <button
              class="btn dropdown-item"
              @click="openAnnotator"
            >
              Annotate
            </button>
            <button
              class="btn dropdown-item"
              @click="onDownloadClick"
            >
              Download Image & COCO
            </button>
            <button
              class="btn dropdown-item"
              @click="onDownloadSegmentedClick"
            >
              Download Segmented Image
            </button>
          </div>
        </div>

        <div class="row">
          <p v-show="image.num_annotations > 0">
            {{ image.num_annotations }} annotation<span
              v-show="image.num_annotations > 1"
            >s</span>
          </p>
          <p v-show="image.annotated == true && image.num_annotations < 0">
            Annotated
          </p>
          <p v-show="image.annotated == false">
            No annotations
          </p>
        </div>

        <div class="row">
          <!--<span
            v-for="(category, index) in image.categories"
            :key="index"
            class="badge badge-pill badge-primary category-badge"
            :style="{ 'background-color': category.color }"
          >
            {{ category.name }}
          </span>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed} from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(['updatePage']);

const image = defineModel('image', { type: Object, required: true });

const hover = ref(false);
const showAnnotations = ref(true);

import loaderUrl from "@/assets/loader.gif";

const imageUrl = computed(() => {
      const d = new Date();
      if (showAnnotations.value) {
        return `/api/image/${image.value.id}?width=250&thumbnail=true&dummy=${d.getTime()}`;
      } else {
        return "/api/image/" + image.value.id + "?width=250";
      }
});
    
const annotated = computed(() => {
      if (!image.value.annotating) return 0;
      return image.value.annotating.length > 0;
});

const downloadURI = (uri, exportName) => {
  const link = document.createElement("a");
  link.href = uri;
  link.download = exportName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const openAnnotator = () => {
  router.push({
    name: "annotate",
    params: { identifier: image.value.id }
  });
};

const onDownloadClick = () => {
  downloadURI("/api/image/" + image.value.id + "?asAttachment=true", image.value.file_name);
  
  axios.get("/api/image/" + image.value.id + "/coco").then(response => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(response.data));
    downloadURI(
      dataStr,
      image.value.file_name.replace(/\.[^/.]+$/, "") + ".json"
    );
  });
}

const onDownloadSegmentedClick = () => {
  downloadURI("/api/image/segmented/" + image.value.id + "?asAttachment=true", image.value.file_name);
}

const onDeleteClick = () => {
  axios.delete(`/api/image/${image.value.id}`);
  // $parent.updatePage();
  emit('updatePage');
};

</script>

<style scoped>
.card-img-overlay {
  padding: 0;
}

.overlay-text {
  position: absolute;
  padding: 10px;
  top: 30px;
  width: 100%;
}

.card-body {
  margin: 5px 5px 0 5px;
  padding: 10px 20px;
}

p {
  margin: 0;
  padding: 0 0 3px 0;
}

.list-group-item {
  height: 21px;
  font-size: 13px;
  padding: 2px;
  background-color: #4b5162;
}

.icon-more::before{
  float: right;
  color: black;
}

.icon-more {
  position: absolute;
  right: 5px;
  padding: 3px 10px;
  float: right;
  color: black;
}
.category-badge {
  float: left;
  margin: 0 2px 5px 0;
}

</style>
