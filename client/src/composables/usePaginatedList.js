import { ref } from "vue";
import { useProcess } from "./useProcess";

/**
 * Shared state and loader for the paginated list views (datasets, categories,
 * dataset images, ...). It owns `page` / `pages` / `limit` / `total` and the
 * `updatePage(p)` callback used by `<Pagination>` and the Refresh buttons.
 *
 * @param {Object}   options
 * @param {(params: Object) => Promise} options.fetchPage
 *        API call, receives `{ page, limit, ...params }` and returns the axios response.
 * @param {string}   [options.processLabel="Loading data"]
 *        Label registered in the proc store while the request runs.
 * @param {(data: Object) => Object} [options.getPagination]
 *        Extracts `{ pages, total }` from the response payload (`page` is never
 *        read back — see `updatePage`). Defaults to `data.pagination`;
 *        use `(data) => ({ pages: data.pages, total: data.total })` when the
 *        pagination fields sit at the top level of the payload.
 * @param {(response: Object) => void} [options.handleResponse]
 *        Applies the payload to the view refs (items, extra collections, ...).
 * @param {() => Object} [options.params]
 *        Extra query params computed at call time and merged into every request.
 * @param {(response: Object) => void} [options.onLoaded]
 *        Extra work once the list is applied (nested requests, restore focus...).
 * @param {(error: any) => void} [options.onError]
 *        Called when the request fails (e.g. `axiosRequestError`).
 * @param {boolean} [options.syncPage=true]
 *        When `updatePage()` is called without argument, reuse the current
 *        `page` value. Set to false to let the backend apply its default page.
 * @param {number}  [options.initialPage=1]
 * @param {number}  [options.initialLimit=50]
 * @returns {{ page: import('vue').Ref<number>, pages: import('vue').Ref<number>,
 *             limit: import('vue').Ref<number>, total: import('vue').Ref<number>,
 *             updatePage: (p?: number) => Promise }}
 */
export default function usePaginatedList({
  fetchPage,
  processLabel = "Loading data",
  getPagination = null,
  handleResponse = null,
  params = null,
  onLoaded = null,
  onError = null,
  syncPage = true,
  initialPage = 1,
  initialLimit = 50,
} = {}) {
  const { withProcess } = useProcess();

  const page = ref(initialPage);
  const pages = ref(1);
  const limit = ref(initialLimit);
  const total = ref(0);

  const readPagination = (data) => {
    const pagination = (getPagination ? getPagination(data) : data.pagination) || {};
    if (pagination.pages != null) pages.value = pagination.pages;
    if (pagination.total != null) total.value = pagination.total;
    return pagination;
  };

  const updatePage = (p) => {
    // callers may bind non page payloads directly (e.g. `@submit="updatePage"`)
    const requestedPage = Number.isFinite(p) && p > 0 ? p : null;
    if (requestedPage != null) page.value = requestedPage;
    // backend pages are 1-based: never send 0 or a negative page (mongo `skip`)
    const startAt = syncPage ? page.value : requestedPage;

    return withProcess(processLabel, async () => {
      const response = await fetchPage({
        page: startAt > 0 ? startAt : null,
        limit: limit.value,
        ...(params ? params() : {}),
      });

      readPagination(response.data);
      // note: `page` is never read back from the payload — the backend echoes
      // the page it served as a *0-based* index, and writing it back into the
      // ref would re-trigger `pagechange` → `updatePage` → page-1, in a loop
      // down to page 1.

      // The page we asked for does not exist anymore (last item of the last page
      // deleted, filtered list got shorter, ...): reload once on a page the
      // backend can actually serve. This must not rely on the `<Pagination>`
      // widget: it is unmounted as soon as the list is empty, so its
      // `pagechange` event would never fire.
      const current = startAt ?? page.value;
      const clampedPage = Math.max(1, Math.min(current, pages.value));
      if (clampedPage !== current) {
        return updatePage(clampedPage);
      }

      if (handleResponse) handleResponse(response);
      if (onLoaded) onLoaded(response);

      return response;
    }).catch((error) => {
      if (onError) onError(error);
      // keep the rejection: callers may await/catch it themselves
      throw error;
    });
  };

  return { page, pages, limit, total, updatePage };
}
