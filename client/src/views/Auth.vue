<template>
  <div class="bg-light">
    <div style="padding-top: 55px" />
    <div
      class="album py-5 container"
      style="overflow: auto; height: calc(100vh - 55px)"
    >
      <div class="row">
        <div class="col-sm text-left">
          <!-- Change this section to whatever you would like -->
          <h1>COCO Annotator</h1>
          <hr>
          <div v-if="totalUsers === 0">
            <h3>You have successfully installed COCO Annotator!</h3>
            <p>Use the registeration form to create an admin account</p>
            <p>
              If you have any questions please checkout the
              <a href="https://github.com/jsbroks/coco-annotator/wiki">wiki</a>
              before posting
              <a href="https://github.com/jsbroks/coco-annotator/issues">issues</a>.
            </p>
          </div>
          <div v-else>
            <p>
              COCO Annotator is a web-based image annotation tool designed for
              versatility and efficiently label images to create training data
              for image localization and object detection.
              <br><br>
              Login to create a datasets.
              <br><br>
              Find out more
              <a href="https://github.com/jsbroks/coco-annotator">Github</a>
            </p>
          </div>
          <!-- End of section -->
        </div>
        <div class="col-sm">
          <ul
            class="nav nav-tabs"
            role="tablist"
          >
            <li
              v-show="totalUsers !== 0"
              class="nav-item"
            >
              <a
                id="home-tab"
                class="nav-link"
                :class="{ active: tab === 'login' }"
                data-bs-toggle="tab"
                href="#login"
                role="tab"
                aria-controls="home"
                aria-selected="true"
                @click="tab = 'login'"
              >
                Login
              </a>
            </li>
            <li
              v-show="showRegistrationForm"
              class="nav-item"
            >
              <a
                id="contact-tab"
                ref="registerTab"
                class="nav-link"
                :class="{ active: tab === 'register' }"
                data-bs-toggle="tab"
                href="#register"
                role="tab"
                aria-controls="contact"
                aria-selected="false"
                @click="tab = 'register'"
              >
                Register
              </a>
            </li>
          </ul>
          <div
            class="tab-content panel border-bottom border-right border-left text-left"
          >
            <div
              id="login"
              class="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="login-tab"
            >
              <form
                ref="loginFormContainer"
                class="v1-parent"
              >
                <div class="form-group">
                  <label>Username</label>
                  <input
                    v-model="loginForm.username"
                    type="text"
                    class="form-control"
                    required
                  >
                  <div class="invalid-feedback">
                    Invalid username format
                  </div>
                </div>
                <div class="form-group">
                  <label>Password</label>
                  <input
                    v-model="loginForm.password"
                    type="password"
                    class="form-control"
                  >
                </div>
                <button
                  type="submit"
                  class="btn btn-primary btn-block"
                  :class="{ disabled: !loginValid }"
                  @click.prevent="loginUser"
                >
                  Login
                </button>
              </form>
            </div>
            <div
              id="register"
              class="tab-pane fade"
              role="tabpanel"
              aria-labelledby="register-tab"
            >
              <div v-if="!showRegistrationForm">
                You are not allowed to register new accounts
              </div>
              <form
                v-else
                ref="registerFormContainer"
                class="vld-parent"
              >
                <div
                  class="form-group"
                  novalidate=""
                >
                  <label>Full Name <span class="text-mute">(Optional)</span></label>
                  <input
                    v-model="registerForm.name"
                    type="text"
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label>Username</label>
                  <input
                    v-model="registerForm.username"
                    :class="inputUsernameClasses(registerForm.username)"
                    type="text"
                    class="form-control"
                    required
                  >
                  <div class="invalid-feedback">
                    Invalid username format
                  </div>
                </div>

                <div class="form-group">
                  <label>Password</label>
                  <input
                    v-model="registerForm.password"
                    :class="inputPasswordClasses(registerForm.password)"
                    type="password"
                    class="form-control"
                    required
                  >
                  <div class="invalid-feedback">
                    Minimum length of 5 characters.
                  </div>
                </div>

                <div class="form-group">
                  <label>Confirm Password</label>
                  <input
                    v-model="registerForm.confirmPassword"
                    :class="{
                      'is-valid':
                        registerForm.confirmPassword.length > 0 &&
                        registerForm.confirmPassword === registerForm.password,
                    }"
                    type="password"
                    class="form-control"
                  >
                </div>
                <button
                  type="submit"
                  class="btn btn-primary btn-block"
                  :class="{ disabled: !registerValid }"
                  @click.prevent="registerUser"
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useAxiosRequest from "@/composables/axiosRequest";
import { ref, computed, watch, inject, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import {useLoading} from 'vue-loading-overlay'

import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();
import { useProcStore } from "@/store/index";
const procStore = useProcStore();
import { useInfoStore } from "@/store/info";
const infoStore = useInfoStore();

const {axiosReqestError, axiosReqestSuccess} = useAxiosRequest();
const router = useRouter();
const $loading = useLoading({});

const props = defineProps({
  redirect: {
    type: Object,
    default: () => ({ name: "datasets" })
  }
});

const redirect = ref(props.redirect);
const registerTab = ref(null);
const tab = ref("login")
const registerForm = ref({
    loading: false,
    name: "",
    username: "",
    password: "",
    confirmPassword: ""
});

const registerFormContainer = ref(null);
const loginFormContainer=ref(null);

const loginForm = ref({
    loading: false,
    username: "",
    password: ""
});

const registerUser = () => {
  if (!registerValid.value) return;
  const loader = $loading.show({
    container: registerFormContainer.value,
    color: "#383c4a"
  });

  const data = {
    user: registerForm.value,
    successCallback: () => {
      loader.hide();
      infoStore.incrementUserCount();
      router.push(redirect.value);
    },
    errorCallback: (error) =>
      axiosReqestError("User Registration", error.response.data.message)
  };
  console.log('zzzzzzzzz - try to register...');
  authStore.register(data);
};

const loginUser = () => {
  if (!loginValid.value) return;

  const loader = $loading.show({
    container: registerFormContainer.value,
    color: "#383c4a"
  });

  const data = {
    user: loginForm.value,
    successCallback: () => {
      loader.hide();
      router.push(redirect.value);
    },
    errorCallback: (error) =>
      axiosReqestError("User Login", error.response.data.message),
  };
  authStore.login(data);
};

const validUsername = (username) => {
      return /^[0-9a-zA-Z_.-]+$/.test(username);
};

const validPassword = (password) => {
      return password.length > 5;
};

const inputUsernameClasses = (username) => {
      let isValid = validUsername(username);

      return {
        "is-invalid": !isValid && username.length != 0,
        "is-valid": isValid
      };
};

const inputPasswordClasses = (password) => {
      let isValid = password.length > 4;

      return {
        "is-invalid": !isValid && password.length != 0,
        "is-valid": isValid
      };
};

const totalUsers = computed(() => {
    return infoStore.totalUsers;
});

const allowRegistration = computed(() => {
    return infoStore.allowRegistration;
});

const showRegistrationForm = computed(() => {
    return totalUsers.value == 0 || allowRegistration.value;
});
  
const isAuthenticatePending = computed(() => {
    return infoStore.isAuthenticatePending;
});

const registerValid = computed(() => {
    if (!validUsername(registerForm.value.username)) return false;
    if (registerForm.value.password.length < 5) return false;
    if (registerForm.value.password !== registerForm.value.confirmPassword) return false;
    return true;
});
  
const loginValid = computed(() => {
    if (!validUsername(loginForm.value.username)) return false;
    if (loginForm.value.password.length == 0) return false;
    return true;
});


watch(
  () => totalUsers, 
  (users) => {
      if (users === 0) {
        registerTab.value.click();
      }
});

watch(
  () => isAuthenticatePending.value, 
  (pending) => {
      if (pending) {
        router.push({
          name: 'datasets'
        });
      }
}, { immediate: true });

</script>

<style scoped>
.panel {
  padding: 30px;
  background-color: white;
}

.text-mute {
  font-size: 10px;
}

.btn-button {
  margin-top: 10px;
}
</style>
