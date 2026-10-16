// libs/download.js
//
// Single place for the "save this response as a file" logic, which used to be
// copied in DatasetCard.vue, ImageCard.vue, DownloadButton.vue and
// models/exports.js.

import axios from "axios";

/**
 * Triggers a browser download for `uri` under the given file name.
 *
 * The temporary <a> has to be in the document for the click to work in every
 * browser, so it is inserted then removed: without `remove()` one orphan node
 * piles up in `document.body` on every download.
 */
export function downloadURI(uri, exportName) {
  const link = document.createElement("a");
  link.href = uri;
  link.download = exportName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Downloads `data` (a JS value) as a JSON file.
 */
export function downloadJson(data, filename) {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
  downloadURI(dataStr, filename);
}

/**
 * Downloads a binary payload (already fetched with `responseType: "blob"`).
 *
 * A blob URL pins its payload in memory until the page is unloaded: revoke it
 * right after the click, otherwise every export leaves its content behind.
 */
export function downloadBlob(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]));
  downloadURI(url, filename);
  // Revoked on the next tick: some browsers resolve the blob URL
  // asynchronously and would cancel the download otherwise.
  setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

/**
 * Fetches a JSON endpoint and downloads the answer. Returns the request
 * promise so callers can chain (loading process, error reporting, ...).
 */
export function fetchAndDownloadJson(url, filename) {
  return axios.get(url).then((response) => {
    downloadJson(response.data, filename);
  });
}
