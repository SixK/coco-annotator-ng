import axios from "axios";

const baseURL = "/api/info/";

export default {
  get() {
    return axios.get(baseURL);
  }
};
