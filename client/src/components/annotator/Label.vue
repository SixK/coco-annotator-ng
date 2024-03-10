<template>
  <div
    v-show="show"
    class="card"
    @click="click"
  >
    <div
      :id="'heading' + category.id"
      class="card-header"
    >
      <div :style="{ color: isSelected ? 'white' : 'gray' }">
        <div>
          <i
            v-if="isSelected"
            class="fa fa-check-square-o category-icon"
          />
          <i
            v-else
            class="fa fa-square-o category-icon"
          />
        </div>

        <span
          class="btn btn-link btn-sm collapsed category-text"
          style="color: inherit"
          aria-expanded="false"
        >
          {{ category.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue';

const category = defineModel('category', { type: Object, required: true });
const categoryIds = defineModel('categoryIds', { type: Array, required: true });
const search = defineModel('search', { type: String, required: true });

const emit = defineEmits(['update']);


const show = computed(() => {
  let searchLower = search.value.toLowerCase();
  if (searchLower.length === 0) return true;
  return category.value.name.toLowerCase().includes(searchLower);
});
const isSelected = computed(() => {
  if (categoryIds.value == undefined) return false;
  return categoryIds.value.indexOf(category.value.id) > -1;
});
const click = () => {
  console.log('label clicked:', categoryIds.value);
  let copy = categoryIds.value.slice();
  if (!isSelected.value) {
    copy.push(category.value.id);
  } else {
    copy.splice(copy.indexOf(category.value.id), 1);
  }
  emit('update', copy);
};
</script>

<style scoped>
.list-group-item {
  height: 22px;
  font-size: 13px;
  padding: 2px;
  background-color: #404552;
}

.category-icon {
  display: block;
  float: left;
  margin: 0;
  padding: 5px 10px 5px 10px;
}

.btn-link {
  margin: 0;
  padding: 0;
}
.annotation-icon {
  margin: 0;
  padding: 3px;
}

.card-header {
  display: block;
  margin: 0;
  padding: 0;
}

.card {
  background-color: #4b5162;
}
</style>
