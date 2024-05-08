<template>
  <div class="tags-input-root">
    <div :class="wrapperClass + ' tags-input'">
      <span
        v-for="(badge, index) in tagBadges"
        :key="index"
        class="tags-input-badge tags-input-badge-pill tags-input-badge-selected-default"
      >
        <span>{{ badge }}</span>

        <i
          href="#"
          class="tags-input-remove"
          @click.prevent="removeTag(index)"
        />
      </span>

      <input
        ref="taginput"
        v-model="input"
        type="text"
        :placeholder="showPlaceholder ? placeholder : ''"
        @keydown.enter.prevent="tagFromInput"
        @keydown.8="removeLastTag"
        @keydown.down="nextSearchResult"
        @keydown.up="prevSearchResult"
        @keydown.exact="onKeyDown"
        @keyup.esc="ignoreSearchResults"
        @keyup.exact="searchTag"
        @focus="onFocus"
        @blur="hideTypeahead"
        @value="tags"
      >

      <input
        v-if="elementId"
        :id="elementId"
        v-model="hiddenInput"
        type="hidden"
        :name="elementId"
      >
    </div>

    <!-- Typeahead/Autocomplete -->
    <div v-show="searchResults.length">
      <p
        v-if="typeaheadStyle === 'badges'"
        :class="`typeahead-${typeaheadStyle}`"
      >
        <span
          v-for="(tag, index) in searchResults"
          :key="index"
          class="tags-input-badge"
          :class="{
            'tags-input-typeahead-item-default': index != searchSelection,
            'tags-input-typeahead-item-highlighted-default':
              index == searchSelection,
          }"
          @mouseover="searchSelection = index"
          @mousedown.prevent="tagFromSearchOnClick(tag)"
          v-text="tag.text"
        />
      </p>

      <ul
        v-else-if="typeaheadStyle === 'dropdown'"
        :class="`typeahead-${typeaheadStyle}`"
      >
        <li
          v-for="(tag, index) in searchResults"
          :key="index"
          :class="{
            'tags-input-typeahead-item-default': index != searchSelection,
            'tags-input-typeahead-item-highlighted-default':
              index == searchSelection,
          }"
          @mouseover="searchSelection = index"
          @mousedown.prevent="tagFromSearchOnClick(tag)"
          v-text="tag.text"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue';
import { toRaw, toRef, ref, computed, watch, onMounted } from 'vue';

const emit = defineEmits(["initialized", "tag-added", "tags-updated", "tag-removed"]);

const elementId = defineModel('elementId', { type: String, required: true });
const existingTags = defineModel('existingTags', { type: Object,      default: () => {return {}} });
const selectedCategories = defineModel('selectedCategories', { type: [Array, String],      default: () => {return []} });
const typeahead = defineModel('typeahead', { type: Boolean, default: false });
const typeaheadStyle = defineModel('typeaheadStyle', { type: String, default: "badges" });
const typeaheadActivationThreshold = defineModel('typeaheadActivationThreshold', { type: Number, default: 1 });
const typeaheadMaxResults = defineModel('typeaheadMaxResults', { type: Number, default: 0 });
const placeholder = defineModel('placeholder', { type: String, default: "Add a category" });
const limit = defineModel('limit', { type: Number, default: 0 });
const onlyExistingTags = defineModel('onlyExistingTags', { type: Boolean, default: false });
const deleteOnBackspace = defineModel('deleteOnBackspace', { type: Boolean, default: true });
const allowDuplicates = defineModel('allowDuplicates', { type: Boolean, default: false });
const validate = defineModel('validate', { type: Function, default: () => true });
const addTagsOnComma = defineModel('addTagsOnComma', { type: Boolean, default: false });
const wrapperClass = defineModel('wrapperClass', { type: String, default: "tags-input-wrapper-default" });

const badgeId = ref(0);
const tagBadges = ref([]);
const tags = ref([]);
const input = ref("");
const oldInput = ref("");
const hiddenInput = ref("");
const searchResults = ref([]);
const searchSelection = ref(0);
const taginput = ref(null);


const showPlaceholder = computed(() => {
  if (onlyExistingTags.value) {
    if (selectedCategories.value.length === Object.keys(existingTags.value).length) {
      return false;
    }
  }
  return true;
});

watch(
  () => selectedCategories.value,
  () => {
    tagsFromValue();
  }
);

watch(
  tags.value,
  (newVal, oldVal) => {
      hiddenInput.value = newVal.join(",");
      // don't have to emit thank's to defineModel, we simply attribute new value
      // emit("update:selected-categories", newVal);
      selectedCategories.value = newVal;
});


