import axios from "axios";

const baseURL = "/api/user/";

export default {
  get() {
    return axios.get(baseURL);
  },
  register(credentials) {
    return axios.post(baseURL + "register", credentials);
  },
  login(credentials) {
    return axios.post(baseURL + "login", credentials);
  },
  logout() {
    return axios.get(baseURL + "logout");
  },
  changePassword(payload) {
    return axios.post(baseURL + "password", payload);
  }
};
