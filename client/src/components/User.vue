<template>
  <div
    class="form-inline my-2 my-lg-0"
    style="margin-right: 10px"
  >
    <div class="dropdown show">
      <a
        id="dropdownMenuLink"
        class="btn-outline-light btn-sm dropdown-toggle"
        href="#"
        role="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {{ display }}
      </a>

      <ul
        class="dropdown-menu dropdown-menu-right"
        aria-labelledby="dropdownMenuLink"
        role="menu"
      >
        <li>
          <a
            v-show="authStore.isAdmin"
            class="dropdown-item"
            href="#"
          >
            <RouterLink
              class="route"
              to="/admin/panel"
            >Admin Panel</RouterLink>
          </a>
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
          >
            <RouterLink
              class="route"
              to="/user"
            >User Settings</RouterLink>
          </a>
        </li>
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click="logoutButton"
          >Logout</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from 'vue-router';

import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();

const router = useRouter();
const route = useRoute();
    
const logout = () => {
  authStore.logout()
};
    
const logoutButton = () => {
  if (route.name === "annotate") {
    router.replace({ name: "datasets" }, logout);
    return;
  }
  logout();
};
const user = computed(() => {
  return authStore.user;
});
const display = computed(() => {
  if (!user.value) return "";
  return user.value.name.length === 0
    ? user.value.username
    : user.value.name;
});
    
defineExpose({logoutButton, user, display});

</script>

<style scoped>
a:hover {
  text-decoration: none;
}
.route {
  color: black;
}
</style>
