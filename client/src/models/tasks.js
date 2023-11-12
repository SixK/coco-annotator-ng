import axios from "axios";

const baseURL = "/api/tasks/";

export default {
  all() {
    return axios.get(baseURL);
  },
  // seem's that delete does not return anything if errors are not catched !?
  async delete(id) {
    try {
        const response = await axios.delete(baseURL + id);
        return response.data;
    } catch(error) {
        console.log('axios delete error:', error);
        throw error;
    }
  },
  getLogs(id) {
    return axios.get(baseURL + id + "/logs");
  }
};
