import axios from "axios";

const baseURL = "/api/category/";

export default {
  allData(params) {
    return axios.get(baseURL + "data", {
      params: {
        ...params
      }
    });
  },
  create(create) {
    return axios.post(baseURL, { ...create });
  },
  update(id, params) {
    return axios.put(baseURL + id, params);
  },
  delete(id) {
    return axios.delete(baseURL + id);
  }
};
