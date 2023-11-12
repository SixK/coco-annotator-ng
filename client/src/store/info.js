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
        console.log('it is ok - set loading to false');
        loading.value = false;
        success.value = true;
        version.value = data.git.tag;
        allowRegistration.value = data.allow_registration;
        loginEnabled.value = data.login_enabled;
        totalUsers.value = data.total_users;
      } catch (error) {
          console.log('something is wrong - set loading to false');
        loading.value = false;
        success.value = true;
        version.value = 'unknown';
      }
    };


  return { loading, success,  allowRegistration, 
                  loginEnabled, version, totalUsers, name, 
                  socket, getLoadingStatus, getServerInfo, incrementUserCount, setSocket};
});

/*
export const useInfoStore = defineStore({
  id: 'info',
  state: () => ({
    loading: true,
    success: true,
    allowRegistration: true,
    loginEnabled: true,
    version: 'loading',
    totalUsers: 1,
    name: 'COCO Annotator',
    socket: null,
  }),
  getters: {
      getLoadingStatus: (state) => state.loading,
  },
  actions: {
    setSocket(connected) {
      this.socket = connected;
    },
    incrementUserCount() {
      this.totalUsers++;
    },
    async getServerInfo() {
      this.loading = true;
      try {
        const response = await axios.get('/api/info/');
        const data = response.data;
        console.log('it is ok - set loading to false');
        this.loading = false;
        this.success = true;
        this.version = data.git.tag;
        this.allowRegistration = data.allow_registration;
        this.loginEnabled = data.login_enabled;
        this.totalUsers = data.total_users;
      } catch (error) {
          console.log('something is wrong - set loading to false');
        this.loading = false;
        this.success = true;
        this.version = 'unknown';
      }
    },
  },
});
*/
/*
// Create the Pinia store
const store = useInfoStore();

// Export the store as a readonly instance
export default readonly(store);
*/
