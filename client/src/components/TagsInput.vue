<template>
  <div class="tags-input-root">
    <div :class="wrapperClass + ' tags-input'">
      <span
        v-for="(badge, index) in tagBadges"
        :key="index"
        class="tags-input-badge tags-input-badge-pill tags-input-badge-selected-default"
      >
        <span v-html="badge" />

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

const emit = defineEmits(["update:selectedCategories", "selectedCategories", "initialized", 
// const emit = defineEmits([ "selectedCategories", "initialized", 
                                                     "tag-added", "tags-updated", "tag-removed"]);

const props = defineProps({
      elementId: {
      type: String,
      required: true,
    },
    existingTags: {
      type: Object,
      default: () => {
        return {};
      },
    },
    selectedCategories: {
      type: [Array, String],
      default: () => {
        return [];
      },
    },
    typeahead: {
      type: Boolean,
      default: false,
    },
    typeaheadStyle: {
      type: String,
      default: "badges",
    },
    typeaheadActivationThreshold: {
      type: Number,
      default: 1,
    },
    typeaheadMaxResults: {
      type: Number,
      default: 0,
    },
    placeholder: {
      type: String,
      default: "Add a category",
    },
    limit: {
      type: Number,
      default: 0,
    },
    onlyExistingTags: {
      type: Boolean,
      default: false,
    },
    deleteOnBackspace: {
      type: Boolean,
      default: true,
    },
    allowDuplicates: {
      type: Boolean,
      default: false,
    },
    validate: {
      type: Function,
      default: () => true,
    },
    addTagsOnComma: {
      type: Boolean,
      default: false,
    },
    wrapperClass: {
      type: String,
      default: "tags-input-wrapper-default",
    },
});

const badgeId = ref(0);
const tagBadges = ref([]);
const tags = ref([]);
const input = ref("");
const oldInput = ref("");
const hiddenInput = ref("");
const searchResults = ref([]);
const searchSelection = ref(0);
const typeaheadActivationThreshold = ref(props.typeaheadActivationThreshold);
const existingTags = ref(props.existingTags);
const onlyExistingTags = ref(props.onlyExistingTags);
const typeaheadMaxResults = ref(props.typeaheadMaxResults);
const deleteOnBackspace = ref(props.deleteOnBackspace);
const selectedCategories = ref(props.selectedCategories);
const taginput = ref(null);
// const validate = props.validate;


const showPlaceholder = computed(() => {

  if (onlyExistingTags.value) {
    // console.log('ppppp - showPlaceHolder:', selectedCategories.value.length, Object.keys(existingTags.value).length);
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
      emit("selectedCategories", newVal);
      emit("update:selectedCategories", newVal);
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
        if (!props.onlyExistingTags && text.length && props.validate(text)) {
          input.value = "";
          let slug = makeSlug(text);
          let existingTag = props.existingTags[slug];
          slug = existingTag ? slug : text;
          text = existingTag ? existingTag : text;
          addTag(slug, text);
        }
      }
};


const tagFromSearchOnClick = (tag) => {
      tagFromSearch(tag);
      
      // this.$refs["taginput"].blur();
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
  if (props.limit > 0 && tags.value.length >= props.limit) {
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
    if (props.typeahead === true) {
      if (
        oldInput.value != input.value ||
        (!searchResults.value.length && typeaheadActivationThreshold.value == 0)
      ) {
        searchResults.value = [];
        searchSelection.value = 0;
        let inputValue = input.value.trim();
        if (
          (inputValue.length && inputValue.length >= typeaheadActivationThreshold.value) ||
          typeaheadActivationThreshold.value == 0
        ) {
          for (let slug in props.existingTags) {
            let text = props.existingTags[slug].toLowerCase();
            if (
              text.search(escapeRegExp(inputValue.toLowerCase())) > -1 &&
              !tagSelected(slug)
            ) {
              searchResults.value.push({
                slug,
                text: props.existingTags[slug],
              });
            }
          }
          searchResults.value.sort((a, b) => {
            if (a.text < b.text) return -1;
            if (a.text > b.text) return 1;
            return 0;
          });
          if (typeaheadMaxResults.value > 0) {
            searchResults.value = searchResults.value.slice(
              0,
              typeaheadMaxResults.value
            );
          }
        }
        oldInput.value = input.value;
      }
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
    // code execution speed problem, tags are visible only id we output console.log !??
    
    const rawArray = toRaw(props.selectedCategories);

      // if (props.selectedCategories && props.selectedCategories.length) {
      if (selectedCategories.value && props.selectedCategories.length) {
        // const newTags = Array.isArray(props.selectedCategories)
        const newTags = Array.isArray(selectedCategories.value)
          ? selectedCategories.value
          : selectedCategories.value.split(',');
        if (JSON.stringify(newTags) === JSON.stringify(tags.value)) {
          return;
        }
        clearTags();
        newTags.forEach((slug) => {
          // const existingTag = props.existingTags[slug];
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
  if (props.allowDuplicates) {
    return false;
  }

  if (!slug) {
    return false;
  }
  let searchSlug = makeSlug(slug);
  let found = tags.value.find((value) => {
    return searchSlug == makeSlug(value);
  });
  return !!found;
}

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
