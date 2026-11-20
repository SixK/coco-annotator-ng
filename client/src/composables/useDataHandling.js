import Annotator from "@/models/annotator";
// import { useProcStore } from "@/store/index";
import { useToolStore } from '@/store/toolStore';
import { useProcess } from "./useProcess";

export default function useDataHandling(image, categories, dataset, categorylist, toolspanel, settings, procStore, mode, current, zoom) {
    const toolStore = useToolStore();
    const { withProcess } = useProcess(procStore);

  // New async save() that returns a Promise. Errors are re-thrown by
  // withProcess so callers can catch/handle them.
  const save = () => withProcess("Saving", () => {
      const data = prepareSaveData();
      // sendDataToServer returns a Promise; callers chain on it to know
      // when the save completed.

      return sendDataToServer(data).then((response) => {
        return response && response.data ? response.data : response;
      });
  });

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
    activeTool: toolStore.activeTool,
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
    return Annotator.save(data);
  };

  return { save };
}
