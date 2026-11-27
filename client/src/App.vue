<template>
  <div id="app">
    <NavBar v-show="showNavBar" />
    <RouterView :key="$route.path" />
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted, inject } from 'vue';

import NavBar from "@/components/NavBar";

import {useToast} from 'vue-toast-notification';
const $toast = useToast();

import { escapeHtml } from "@/composables/axiosRequest";

import { storeToRefs } from 'pinia';

import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();

const localsocket  = inject('socket');

import { useStores } from "@/composables/useStores"
const { auth, info } = useStores();

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

const loginRequired = computed(() => {
      if (auth.isAuthenticated == false && auth.isAuthenticatePending) {
        return true;
      }
      return !auth.isAuthenticated;
});

const { loading } = storeToRefs(info);

const socketConnection = computed(() => {
      return info.socket;
});

watch(
  loading, 
  (newVal) => {
  if (!newVal && loader != null) {
    loader.hide();
  }
}, { immediate: true });


watch(
  socketConnection, 
  (newVal) => {
      if (newVal) return;
      setTimeout(() => {
        if (socketConnection.value) return;
        $toast.warning(
          `<strong>Connection Lost</strong><br>${escapeHtml("Connection lost to the backend")}`,
          { position: 'bottom-left' }
        );
      }, 1000);
});

watch(
loginRequired,
(newValue) => {
    if (newValue) {
      toAuthPage();
    }
});

onMounted(async () => {
    loader = $loading.show({
        height: 100
      });
      
    // auth.setUserInfo();
    const authed = await auth.initializeAuth();
    if(authed == false) toAuthPage();
    info.getServerInfo();
    
    // Track the real socket connection state through the store. The toast
    // below fires only when the socket goes down.
    const onSocketConnected = () => info.setSocket(true);
    const onSocketDisconnected = () => info.setSocket(false);
    localsocket.on('connect', onSocketConnected);
    localsocket.on('disconnect', onSocketDisconnected);
});

onUnmounted(() => {
  localsocket.off('connect', onSocketConnected);
  localsocket.off('disconnect', onSocketDisconnected);
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
