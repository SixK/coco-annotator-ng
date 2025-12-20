import { defineStore } from 'pinia';
import axios from 'axios';
import { readonly } from 'vue';

import { ref } from 'vue';

export const useInfoStore = defineStore('info', () => {
  const loading = ref(true);
  const success = ref(true);
  const allowRegistration = ref(true);
  const loginEnabled = ref(true);
  const version = ref('loading');
  const totalUsers = ref(1);
  const name = ref('COCO Annotator');
  const socket = ref(null);
  
  function getLoadingStatus() {
    return loading.value;
  }

  function setSocket(connected) {
      socket.value = connected;
    };
  function incrementUserCount() {
      totalUsers.value++;
    };

    async function getServerInfo() {
      loading.value = true;
      try {
        const response = await axios.get('/api/info/');
        const data = response.data;
        loading.value = false;
        success.value = true;
        version.value = data.git.tag;
        allowRegistration.value = data.allow_registration;
        loginEnabled.value = data.login_enabled;
        totalUsers.value = data.total_users;
      } catch (error) {
        loading.value = false;
        success.value = false;
        version.value = 'unknown';
      }
    };


  return { loading, success,  allowRegistration, 
                  loginEnabled, version, totalUsers, name, 
                  socket, getLoadingStatus, getServerInfo, incrementUserCount, setSocket};
});