const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const tagFromInput = () => {
      let hasSpace = input.value.trim() !== input.value;
      if (searchResults.value.length && searchSelection.value >= 0 && !hasSpace) {
        tagFromSearch(searchResults.value[searchSelection.value]);
        input.value = "";
      } else {
        let text = input.value.trim();
        if (!onlyExistingTags.value && text.length && validate.value(text)) {
          input.value = "";
          let slug = makeSlug(text);
          let existingTag = existingTags.value[slug];
          slug = existingTag ? slug : text;
          text = existingTag ? existingTag : text;
          addTag(slug, text);
        }
      }
};


const tagFromSearchOnClick = (tag) => {
      tagFromSearch(tag);
      taginput.value.blur();
};

const tagFromSearch = (tag) => {
      searchResults.value = [];
      input.value = "";
      oldInput.value = "";
      addTag(tag.slug, tag.text);
};

const makeSlug = (value) => {
      return value.toLowerCase().replace(/\s/g, "-");
};

const addTag = (slug, text) => {
  if (limit.value > 0 && tags.value.length >= limit.value) {
    return false;
  }
  if (!tagSelected(slug)) {
    tagBadges.value.push(text.replace(/\s/g, "&nbsp;"));
    tags.value.push(slug);
  }
  emit("tag-added", slug);
  emit("tags-updated");
}

const removeLastTag = () => {
  if (!input.value.length && deleteOnBackspace.value) {
    removeTag(tags.value.length - 1);
  }
}

const removeTag = (index) => {
  let slug = tags.value[index];

  tags.value.splice(index, 1);
  tagBadges.value.splice(index, 1);

  // Emit events
  emit("tag-removed", slug);
  emit("tags-updated");
};

const searchTag = () => {
  if (typeahead.value !== true) return;

  const inputValue = input.value.trim().toLowerCase();
  const shouldSearch =
    inputValue !== oldInput.value ||
    (searchResults.value.length === 0 && typeaheadActivationThreshold.value === 0);

  if (shouldSearch) {
    searchResults.value = [];
    searchSelection.value = 0;

    if (
      inputValue.length >= typeaheadActivationThreshold.value ||
      typeaheadActivationThreshold.value === 0
    ) {
      searchResults.value = Object.entries(existingTags.value)
        .filter(([slug, text]) => {
          return text.toLowerCase().includes(inputValue) && !tagSelected(slug);
        })
        .map(([slug, text]) => ({ slug, text }));

      searchResults.value.sort((a, b) => a.text.localeCompare(b.text));

      if (typeaheadMaxResults.value > 0) {
        searchResults.value = searchResults.value.slice(0, typeaheadMaxResults.value);
      }
    }

    oldInput.value = inputValue;
  }
};

const onFocus = () => {
      searchTag();
};

const hideTypeahead = () => {
      if (!input.value.length) {
        nextTick(() => {
            ignoreSearchResults();
        });
      }
};

const nextSearchResult = () => {
  if (searchSelection.value + 1 <= searchResults.value.length - 1) {
    searchSelection.value++;
  }
};

const prevSearchResult = () => {
  if (searchSelection.value > 0) {
    searchSelection.value--;
  }
};

const ignoreSearchResults = () => {
  searchResults.value = [];
  searchSelection.value = 0;
};

const clearTags = () => {
  tags.value.splice(0, tags.value.length);
  tagBadges.value.splice(0, tagBadges.value.length);
}

const tagsFromValue = () => {
    // const rawArray = toRaw(selectedCategories.value);

      if (selectedCategories.value && selectedCategories.value.length) {
        const newTags = Array.isArray(selectedCategories.value)
          ? selectedCategories.value
          : selectedCategories.value.split(',');
        if (JSON.stringify(newTags) === JSON.stringify(tags.value)) {
          return;
        }
        clearTags();
        newTags.forEach((slug) => {
          const existingTag = existingTags.value[slug];
          const text = existingTag ? existingTag : slug;
          addTag(slug, text);
        });
      } else {
        if (tags.value.length === 0) {
          return;
        }
        clearTags();
      }
};

const tagSelected = (slug) => {
  if (allowDuplicates.value || !slug) {
    return false;
  }
  const searchSlug = makeSlug(slug);
  return tags.value.includes(searchSlug);
};

const onKeyDown = (e) => {
  // Insert a new tag on comma keydown if the option is enabled
  if (e.key === ",") {
    if (addTagsOnComma.value) {
      // The comma shouldn't actually be inserted
      e.preventDefault();
      // Add the inputed tag
      tagFromInput();
    }
  }
};

onMounted(() => {
  tagsFromValue();
  // Emit an event
  emit("initialized");
});

</script>

<style>
.tags-input-root {
  position: relative;
}
</style>
