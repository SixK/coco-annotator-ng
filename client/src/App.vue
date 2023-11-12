<template>
  <div id="app">
    <NavBar v-show="showNavBar" />
    <RouterView :key="$route.fullPath" />
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar";

import { computed, watch, onMounted, inject, getCurrentInstance } from 'vue';

import {useToast} from 'vue-toast-notification';
const $toast = useToast();

import { storeToRefs } from 'pinia';

import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();

const localsocket  = inject('socket');

/*
import { useStore } from 'vuex';
const store = useStore();
*/


import { useInfoStore } from "@/store/info";
const infoStore = useInfoStore();
import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();


import {useLoading} from 'vue-loading-overlay'
const $loading = useLoading({});

const toAuthPage = () => {
  router.push({ name: 'authentication' });
};

let loader = null

const showNavBar = computed(() => {
      const notShow = ["authentication", "setup"];
      return notShow.indexOf(route.name) === -1;
});

const isAuthenticated = computed(() => {
      // return store.state.user.isAuthenticated;
     console.log('zzzzz - authenticated:', authStore.isAuthenticated);

      return authStore.isAuthenticated;
});

const isAuthenticatePending = computed(() => {
      return authStore.isAuthenticatePending;
      // return store.state.user.isAuthenticatePending;
});

const loginRequired = computed(() => {
      if (isAuthenticatePending.value) {
        return false;
      }
      return !isAuthenticated.value;
});

// const loading = computed(() => infoStore.loading);
const { loading, getLoadingStatus } = storeToRefs(infoStore);

/*
const loading = computed(() => {
     //  return store.state.info.loading;
     console.log('zzzzz - loading page:', infoStore.loading);
     return infoStore.loading;
});
*/

const socketConnection = computed(() => {
      // return store.state.info.socket;
      return infoStore.socket;
});

watch(
  () => loading.value, 
  (newVal) => {
  if (!newVal && loader != null) {
    loader.hide();
  }
}, { immediate: true });


watch(
  () => socketConnection.value, 
  (newVal) => {
      if (newVal) return;
      setTimeout(() => {
        if (socketConnection.value) return;
        let options = {
          positionClass: "toast-bottom-left"
        };
        $toast.warning(
          "Connection lost to the backend",
          "Connection Lost",
          options
        );
      }, 1000);
});

watch(
  () => loginRequired.value,
  (newValue) => {
    if (newValue) {
      toAuthPage();
    } else {
      if (router.name === 'authentication') {
        router.push({ name: 'datasets' });
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
    // app.__vue_app__.config.globalProperties.$socket.connect(() => {store.commit('info/socket', true);});
    // app.__vue_app__.config.globalProperties.$socket.disconnect(() => {store.commit('info/socket', false);});
    loader = $loading.show({
        height: 100
      });
      
    authStore.setUserInfo();
    //store.commit('user/setUserInfo');
    infoStore.getServerInfo();
    //store.commit('info/getServerInfo');

    
    // dunno why, but app.__vue_app__ is undefined here, let's consider socket are alaways connected
    // store.commit('info/socket', true);
    infoStore.setSocket(true);
});

</script>

<style>
@import "./assets/tagsStyle.css";
@import "./assets/tooltip.css";

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: inherit;
  width: inherit;
  overflow: hidden;
}
</style>
