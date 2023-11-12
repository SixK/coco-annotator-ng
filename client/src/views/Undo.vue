<template>
  <div>
    <div style="padding-top: 55px" />
    <div
      class="album py-5 bg-light"
      style="overflow: auto; height: calc(100vh - 55px)"
    >
      <div class="container">
        <h2 class="text-center">
          Undo
        </h2>
        <p class="text-center">
          Total of <strong>{{ undos.length }}</strong> items can be undone.
        </p>

        <div class="row justify-content-md-center">
          <div
            class="col-md-auto btn-group"
            role="group"
            style="padding-bottom: 20px"
          >
            <button
              type="button"
              class="btn btn-success disabled"
            >
              Undo All
            </button>
            <button
              type="button"
              class="btn btn-danger disabled"
            >
              Delete All
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="updatePage"
            >
              Refresh
            </button>
          </div>
        </div>

        <div
          class="row justify-content-md-center"
          style="padding-bottom: 10px"
        >
          <div class="col-md-2 text-right">
            <span>Instance Type</span>
          </div>
          <div class="col-md-2">
            <select
              v-model="type"
              class="form-control form-control-sm"
            >
              <option value="all">
                All
              </option>
              <option value="annotation">
                Annotations
              </option>
              <option value="category">
                Categories
              </option>
              <option value="dataset">
                Datasets
              </option>
            </select>
          </div>
          <div class="col-md-2 text-right">
            <span>Limit</span>
          </div>
          <div class="col-md-2">
            <select
              v-model="limit"
              class="form-control form-control-sm text-inline"
            >
              <option>50</option>
              <option>100</option>
              <option>500</option>
              <option>1000</option>
            </select>
          </div>
        </div>

        <p
          v-if="undos.length < 1"
          class="text-center"
        >
          Nothing to undone!
        </p>
        <div v-else>
          <table class="table table-hover table-sm">
            <thead class="remove-top-border">
              <tr>
                <th scope="col">
                  Date
                </th>
                <th scope="col">
                  Instance Type
                </th>
                <th scope="col">
                  ID
                </th>
                <th scope="col">
                  Name
                </th>
                <th
                  class="text-center"
                  scope="col"
                >
                  Rollback
                </th>
                <th
                  class="text-center"
                  scope="col"
                >
                  Delete
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(undo, index) in undos"
                :key="index"
              >
                <td>
                  {{ undo.ago.length > 0 ? undo.ago : 0 + " seconds" }} ago
                </td>
                <td>{{ undo.instance }}</td>
                <td>{{ undo.id }}</td>
                <td>{{ undo.name }}</td>
                <td>
                  <i
                    class="fa fa-undo text-center undo-icon"
                    aria-hidden="true"
                    @click="undoModel(undo.id, undo.instance)"
                  />
                </td>
                <td>
                  <i
                    class="fa fa-remove text-center delete-icon"
                    aria-hidden="true"
                    @click="deleteModel(undo.id, undo.instance)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Undo from "@/models/undos";
// import { useStore } from 'vuex';
import { ref, computed, watch, inject, onMounted, provide } from 'vue';
import {useLoading} from 'vue-loading-overlay'

import { useProcStore } from "@/store/index";
const procStore = useProcStore();

const $loading = useLoading({});
// const store = useStore();

const undos = ref([]);
const limit = ref(50);
const type = ref("all");
const isLoading = ref("false");


const updatePage = () => {
  // isLoading.value = true;
  const loader = $loading.show({
    color: "#383c4a"
  });
  const process = `Loading undo for ${type.value} instance type`;
  // store.commit('addProcess', process);
  procStore.addProcess(process);
  Undo.all(limit.value, type.value)
    .then(response => {
      undos.value = response.data;
    })
    .finally(() => {
      procStore.removeProcess(process);
      // store.commit('removeProcess', process);
      // isLoading.value = false;
      loader.hide()
    });
};

const undoModel = (id, instance) => {
  // if(isLoading.value === false) 
      Undo.undo(id, instance).then(updatePage);
};

const deleteModel = (id, instance) => {
  // if(isLoading.value === false) 
      Undo.delete(id, instance).then(updatePage);
};

watch(
  () => [limit.value, type.value], 
  () => {
  updatePage();
});

onMounted(() => {
  updatePage();
});

</script>

<style scoped>
.remove-top-border {
  border: none !important;
}

.fa {
  margin: 0;
  padding: 2px;
}

.undo-icon:hover {
  color: green;
}

.delete-icon:hover {
  color: red;
}
</style>
