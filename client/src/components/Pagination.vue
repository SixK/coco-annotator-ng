<template>
  <div class="row align-items-center justify-content-center bg-light">
    <ul class="pagination text-center">
      <li class="page-item" @click="previousPage">
        <a class="page-link" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
          <span class="sr-only">Previous</span>
        </a>
      </li>
      <li
        v-for="pageIndex in range"
        :key="pageIndex"
        :class="{ 'page-item': true, active: pageIndex + startPage == page }"
      >
        <a class="page-link" @click="page = pageIndex + startPage">{{
          pageIndex + startPage
        }}</a>
      </li>
      <li
        :class="{ 'page-item': true, disabled: page == pages }"
        @click="nextPage"
      >
        <a class="page-link" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
          <span class="sr-only">Next</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted} from 'vue';

const pages = defineModel('pages', { type: Number, required: true });

const range = ref(11);
const page = ref(1);
let timer = null;
const emit  = defineEmits(['pagechange']);

const previousPage = () => {
  page.value -= 1;
  if (page.value < 1) {
    page.value = 1;
  }
};

const nextPage = () => {
  page.value += 1;
  if (page.value > pages.value) {
    page.value = pages.value;
  }
};

watch(page, (newPage, oldPage) => {
  if (newPage === oldPage) return
  clearTimeout(timer)
  timer = setTimeout(() => emit('pagechange', page.value), 0)
});

const startPage = computed(() => {
  console.log('rng:', range.value, pages.value);
  if (range.value > pages.value) {
    return 0;
  }

  let rangeValue = Math.round(range.value / 2);
  let start = page.value - rangeValue;
  if (start < 0) return 0;
  if (start > pages.value || start + range.value > pages.value) {
    return pages.value - range.value;
  }
  return start;
});

onMounted(() => {
      if (range.value > pages.value) {
        range.value = pages.value;
      }
});

onUnmounted(() => {
  clearTimeout(timer)
});

</script>

<style>
.page {
  display: block;
  margin: 0 auto;
}
</style>
