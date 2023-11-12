import { defineStore } from 'pinia';
import axios from 'axios';

// const pinia = createPinia();

import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(true);
  const isAuthenticatePending = ref(true);
  const isLogoutPending = ref(false);
  const error = ref(null);
  const user  = ref(null);
  
  function isAdmin() {
      if (!user.value) return false;
      return user.value.is_admin;
    };
    
   function loginEnabled() {
      if (!user.value) return false;
      if (!user.value.anonymous) return true;
      return user.value.anonymous;
    };
    
    function loggingIn() {
      isAuthenticatePending.value = true;
    };
    
    function loggedIn(nuser) {
      user.value = nuser;
      isAuthenticatePending.value = false;
      isAuthenticated.value = true;
    };
    
    function setError(nerror) {
      error.value = nerror;
      isAuthenticatePending.value = false;
      isLogoutPending.value = false;
    };
    
    function loggingOut() {
      isLogoutPending.value = true;
    };
    
    function loggedOut() {
      user.value = null;
      isAuthenticated.value = false;
      isLogoutPending.value = false;
    };
    
    function clearError() {
      error.value = null;
    };
    
    async function setUserInfo() {
      isAuthenticatePending.value = true;
      try {
        const response = await axios.get('/api/user/');
        user.value = response.data.user;
        isAuthenticated.value = true;
        isAuthenticatePending.value = false;
      } catch (error) {
        isAuthenticated.value = false;
        isAuthenticatePending.value = false;
      }
    };
    
    async function register({ user, successCallback, errorCallback }) {
      if (isAuthenticated.value) return false;

      clearError();
      loggingIn();

      try {
        const response = await axios.post('/api/user/register', { ...user });
        loggedIn(response.data.user);
        if (successCallback != null) successCallback(response);
        return true;
      } catch (error) {
        setError(error);
        if (errorCallback != null) errorCallback(error);
        return false;
      }
    }; 

    async function login({ user, successCallback, errorCallback }) {
      if (isAuthenticated.value) return false;

      clearError();
      loggingIn();

      try {
        const response = await axios.post('/api/user/login', { ...user });
        loggedIn(response.data.user);
        if (successCallback != null) successCallback(response);
        return true;
      } catch (err) {
        setError(err);
        console.log('error:', err);
        if (errorCallback != null) errorCallback(err);
        return false;
      }
    };

    async function logout() {
      if (!isAuthenticated.value) return false;

      loggingOut();
      clearError();

      try {
        await axios.get('/api/user/logout');
        loggedOut();
        return true;
      } catch (error) {
        setError(error);
        return false;
      }
    };


  return {
    isAuthenticated,
    isAuthenticatePending,
    isLogoutPending,
    error,
    user,
    isAdmin,
    loginEnabled,
    loggingIn,
    loggedIn,
    setError,
    loggingOut,
    loggedOut,
    clearError,
    setUserInfo,
    register,
    login,
    logout,
  };

});

/*
export const useAuthStore = defineStore({ id: 'auth', 
  state: () => ({
      isAuthenticated: false,
      isAuthenticatePending: true,
      isLogoutPending: false,
      error: null,
      user: null
  }),
  getters: {
    isAdmin() {
      if (!this.user) return false;
      return this.user.is_admin;
    },
    loginEnabled() {
      if (!this.user) return false;
      if (!this.user.anonymous) return true;
      return this.user.anonymous;
    }
  },
  actions: {
    loggingIn() {
      this.isAuthenticatePending = true;
    },
    loggedIn(user) {
      this.user = user;
      this.isAuthenticatePending = false;
      this.isAuthenticated = true;
    },
    error(error) {
      this.error = error;
      this.isAuthenticatePending = false;
      this.isLogoutPending = false;
    },
    loggingOut() {
      this.isLogoutPending = true;
    },
    loggedOut() {
      this.user = null;
      this.isAuthenticated = false;
      this.isLogoutPending = false;
    },
    clearError() {
      this.error = null;
    },
    async setUserInfo() {
      this.isAuthenticatePending = true;
      try {
        const response = await axios.get('/api/user/');
        this.user = response.data.user;
        this.isAuthenticated = true;
        this.isAuthenticatePending = false;
      } catch (error) {
        this.isAuthenticated = false;
        this.isAuthenticatePending = false;
      }
    },
    async register({ commit }, { user, successCallback, errorCallback }) {
      if (this.isAuthenticated) return false;

      commit.clearError();
      commit.loggingIn();

      try {
        const response = await axios.post('/api/user/register', { ...user });
        commit.loggedIn(response.data.user);
        if (successCallback != null) successCallback(response);
        return true;
      } catch (error) {
        commit.error(error);
        if (errorCallback != null) errorCallback(error);
        return false;
      }
    },
    async login({ commit }, { user, successCallback, errorCallback }) {
      if (this.isAuthenticated) return false;

      commit.clearError();
      commit.loggingIn();

      try {
        const response = await axios.post('/api/user/login', { ...user });
        commit.loggedIn(response.data.user);
        if (successCallback != null) successCallback(response);
        return true;
      } catch (error) {
        commit.error(error);
        if (errorCallback != null) errorCallback(error);
        return false;
      }
    },
    async logout({ commit }) {
      if (!this.isAuthenticated) return false;

      commit.loggingOut();
      commit.clearError();

      try {
        await axios.get('/api/user/logout');
        commit.loggedOut();
        return true;
      } catch (error) {
        commit.error(error);
        return false;
      }
    }
  }
});
*/
