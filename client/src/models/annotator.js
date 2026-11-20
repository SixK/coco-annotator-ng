import axios from "axios";

const baseURL = "/api/annotator/data";

export default {
  getData(imageId) {
    return axios.get(`${baseURL}/${imageId}`);
  },
  save(data) {
    return axios.post(baseURL, data);
  }
};
