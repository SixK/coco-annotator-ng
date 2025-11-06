// useAnnotatorData.js

import { ref, nextTick } from 'vue';

export default function useAnnotatorData({ state, axios, router, axiosReqestError, toolspanel, settings, categorylist,image, updateImageName }) {
  // state: expects (image, categories, dataset, loading, annotating, procStore) in state object
  
  const showAll = () => {
      if (categorylist.value == null) return;

      categorylist.value.forEach((cat) => {
            cat.isVisible = cat.category.annotations.length > 0;
      });
  };

  const hideAll = () => {
      if (categorylist.value == null) return;

      categorylist.value.forEach((cat) => {
        cat.isVisible = false;
        cat.showAnnotations = false;
      });
  };

  const getData = async (callback) => {
    const process = 'Loading annotation data';
    try {
      state.procStore.addProcess(process);
      const data = await fetchData();
      updateStateWithData(data);
      console.log('data.prefs:', data.preferences);
      handlePreferences(data.preferences);

      updateImageName(image.value.filename);

      // apply preferences or other side effects later if needed
      await nextTick();
      showAll();
      
      // showAll or other UI updates can be triggered by the caller
      if (typeof callback === 'function') callback();
    } catch (err) {
      handleFetchError(err);
    } finally {
      state.procStore.removeProcess(process);
    }
  };

  const fetchData = async () => {
    state.loading.data = true;
    try {
      const response = await axios.get('/api/annotator/data/' + state.image.value.id);
      return response.data;
    } finally {
      state.loading.data = false;
    }
  };

  const updateStateWithData = (data) => {
    // guard against malformed payloads
    state.image.value.metadata = (data.image && data.image.metadata) || {};
    state.image.value.filename = data.image?.file_name || '';
    state.image.value.next = data.image?.next ?? null;
    state.image.value.previous = data.image?.previous ?? null;
    state.image.value.categoryIds = data.image?.category_ids || [];
    state.annotating.value = data.image?.annotating || [];
    state.dataset.value = data.dataset || {};
    state.categories.value = data.categories || [];
    state.procStore.setDataset(state.dataset.value);
  };

  const handleFetchError = () => {
    axiosReqestError('Could not find requested image', 'Redirecting to previous page.');
    router.go(-1);
  };

  const setPreferences = (preferences) => {
    toolspanel.value.setPreferences(preferences);
    settings.value.setPreferences(preferences.settings || {});
  };

  const handlePreferences = (preferences) => {
    setPreferences(preferences);
  };

  return { getData, fetchData, updateStateWithData, showAll, hideAll };
}

