import axios from "axios";
import { downloadBlob } from "@/libs/download";

const baseURL = "/api/export";

export default {
  download(id, dataset) {
    return axios({
      url: `${baseURL}/${id}/download`,
      method: "GET",
      responseType: "blob"
    }).then(response => {
      // downloadBlob() removes the temporary <a> and revokes the blob URL,
      // which used to leak on every export download
      downloadBlob(response.data, `${dataset}-${id}.json`);
    });
  }
};
