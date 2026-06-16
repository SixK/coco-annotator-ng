import { ref } from 'vue';
import {useToast} from 'vue-toast-notification';

export default function useAxiosRequest() {
  const $toast = useToast();
  const axiosRequestError = (title, message) => {
    let options = {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    };
    $toast.error(message);
    // $toast.error(message, title, options);
  };

  const axiosRequestSuccess = (title, message) => {
    let options = {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    };

    // $toast.success(message, title, options);
    $toast.success(message);
  };

  return {
    axiosRequestError,
    axiosRequestSuccess,
  };

}
