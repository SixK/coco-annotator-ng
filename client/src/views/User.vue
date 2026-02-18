<template>
  <div>
    <div style="padding-top: 55px" />
    <div
      class="album py-5 bg-light"
      style="overflow: auto; height: calc(100vh - 55px)"
    >
      <div class="container">
        <h2 class="text-center">
          Hello, {{ displayName }}
        </h2>

        <br>
        <div style="text-align: left">
          <h4>Change Password</h4>
          <br>
          <form>
            <div class="form-group">
              <label>Current Password</label>
              <input
                v-model="changePassword.password"
                type="password"
                class="form-control"
                required
              >
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input
                v-model="changePassword.new_password"
                :class="inputPasswordClasses(changePassword.new_password)"
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
                v-model="changePassword.confirm_password"
                :class="{
                  'is-valid': isValidPassword()
                }"
                type="password"
                class="form-control"
              >
            </div>
            <button
              type="submit"
              class="btn btn-primary btn-block"
              @click.prevent="handleChangePassword"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, watch, computed } from "vue";

import { useAuthStore } from "@/store/user";
const authStore = useAuthStore();


const changePassword = ref({
        password: "",
        new_password: "",
        confirm_password: ""
      });

const validPassword = (password) => {
      return password.length > 4;
};

const isValidPassword = () => {
       return changePassword.value.confirm_password?.length > 0 &&
                    changePassword.value.confirm_password ===
                      changePassword.value.new_password
}

const handleChangePassword = async () => {
  const result = await authStore.changePassword(
    changePassword.value.password,
    changePassword.value.new_password,
    changePassword.value.confirm_password
  );

  if (result.success) {     // Success
    changePassword.value = { password: '', new_password: '', confirmPassword: '' };
  }
};

const inputPasswordClasses = (password) => {
      const isValid  = validPassword(password);

      return {
        "is-invalid": !isValid && password.length != 0,
        "is-valid": isValid
      };
};

const user = computed(() => {
    return authStore.user;
});

const displayName = computed(() => {
  if (!user.value) return '';
  if (user.value.name.length === 0) return user.value.username;
  return user.value.name;
});


</script>

<style scoped>
.remove-top-border {
  border: none !important;
}

.fa {
  margin: 0;
  padding: 2px;
}

.edit-icon:hover {
  color: green;
}

.delete-icon:hover {
  color: red;
}
</style>
