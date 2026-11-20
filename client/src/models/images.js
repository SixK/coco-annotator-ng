import axios from "axios";

const baseURL = "/api/image/";

export default {
  delete(id) {
    return axios.delete(`${baseURL}${id}`);
  },
  copyAnnotations(fromId, imageId, categoryIds) {
    return axios.post(
      `${baseURL}copy/${fromId}/${imageId}/annotations`,
      { category_ids: categoryIds }
    );
  }
};
