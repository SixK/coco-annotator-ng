import { defineStore } from 'pinia';
import axios from 'axios';
import useAxiosRequest from "@/composables/axiosRequest";
const { axiosReqestError, axiosReqestSuccess } = useAxiosRequest();
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // ============ STATE ============
  const isAuthenticated = ref(false);
  const isAuthenticatePending = ref(false);
  const isLogoutPending = ref(false);
  const error = ref(null);
  const user = ref(null);
  
  // ============ COMPUTED ============
  const isAdmin = computed(() => {
    return user.value?.is_admin ?? false;
  });
    
  const loginEnabled = computed(() => {
    if (!user.value) return false;
    return user.value.anonymous ?? false;
  });
    
  const isLoading = computed(() => {
    return isAuthenticatePending.value || isLogoutPending.value;
  });
    
  // ============ PRIVATE HELPERS ============
  const _setLoggingIn = () => {
    isAuthenticatePending.value = true;
    error.value = null;
  };
    
  const _setLoggedIn = (userData) => {
    user.value = userData;
    isAuthenticatePending.value = false;
    isAuthenticated.value = true;
    error.value = null;
  };
    
  const _setLoggingOut = () => {
    isLogoutPending.value = true;
    error.value = null;
  };
    
  const _setLoggedOut = () => {
    user.value = null;
    isAuthenticated.value = false;
    isLogoutPending.value = false;
    error.value = null;
  };
    
  const _setError = (err) => {
    error.value = err;
    isAuthenticatePending.value = false;
    isLogoutPending.value = false;
  };
    
  // ============ PUBLIC ACTIONS ============
  /**
   * Initialiser le state user depuis le backend
   */
  const initializeAuth = async () => {
    _setLoggingIn();
    try {
      const response = await axios.get('/api/user/');
      _setLoggedIn(response.data.user);
      return true;
    } catch (error) {
      _setLoggedOut();
      return false;
    }
  };
    
  /**
   * Enregistrer un nouvel utilisateur
   */
  const register = async (credentials) => {
    if (isAuthenticated.value) return false;

    _setLoggingIn();
    try {
      const response = await axios.post('/api/user/register', credentials);
      _setLoggedIn(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      _setError(error);

      axiosReqestError("User Registration", error.response.data.message);

      return { success: false, error };
    }
  };

  /**
   * Se connecter
   */
  const login = async (credentials) => {
    if (isAuthenticated.value) return false;

    _setLoggingIn();
    try {
      const response = await axios.post('/api/user/login', credentials);
      _setLoggedIn(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      _setError(error);

      axiosReqestError("User Login", error.response.data.message);

      return { success: false, error };
    }
  };

  /**
   * Se déconnecter
   */
  const logout = async () => {
    if (!isAuthenticated.value) return false;

    _setLoggingOut();
    try {
      await axios.get('/api/user/logout');
      _setLoggedOut();
      return true;
    } catch (error) {
      _setError(error);
      return false;
    }
  };

  /**
   * Changer le mot de passe
   */
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await axios.post('/api/user/password', {
        password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      axiosReqestSuccess(
            "Changing Password",
            "Password has been changed"
      );

      return { success: true, data: response.data };
    } catch (error) {
      _setError(error);

      axiosReqestError(
            "Changing Password",
            error.response.data.message
       );

      return { success: false, error };
    }
  };

  /**
   * Effacer l'erreur
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    isAuthenticated,
    isAuthenticatePending,
    isLogoutPending,
    error,
    // Computed
    isAdmin,
    loginEnabled,
    isLoading,
    // Actions
    initializeAuth,
    register,
    login,
    logout,
    changePassword,
    clearError
  };
});
