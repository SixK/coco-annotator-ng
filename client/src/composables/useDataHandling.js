import axios from "axios";
// import { useProcStore } from "@/store/index";
// import { axiosReqestError } from "@/composables/axiosRequest";

export default function useDataHandling(image, categories, dataset, categorylist, toolspanel, settings, procStore, mode, current, activeTool, zoom) {
  // New async save() that returns a Promise
  const save = async () => {
    const process = "Saving";
    procStore.addProcess(process);
    try {
      const data = prepareSaveData();
      // sendDataToServer returns a Promise; await it so caller can know completion.
      const response = await sendDataToServer(data);

      // If you previously used callbacks to run something after save,
      // callers will now await save() and then continue.

      return response && response.data ? response.data : response;
    } catch (err) {
      // Re-throw so callers can catch/handle errors.
      // Optionally you can log or show an error notification here.
      throw err;
    } finally {
      procStore.removeProcess(process);
    }
  };

  const prepareSaveData = () => {
    const data = {
      mode: mode.value,
      user: exportUserTools(),
      dataset: dataset.value,
      image: exportImageData(),
      settings: exportSettings(),
      categories: []
    };
    if (categorylist.value && mode.value === "segment") {
      populateCategories(data);
    }
    return data;
  };

  const exportUserTools = () => ({
    ...toolspanel.value.exportUserTools(),
    settings: settings.value.exportSettings()
  });

  const exportImageData = () => ({
    id: image.value.id,
    metadata: settings.value.exportMetadata(),
    settings: {
      selectedLayers: current.value
    },
    category_ids: []
  });

  const exportSettings = () => ({
    activeTool: activeTool.value,
    zoom: zoom.value,
    tools: {}
  });

  const populateCategories = (data) => {
    image.value.categoryIds = [];
    categorylist.value.forEach((cat) => {
      const categoryData = cat.exportCategory();
      data.categories.push(categoryData);
      if (categoryData.annotations.length > 0) {
        const categoryIds = image.value.categoryIds;
        if (categoryIds.indexOf(categoryData.id) === -1) {
          categoryIds.push(categoryData.id);
        }
      }
    });
    data.image.category_ids = image.value.categoryIds;
  };

  // helper: send data to server (returns a Promise)
  const sendDataToServer = async (data) => {
    // Adjust endpoint/path to match backend route used previously.
    // If your previous implementation used a different endpoint or headers,
    // restore them here. This is a generic axios POST.
    return axios.post("/api/annotator/data", data);
  };

  return { save };
}
