import axios from "axios";
// import { useProcStore } from "@/store/index";
// import { axiosReqestError } from "@/composables/axiosRequest";

export default function useDataHandling(image, categories, dataset, categorylist, toolspanel, settings, procStore, mode, current, activeTool, zoom) {
  const save = (callback) => {
    const process = "Saving";
    procStore.addProcess(process);
    try {
      const data = prepareSaveData();
      sendDataToServer(data, callback);
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

  const sendDataToServer = (data, callback) => {
    axios.post("/api/annotator/data", JSON.stringify(data)).then(() => {
      if (callback) callback();
    });
  };

  return { save };
}
