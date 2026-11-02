import {useToast} from 'vue-toast-notification';

// vue-toast-notification v3 has no `title` option (API is
// `error(message, options?: ToastProps)`) and renders `message` as innerHTML,
// so the title is composed into the HTML below. Both parts are escaped: the
// message often comes from the server.
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Single place that turns a failure into text: the server's own message when
 * there is one, otherwise the JS error (a network drop has no `response`, so
 * reading `error.response.data.message` directly would throw). A plain string
 * is accepted as-is for the few sites that report a fixed message instead of
 * an error object.
 *
 * @param {unknown} error axios error, or the message to display
 * @returns {string}
 */
const messageOf = (error) =>
  typeof error === 'string'
    ? error
    : error?.response?.data?.message ||
      error?.message ||
      String(error ?? 'Unknown error');

// `position: 'bottom-left'` is the intent of the dead `positionClass` option
// this replaces (the library default is bottom-right).
const TOAST_OPTIONS = { position: 'bottom-left' };

export default function useAxiosRequest() {
  const $toast = useToast();

  const axiosRequestError = (title, error) => {
    $toast.error(
      `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(messageOf(error))}`,
      TOAST_OPTIONS
    );
  };

  const axiosRequestSuccess = (title, message) => {
    $toast.success(
      `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(message)}`,
      TOAST_OPTIONS
    );
  };

  return {
    axiosRequestError,
    axiosRequestSuccess,
  };

}
