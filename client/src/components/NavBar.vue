<template>
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
    <i
      class="fa fa-circle"
      :style="{ color: color }"
      style="padding: 0 10px; font-size: 10px"
    />

    <RouterLink
      class="navbar-brand"
      to="/"
    >
      <strong>{{ name }}</strong>
      <span class="subscript">{{ version }}</span>
    </RouterLink>

    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon" />
    </button>

    <div
      id="navbarSupportedContent"
      class="collapse navbar-collapse"
    >
      <ul class="navbar-nav mr-auto">
        <li
          class="nav-item"
          :class="{
            active: $route.name === 'datasets' || $route.name === 'dataset',
          }"
        >
          <RouterLink
            class="nav-link"
            to="/datasets"
          >
            Datasets
          </RouterLink>
        </li>
        <li
          v-show="$route.name === 'annotate'"
          class="nav-item"
          :class="{ active: $route.name === 'annotate' }"
        >
          <RouterLink
            class="nav-link"
            :to="`/dataset/${dataset.id}`"
          >
            {{ dataset.name }}
          </RouterLink>
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.name === 'categories' }"
        >
          <RouterLink
            class="nav-link"
            to="/categories"
          >
            Categories
          </RouterLink>
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.name === 'undo' }"
        >
          <RouterLink
            class="nav-link"
            to="/undo"
          >
            Undo
          </RouterLink>
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.name === 'tasks' }"
        >
          <RouterLink
            class="nav-link"
            to="/tasks"
          >
            Tasks
          </RouterLink>
        </li>
        <li
          v-show="auth.isAdmin"
          class="nav-item"
          :class="{ active: $route.name === 'admin' }"
        >
          <RouterLink
            class="nav-link d-none d-xl-block"
            to="/admin/panel"
          >
            Admin
          </RouterLink>
        </li>
        <li class="nav-item d-none d-xl-block">
          <a
            class="nav-link"
            href="/api"
          >API</a>
        </li>
        <li class="nav-item d-none d-xl-block">
          <a
            class="nav-link"
            href="https://github.com/jsbroks/coco-annotator/wiki"
          >Help</a>
        </li>
      </ul>
      <Status class="nav-link left" />
      <User
        v-if="loginEnabled"
        class="nav-link left"
      />
    </div>
  </nav>
</template>

<script setup>
import { computed, watch, ref } from 'vue';

import User from '@/components/User';
import Status from '@/components/Status';

import { useStores } from "@/composables/useStores"
const { auth, info, proc } = useStores();

const color = ref('white');
const backendStatus = ref('Connection unknown');

const version = computed(() => info.version);
const loginEnabled = computed(() => info.loginEnabled);
const name = computed(() => info.name);
const socket = computed(() => info.socket);
const dataset = computed(() => {
  let dataset = proc.dataset;
  if (dataset == null) return { name: '', id: '' };
  return dataset;
});


watch(socket, (connected) => {
  if (connected == null) {
    color.value = 'white';
    backendStatus.value = 'Connection unknown';
    return;
  }
  if (connected) {
    color.value = 'green';
    backendStatus.value = 'Connected to backend';
  } else {
    color.value = 'red';
    backendStatus.value = 'Could not connect to backend';
  }
});
</script>

<style scoped>
.subscript {
  padding: 10px;
  font-size: 10px;
  color: lightgray;
}

.navbar {
  background-color: #383c4a;
}

.left {
  padding: 0;
}
</style>
