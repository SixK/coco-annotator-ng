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
        v-for="pageIndex in pageRange"
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
import { computed, watch } from 'vue';

const pages = defineModel('pages', { type: Number, required: true });
const page = defineModel('page', { type: Number, required: true });

// Number of page buttons rendered. Computed instead of being clamped once in
// `onMounted`: the page count arrives asynchronously with the data, so a
// one-shot clamp would freeze the range at its initial (pre-load) value and
// never show the extra pages created later on.
const PAGE_RANGE = 11;
const pageRange = computed(() => Math.min(PAGE_RANGE, pages.value));

const emit  = defineEmits(['pagechange']);

const previousPage = () => {
  if (page.value > 1) {
    page.value -= 1;
  }
};

const nextPage = () => {
  if (page.value < pages.value) {
    page.value += 1;
  }
};

watch(page, (newPage, oldPage) => {
  if (newPage === oldPage) return
  emit('pagechange', page.value);
});

const startPage = computed(() => {
  if (pageRange.value > pages.value) {
    return 0;
  }

  const pageRangeValue = Math.round(pageRange.value / 2);
  const start = page.value - pageRangeValue;
  if (start < 0) return 0;
  if (start > pages.value || start + pageRange.value > pages.value) {
    return pages.value - pageRange.value;
  }
  return start;
});

</script>

<style>
.page {
  display: block;
  margin: 0 auto;
}
</style>
