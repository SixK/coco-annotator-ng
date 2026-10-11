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

const emit = defineEmits(["initialized", "tag-added", "tags-updated", "tag-removed", "selected-items"]);

// The only genuine two-way binding here: every parent uses
// `v-model:selectedItems` (or `:selectedItems` + `@selectedItems`).
const selectedItems = defineModel('selectedItems', { type: [Array, String], default: () => [] });

// Everything below is read-only configuration — never written by this component
// and never bound with `v-model:` by a parent, so the `update:*` emit that
// `defineModel` would declare could never fire. Plain props instead (Vue 3.5
// reactive props destructure: live bindings, no `.value`), with the exact same
// type/default options as before.
const {
  elementId,
  existingTags,
  typeahead,
  typeaheadStyle,
  typeaheadActivationThreshold,
  typeaheadMaxResults,
  placeholder,
  limit,
  onlyExistingTags,
  deleteOnBackspace,
  allowDuplicates,
  validate,
  addTagsOnComma,
  wrapperClass,
} = defineProps({
  elementId: { type: String, required: true },
  existingTags: { type: Object, default: () => ({}) },
  typeahead: { type: Boolean, default: false },
  typeaheadStyle: { type: String, default: "badges" },
  typeaheadActivationThreshold: { type: Number, default: 1 },
  typeaheadMaxResults: { type: Number, default: 0 },
  placeholder: { type: String, default: "Add a category" },
  limit: { type: Number, default: 0 },
  onlyExistingTags: { type: Boolean, default: false },
  deleteOnBackspace: { type: Boolean, default: true },
  allowDuplicates: { type: Boolean, default: false },
  validate: { type: Function, default: () => true },
  addTagsOnComma: { type: Boolean, default: false },
  wrapperClass: { type: String, default: "tags-input-wrapper-default" },
});

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
  if (onlyExistingTags) {
    if (selectedItems.value.length === Object.keys(existingTags).length) {
      return false;
    }
  }
  return true;
});

watch(
  selectedItems,
  () => {
    tagsFromValue();
  }
);

// Was `watch(tags.value, …)`: the array reference is captured at setup and is
// only ever mutated in place (push/splice), so this must be a deep watch on the
// ref — otherwise `hiddenInput` and the `selected-items` emit never update.
watch(
  tags,
  (newVal, oldVal) => {
      hiddenInput.value = newVal.join(",");
      // don't have to emit thank's to defineModel, we simply attribute new value
      emit("selected-items", newVal);
      selectedItems.value = newVal;
  },
  { deep: true }
);


const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const tagFromInput = () => {
      const hasSpace = input.value.trim() !== input.value;
      if (searchResults.value.length && searchSelection.value >= 0 && !hasSpace) {
        tagFromSearch(searchResults.value[searchSelection.value]);
        input.value = "";
      } else {
        let text = input.value.trim();
        if (!onlyExistingTags && text.length && validate(text)) {
          input.value = "";
          let slug = makeSlug(text);
          const existingTag = existingTags[slug];
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
  if (limit > 0 && tags.value.length >= limit) {
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
  if (!input.value.length && deleteOnBackspace) {
    removeTag(tags.value.length - 1);
  }
}

const removeTag = (index) => {
  const slug = tags.value[index];

  tags.value.splice(index, 1);
  tagBadges.value.splice(index, 1);

  // Emit events
  emit("tag-removed", slug);
  emit("tags-updated");
};

const searchTag = () => {
  if (typeahead !== true) return;

  const inputValue = input.value.trim().toLowerCase();
  const shouldSearch =
    inputValue !== oldInput.value ||
    (searchResults.value.length === 0 && typeaheadActivationThreshold === 0);

  if (shouldSearch) {
    searchResults.value = [];
    searchSelection.value = 0;

    if (
      inputValue.length >= typeaheadActivationThreshold ||
      typeaheadActivationThreshold === 0
    ) {
      searchResults.value = Object.entries(existingTags)
        .filter(([slug, text]) => {
          return text.toLowerCase().includes(inputValue) && !tagSelected(slug);
        })
        .map(([slug, text]) => ({ slug, text }));

      searchResults.value.sort((a, b) => a.text.localeCompare(b.text));

      if (typeaheadMaxResults > 0) {
        searchResults.value = searchResults.value.slice(0, typeaheadMaxResults);
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
      if (selectedItems.value && selectedItems.value.length) {
        const newTags = Array.isArray(selectedItems.value)
          ? selectedItems.value
          : selectedItems.value.split(',');
        if (JSON.stringify(newTags) === JSON.stringify(tags.value)) {
          return;
        }
        clearTags();
        newTags.forEach((slug) => {
          const existingTag = existingTags[slug];
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
  if (allowDuplicates || !slug) {
    return false;
  }
  const searchSlug = makeSlug(slug);
  return tags.value.includes(searchSlug);
};

const onKeyDown = (e) => {
  // Insert a new tag on comma keydown if the option is enabled
  if (e.key === ",") {
    if (addTagsOnComma) {
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
