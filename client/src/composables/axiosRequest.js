import { ref } from 'vue';
import {useToast} from 'vue-toast-notification';

export default function useAxiosRequest() {
  const $toast = useToast();
  const axiosReqestError = (title, message) => {
    let options = {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    };
    $toast.error(message);
    // $toast.error(message, title, options);
  };

  const axiosReqestSuccess = (title, message) => {
    let options = {
      progressBar: true,
      positionClass: 'toast-bottom-left',
    };

    // $toast.success(message, title, options);
    $toast.success(message);
  };

  return {
    axiosReqestError,
    axiosReqestSuccess,
  };

}
